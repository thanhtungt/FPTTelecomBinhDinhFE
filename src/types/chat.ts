export interface ChatMessage {
  id: number;
  sessionId: string;
  senderName: string;
  senderType: 'user' | 'bot' | 'admin' | 'staff' | 'system';
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface SendMessageDto {
  sessionId: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
}

export interface StartChatDto {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  initialMessage: string;
}

export interface ChatSession {
  id: number;
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  assignedStaffName?: string;
  status: 'bot' | 'waiting' | 'active' | 'resolved' | 'closed';
  createdAt: string;
  lastMessageAt?: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
}
