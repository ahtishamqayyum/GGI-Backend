import { UserMonthlyUsage } from '../../domain/entities/user-monthly-usage';
import { IUserMonthlyUsageRepository } from '../../domain/repositories/i-user-monthly-usage-repository';
import { Database } from '../database/database';
import { randomUUID } from 'crypto';

export class UserMonthlyUsageRepository implements IUserMonthlyUsageRepository {
  private db = Database.getInstance();

  async findByUserIdAndMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<UserMonthlyUsage | null> {
    const result = await this.db.query(
      'SELECT * FROM user_monthly_usage WHERE user_id = $1 AND year = $2 AND month = $3',
      [userId, year, month]
    );
    if (result.rows.length === 0) return null;
    return this.mapToUserMonthlyUsage(result.rows[0]);
  }

  async create(
    usage: Omit<UserMonthlyUsage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserMonthlyUsage> {
    const id = randomUUID();
    const result = await this.db.query(
      `INSERT INTO user_monthly_usage 
       (id, user_id, year, month, messages_used, last_reset_date, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [id, usage.userId, usage.year, usage.month, usage.messagesUsed, usage.lastResetDate]
    );
    return this.mapToUserMonthlyUsage(result.rows[0]);
  }

  async update(usage: UserMonthlyUsage): Promise<UserMonthlyUsage> {
    await this.db.query(
      `UPDATE user_monthly_usage 
       SET messages_used = $2, last_reset_date = $3, updated_at = NOW() 
       WHERE id = $1`,
      [usage.id, usage.messagesUsed, usage.lastResetDate]
    );
    return usage;
  }

  async resetMonthlyQuota(userId: string, year: number, month: number): Promise<void> {
    await this.db.query(
      `UPDATE user_monthly_usage 
       SET messages_used = 0, last_reset_date = NOW(), updated_at = NOW() 
       WHERE user_id = $1 AND year = $2 AND month = $3`,
      [userId, year, month]
    );
  }

  private mapToUserMonthlyUsage(row: any): UserMonthlyUsage {
    return new UserMonthlyUsage(
      row.id,
      row.user_id,
      row.year,
      row.month,
      row.messages_used,
      row.last_reset_date,
      row.created_at,
      row.updated_at
    );
  }
}

