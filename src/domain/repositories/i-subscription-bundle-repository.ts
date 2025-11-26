import { SubscriptionBundle, BundleTier, BillingCycle } from '../entities/subscription-bundle';

export interface ISubscriptionBundleRepository {
  create(
    bundle: Omit<
      SubscriptionBundle,
      'id' | 'createdAt' | 'updatedAt' | 'messagesUsed'
    >
  ): Promise<SubscriptionBundle>;
  findById(id: string): Promise<SubscriptionBundle | null>;
  findByUserId(userId: string): Promise<SubscriptionBundle[]>;
  findActiveByUserId(userId: string): Promise<SubscriptionBundle[]>;
  findLatestActiveWithQuota(userId: string): Promise<SubscriptionBundle | null>;
  update(bundle: SubscriptionBundle): Promise<SubscriptionBundle>;
  updateMessagesUsed(bundleId: string, messagesUsed: number): Promise<void>;
}

