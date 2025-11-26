import { ChatMessage } from '../entities/chat-message';

export interface IChatMessageRepository {
  create(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  findByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
}

