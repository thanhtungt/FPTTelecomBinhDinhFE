import api from './client';
import type { ChatSession, ChatMessage, StartChatDto } from '../types/chat';

export const chatApi = {
  // Start a new chat session
  startChat: async (dto: StartChatDto): Promise<ChatSession> => {
    const response = await api.post<ChatSession>('/Chat/start', dto);
    return response.data;
  },

  // Get chat session by sessionId
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get<ChatSession>(`/Chat/session/${sessionId}`);
    return response.data;
  },

  // Get messages of a session
  getMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/Chat/session/${sessionId}/messages`);
    return response.data;
  },

  // Get user's chat sessions (authenticated)
  getMySessions: async (): Promise<ChatSession[]> => {
    const response = await api.get<ChatSession[]>('/Chat/my-sessions');
    return response.data;
  },

  // Get all chat sessions (Admin/Staff only)
  getAllSessions: async (status?: string): Promise<ChatSession[]> => {
    const params = status ? { status } : {};
    const response = await api.get<ChatSession[]>('/Chat/sessions', { params });
    return response.data;
  },

  // Close chat session (Admin/Staff only)
  closeSession: async (sessionId: string): Promise<void> => {
    await api.put(`/Chat/session/${sessionId}/close`);
  },

  // Close chat session by user (Public)
  closeSessionByUser: async (sessionId: string): Promise<void> => {
    await api.put(`/Chat/session/${sessionId}/close-by-user`);
  },
};
