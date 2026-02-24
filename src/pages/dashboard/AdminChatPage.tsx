import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import { chatApi } from '../../api/chat';
import type { ChatSession, ChatMessage, SendMessageDto } from '../../types/chat';
import './AdminChatPage.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://localhost:7086/api';
const HUB_URL = API_BASE_URL.replace('/api', '') + '/hubs/chat';

const AdminChatPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = useCallback(async () => {
    try {
      const filterStatus = statusFilter === 'all' ? undefined : statusFilter;
      const data = await chatApi.getAllSessions(filterStatus);
      setSessions(data);
    } catch (error) {
      // Error loading sessions
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  const connectToHub = useCallback(async () => {
    try {
      const connection = new HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => {
            const authData = localStorage.getItem('fpttelecom-auth');
            if (authData) {
              const parsed = JSON.parse(authData);
              return parsed.token || '';
            }
            return '';
          }
        })
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveMessage', (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        
        // Update session list
        loadSessions();
      });

      connection.on('NewStaffRequest', (data: {
        sessionId: string;
        userName: string;
        userEmail?: string;
        userPhone?: string;
        message: string;
        createdAt: string;
      }) => {
        console.log('New staff request:', data);
        // Reload sessions to show new request
        loadSessions();
        
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification('Yêu cầu hỗ trợ mới', {
            body: `${data.userName}: ${data.message}`,
            icon: '/favicon.ico'
          });
        }
      });

      connection.on('StaffConnected', () => {
        loadSessions();
      });

      connection.on('StaffAssigned', (data: { staffName: string; assignedAt: string }) => {
        console.log('Staff assigned:', data);
        // Just reload sessions list, selectedSession is already updated in handleAssignToMe
        loadSessions();
      });

      connection.on('SessionClosed', (data: { sessionId: string; closedBy: string; closedAt: string }) => {
        console.log('Session closed:', data);
        // Update selected session if it's the current one
        if (selectedSession?.sessionId === data.sessionId) {
          setSelectedSession((prev) => 
            prev ? { ...prev, status: 'closed' } : null
          );
        }
        // Reload sessions list
        loadSessions();
      });

      connection.on('SessionClosedByUser', (data: { sessionId: string; closedAt: string }) => {
        console.log('Session closed by user:', data);
        // Update selected session if it's the current one
        if (selectedSession?.sessionId === data.sessionId) {
          setSelectedSession((prev) => 
            prev ? { ...prev, status: 'closed' } : null
          );
        }
        // Reload sessions list
        loadSessions();
      });

      await connection.start();
      console.log('SignalR Connected for Admin/Staff');
      setIsConnected(true);

      connectionRef.current = connection;
    } catch (error) {
      setIsConnected(false);
    }
  }, [loadSessions]);

  useEffect(() => {
    loadSessions();
    connectToHub();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [loadSessions, connectToHub]);

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    
    try {
      const msgs = await chatApi.getMessages(session.sessionId);
      setMessages(msgs);

      // Join the session
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        await connectionRef.current.invoke('JoinChatSession', session.sessionId);
        
        // Mark messages as read
        await connectionRef.current.invoke('MarkAsRead', session.sessionId);
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedSession || !connectionRef.current) return;

    try {
      if (connectionRef.current.state === HubConnectionState.Connected) {
        await connectionRef.current.invoke('AssignToSession', selectedSession.sessionId);
        
        // Update selected session status immediately
        setSelectedSession((prev) => 
          prev ? { ...prev, status: 'active' } : null
        );
        
        // Reload sessions list to reflect changes
        loadSessions();
      }
    } catch (error) {
      console.error('Error assigning session:', error);
      alert('Không thể nhận chat này!');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSession || !connectionRef.current) return;

    if (connectionRef.current.state !== HubConnectionState.Connected) {
      alert('Kết nối đã mất. Vui lòng tải lại trang!');
      return;
    }

    try {
      const messageDto: SendMessageDto = {
        sessionId: selectedSession.sessionId,
        message: inputMessage.trim(),
      };

      await connectionRef.current.invoke('SendMessage', messageDto);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Không thể gửi tin nhắn!');
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;

    if (!confirm('Bạn có chắc muốn đóng chat session này?')) return;

    try {
      await chatApi.closeSession(selectedSession.sessionId);
      setSelectedSession(null);
      setMessages([]);
      loadSessions();
      alert('Đã đóng chat session!');
    } catch (error) {
      console.error('Error closing session:', error);
      alert('Không thể đóng session!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      bot: { label: 'Bot', color: '#8e44ad' },
      waiting: { label: 'Chờ', color: '#f39c12' },
      active: { label: 'Đang chat', color: '#27ae60' },
      resolved: { label: 'Đã giải quyết', color: '#3498db' },
      closed: { label: 'Đã đóng', color: '#95a5a6' },
    };

    const info = statusMap[status] || { label: status, color: '#95a5a6' };
    return (
      <span className="status-badge" style={{ backgroundColor: info.color }}>
        {info.label}
      </span>
    );
  };

  const renderMessage = (msg: ChatMessage) => {
    const isStaff = msg.senderType === 'admin' || msg.senderType === 'staff';
    const isBot = msg.senderType === 'bot';
    const isSystem = msg.senderType === 'system';

    return (
      <div
        key={msg.id}
        className={`admin-chat-message ${isStaff ? 'staff-message' : isBot ? 'bot-message' : isSystem ? 'system-message' : 'user-message'}`}
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
    <div className="admin-chat-page">
      <div className="admin-chat-header">
        <h1>Hỗ trợ Chat</h1>
        <div className="connection-status">
          {isConnected ? (
            <>
              <span className="status-dot online"></span> Đang kết nối
            </>
          ) : (
            <>
              <span className="status-dot offline"></span> Ngoại tuyến
            </>
          )}
        </div>
      </div>

      <div className="admin-chat-container">
        {/* Sessions List */}
        <div className="chat-sessions-panel">
          <div className="sessions-header">
            <h2>Danh sách Chat</h2>
            <button className="refresh-btn" onClick={loadSessions}>
              🔄
            </button>
          </div>

          <div className="sessions-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả</option>
              <option value="bot">Bot</option>
              <option value="waiting">Chờ hỗ trợ</option>
              <option value="active">Đang chat</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          <div className="sessions-list">
            {isLoading ? (
              <div className="sessions-loading">Đang tải...</div>
            ) : sessions.length === 0 ? (
              <div className="sessions-empty">Không có chat nào</div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`session-item ${selectedSession?.sessionId === session.sessionId ? 'active' : ''}`}
                  onClick={() => handleSelectSession(session)}
                >
                  <div className="session-header">
                    <span className="session-user">{session.userName || 'Anonymous'}</span>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="session-info">
                    {session.userEmail && (
                      <div className="session-detail">📧 {session.userEmail}</div>
                    )}
                    {session.userPhone && (
                      <div className="session-detail">📱 {session.userPhone}</div>
                    )}
                  </div>
                  {session.lastMessage && (
                    <div className="session-last-message">
                      {session.lastMessage.message.substring(0, 50)}...
                    </div>
                  )}
                  {session.unreadCount > 0 && (
                    <span className="unread-badge">{session.unreadCount}</span>
                  )}
                  <div className="session-time">
                    {new Date(session.lastMessageAt || session.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="chat-box-panel">
          {selectedSession ? (
            <>
              <div className="chat-box-header">
                <div className="chat-box-info">
                  <h3>{selectedSession.userName || 'Anonymous'}</h3>
                  <div className="chat-box-details">
                    {selectedSession.userEmail && <span>📧 {selectedSession.userEmail}</span>}
                    {selectedSession.userPhone && <span>📱 {selectedSession.userPhone}</span>}
                  </div>
                </div>
                <div className="chat-box-actions">
                  {selectedSession.status === 'waiting' && (
                    <button className="assign-btn" onClick={handleAssignToMe}>
                      Nhận chat
                    </button>
                  )}
                  {(selectedSession.status === 'active' || selectedSession.status === 'resolved') && (
                    <button className="close-btn" onClick={handleCloseSession}>
                      ✕ Đóng
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-messages-box">
                {messages.length === 0 ? (
                  <div className="messages-empty">Chưa có tin nhắn</div>
                ) : (
                  messages.map((msg) => renderMessage(msg))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-box">
                <form onSubmit={sendMessage} className="chat-input-form">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      selectedSession.status === 'waiting'
                        ? 'Nhấn "Nhận chat" để bắt đầu...'
                        : selectedSession.status === 'closed'
                        ? 'Chat đã đóng'
                        : 'Nhập tin nhắn...'
                    }
                    disabled={!isConnected || selectedSession.status === 'closed' || selectedSession.status === 'waiting'}
                    className="chat-input"
                  />
                  <button
                    type="submit"
                    disabled={
                      !isConnected ||
                      !inputMessage.trim() ||
                      selectedSession.status === 'closed' ||
                      selectedSession.status === 'waiting'
                    }
                    className="send-button"
                  >
                    ➤
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-session-selected">
              <div className="no-session-icon">💬</div>
              <p>Chọn một chat để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
