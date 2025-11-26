import { SubscriptionBundle, BundleTier, BillingCycle } from '../../domain/entities/SubscriptionBundle';
import { ISubscriptionBundleRepository } from '../../domain/repositories/ISubscriptionBundleRepository';
import { Database } from '../database/Database';
import { randomUUID } from 'crypto';

export class SubscriptionBundleRepository implements ISubscriptionBundleRepository {
  private db = Database.getInstance();

  async create(
    bundle: Omit<SubscriptionBundle, 'id' | 'createdAt' | 'updatedAt' | 'messagesUsed'>
  ): Promise<SubscriptionBundle> {
    const id = randomUUID();
    const result = await this.db.query(
      `INSERT INTO subscription_bundles 
       (id, user_id, tier, billing_cycle, max_messages, price, start_date, end_date, renewal_date, auto_renew, is_active, messages_used, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, NOW(), NOW()) 
       RETURNING *`,
      [
        id,
        bundle.userId,
        bundle.tier,
        bundle.billingCycle,
        bundle.maxMessages,
        bundle.price,
        bundle.startDate,
        bundle.endDate,
        bundle.renewalDate,
        bundle.autoRenew,
        bundle.isActive,
      ]
    );
    return this.mapToSubscriptionBundle(result.rows[0]);
  }

  async findById(id: string): Promise<SubscriptionBundle | null> {
    const result = await this.db.query('SELECT * FROM subscription_bundles WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToSubscriptionBundle(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<SubscriptionBundle[]> {
    const result = await this.db.query(
      'SELECT * FROM subscription_bundles WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.mapToSubscriptionBundle(row));
  }

  async findActiveByUserId(userId: string): Promise<SubscriptionBundle[]> {
    const result = await this.db.query(
      'SELECT * FROM subscription_bundles WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map((row) => this.mapToSubscriptionBundle(row));
  }

  async findLatestActiveWithQuota(userId: string): Promise<SubscriptionBundle | null> {
    const result = await this.db.query(
      `SELECT * FROM subscription_bundles 
       WHERE user_id = $1 AND is_active = true 
       AND (max_messages = -1 OR messages_used < max_messages)
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) return null;
    return this.mapToSubscriptionBundle(result.rows[0]);
  }

  async update(bundle: SubscriptionBundle): Promise<SubscriptionBundle> {
    await this.db.query(
      `UPDATE subscription_bundles 
       SET tier = $2, billing_cycle = $3, max_messages = $4, price = $5, start_date = $6, 
           end_date = $7, renewal_date = $8, auto_renew = $9, is_active = $10, 
           messages_used = $11, updated_at = NOW() 
       WHERE id = $1`,
      [
        bundle.id,
        bundle.tier,
        bundle.billingCycle,
        bundle.maxMessages,
        bundle.price,
        bundle.startDate,
        bundle.endDate,
        bundle.renewalDate,
        bundle.autoRenew,
        bundle.isActive,
        bundle.messagesUsed,
      ]
    );
    return bundle;
  }

  async updateMessagesUsed(bundleId: string, messagesUsed: number): Promise<void> {
    await this.db.query('UPDATE subscription_bundles SET messages_used = $1, updated_at = NOW() WHERE id = $2', [
      messagesUsed,
      bundleId,
    ]);
  }

  private mapToSubscriptionBundle(row: any): SubscriptionBundle {
    return new SubscriptionBundle(
      row.id,
      row.user_id,
      row.tier as BundleTier,
      row.billing_cycle as BillingCycle,
      row.max_messages,
      parseFloat(row.price),
      row.start_date,
      row.end_date,
      row.renewal_date,
      row.auto_renew,
      row.is_active,
      row.messages_used,
      row.created_at,
      row.updated_at
    );
  }
}

