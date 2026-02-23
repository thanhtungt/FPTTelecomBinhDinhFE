import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import { chatApi } from '../../api/chat';
import type { ChatMessage, SendMessageDto, StartChatDto } from '../../types/chat';
import ConfirmDialog from './ConfirmDialog';
import './Chatbot.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://localhost:7086/api';
const HUB_URL = API_BASE_URL.replace('/api', '') + '/hubs/chat';

interface ChatbotProps {
  onClose: () => void;
  onMinimize: () => void;
}

const Chatbot = ({ onClose, onMinimize }: ChatbotProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showUserForm, setShowUserForm] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectToHub = useCallback(async (sessionIdValue: string) => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveMessage', (message: ChatMessage) => {
        console.log('Received message:', message);
        setMessages((prev) => [...prev, message]);
      });

      connection.on('StaffConnected', (data: { staffName: string; connectedAt: string }) => {
        console.log('Staff connected:', data);
        const systemMessage: ChatMessage = {
          id: Date.now(),
          sessionId: sessionIdValue,
          senderName: 'Hệ thống',
          senderType: 'system',
          message: `Tư vấn viên **${data.staffName}** đã kết nối và sẵn sàng hỗ trợ bạn!`,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        setMessages((prev) => [...prev, systemMessage]);
      });

      connection.on('StaffAssigned', (data: { staffName: string; assignedAt: string }) => {
        console.log('Staff assigned:', data);
      });

      connection.on('SessionClosed', (data: { sessionId: string; closedBy: string; closedAt: string }) => {
        console.log('Session closed:', data);
        if (data.closedBy === 'staff') {
          alert('Tư vấn viên đã đóng cuộc trò chuyện. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!');
          onClose();
        }
      });

      await connection.start();
      console.log('SignalR Connected');
      setIsConnected(true);

      // Join the chat session
      await connection.invoke('JoinChatSession', sessionIdValue);
      console.log('Joined chat session:', sessionIdValue);

      connectionRef.current = connection;
    } catch (error) {
      console.error('Error connecting to SignalR:', error);
      setIsConnected(false);
    }
  }, []);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }

    setIsLoading(true);
    try {
      const dto: StartChatDto = {
        userName: userName.trim(),
        userEmail: userEmail.trim() || undefined,
        userPhone: userPhone.trim() || undefined,
        initialMessage: 'Xin chào!',
      };

      const session = await chatApi.startChat(dto);
      setSessionId(session.sessionId);
      setShowUserForm(false);

      // Connect to SignalR
      await connectToHub(session.sessionId);

      // Load existing messages
      const existingMessages = await chatApi.getMessages(session.sessionId);
      setMessages(existingMessages);
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Không thể bắt đầu chat. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !connectionRef.current) return;

    if (connectionRef.current.state !== HubConnectionState.Connected) {
      alert('Kết nối đã mất. Vui lòng tải lại trang!');
      return;
    }

    try {
      const messageDto: SendMessageDto = {
        sessionId,
        message: inputMessage.trim(),
        senderName: userName,
        senderEmail: userEmail || undefined,
      };

      await connectionRef.current.invoke('SendMessage', messageDto);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  // Cleanup connection on unmount
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  const handleMinimize = () => {
    // Just minimize the UI, keep the session alive
    // Don't disconnect SignalR
    onMinimize();
  };

  const handleCloseChat = async () => {
    if (!sessionId) {
      onClose();
      return;
    }
// Show confirm dialog instead of window.confirm
    setShowConfirmDialog(true);
  };

  const confirmCloseChat = async () => {
    setShowConfirmDialog(false);
    setIsClosing(true);
    try {
      // Close session via API (using user endpoint)
      await chatApi.closeSessionByUser(sessionId);
      
      // Disconnect SignalR
      if (connectionRef.current) {
        await connectionRef.current.stop();
      }
      
      // Close the chatbot
      onClose();
    } catch (error) {
      console.error('Error closing chat session:', error);
      alert('Không thể đóng chat. Vui lòng thử lại!');
    } finally {
      setIsClosing(false);
    }
  };

  const cancelCloseChat = () => {
    setShowConfirmDialog(false);
    setIsClosing(false);
  };

  const renderMessage = (msg: ChatMessage) => {
    const isUser = msg.senderType === 'user';
    const isBot = msg.senderType === 'bot';
    const isStaff = msg.senderType === 'admin' || msg.senderType === 'staff';

    return (
      <div
        key={msg.id}
        className={`chat-message ${isUser ? 'user-message' : isBot ? 'bot-message' : isStaff ? 'staff-message' : 'system-message'}`}
      >
        <div className="message-header">
          <span className="sender-name">{msg.senderName}</span>
          <span className="message-time">
            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div
          className="message-content"
          dangerouslySetInnerHTML={{
            __html: msg.message
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br/>'),
          }}
        />
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-icon">💬</div>
          <div className="header-text">
            <h3>FPT Telecom Support</h3>
            <p className="status">
              {isConnected ? (
                <>
                  <span className="status-dot online"></span> Đang kết nối
                </>
              ) : (
                <>
                  <span className="status-dot offline"></span> Ngoại tuyến
                </>
              )}
            </p>
          </div>
        </div>
        <div className="header-buttons">
          {!showUserForm && (
            <button 
              className="minimize-button" 
              onClick={handleMinimize} 
              aria-label="Thu nhỏ chat"
              title="Thu nhỏ"
            >
              −
            </button>
          )}
          <button 
            className="close-button" 
            onClick={handleCloseChat} 
            aria-label="Đóng chat"
            title="Đóng chat"
            disabled={isClosing}
          >
            ✕
          </button>
        </div>
      </div>

      {showUserForm ? (
        <div className="chat-user-form">
          <div className="form-header">
            <h4>Chào mừng bạn đến với FPT Telecom!</h4>
            <p>Vui lòng cho chúng tôi biết thông tin của bạn để bắt đầu chat</p>
          </div>
          <form onSubmit={startChat}>
            <div className="form-group">
              <label htmlFor="userName">
                Tên của bạn <span className="required">*</span>
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nhập tên của bạn"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userEmail">Email (tùy chọn)</label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@example.com"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="userPhone">Số điện thoại (tùy chọn)</label>
              <input
                type="tel"
                id="userPhone"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="0901234567"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="start-chat-button" disabled={isLoading}>
              {isLoading ? 'Đang kết nối...' : 'Bắt đầu chat'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-messages">
                <p>Chưa có tin nhắn nào</p>
              </div>
            ) : (
              messages.map((msg) => renderMessage(msg))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn của bạn..."
                disabled={!isConnected}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputMessage.trim()}
                className="send-button"
                aria-label="Gửi tin nhắn"
              >
                ➤
              </button>
            </form>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Đóng đoạn chat"
        message={`Bạn có chắc muốn đóng đoạn chat này?

Sau khi đóng, bạn sẽ không thể tiếp tục chat và cuộc trò chuyện sẽ kết thúc.`}
        confirmText="Đóng chat"
        cancelText="Hủy"
        onConfirm={confirmCloseChat}
        onCancel={cancelCloseChat}
      />
    </div>
  );
};

export default Chatbot;
