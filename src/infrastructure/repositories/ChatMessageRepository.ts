import { ChatMessage } from '../../domain/entities/ChatMessage';
import { IChatMessageRepository } from '../../domain/repositories/IChatMessageRepository';
import { Database } from '../database/Database';
import { randomUUID } from 'crypto';

export class ChatMessageRepository implements IChatMessageRepository {
  private db = Database.getInstance();

  async create(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const id = randomUUID();
    const result = await this.db.query(
      'INSERT INTO chat_messages (id, user_id, question, answer, tokens_used, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [id, message.userId, message.question, message.answer, message.tokensUsed]
    );
    return this.mapToChatMessage(result.rows[0]);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const result = await this.db.query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows.map((row) => this.mapToChatMessage(row));
  }

  private mapToChatMessage(row: any): ChatMessage {
    return new ChatMessage(
      row.id,
      row.user_id,
      row.question,
      row.answer,
      row.tokens_used,
      row.created_at
    );
  }
}

