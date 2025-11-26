import { ISubscriptionBundleRepository } from '../../domain/repositories/ISubscriptionBundleRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { SubscriptionBundle, BundleTier, BillingCycle } from '../../domain/entities/SubscriptionBundle';
import { NotFoundError, ValidationError } from '../../domain/errors/AppError';
import { addMonths, addYears, isBefore } from 'date-fns';

export interface CreateSubscriptionDto {
  userId: string;
  tier: BundleTier;
  billingCycle: BillingCycle;
  autoRenew: boolean;
}

export class SubscriptionService {
  private readonly TIER_CONFIG = {
    [BundleTier.BASIC]: { maxMessages: 10, monthlyPrice: 9.99, yearlyPrice: 99.99 },
    [BundleTier.PRO]: { maxMessages: 100, monthlyPrice: 29.99, yearlyPrice: 299.99 },
    [BundleTier.ENTERPRISE]: { maxMessages: -1, monthlyPrice: 99.99, yearlyPrice: 999.99 }, // -1 = unlimited
  };

  constructor(
    private subscriptionBundleRepository: ISubscriptionBundleRepository,
    private userRepository: IUserRepository
  ) {}

  async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionBundle> {
    // Verify user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Validate tier
    if (!Object.values(BundleTier).includes(dto.tier)) {
      throw new ValidationError(`Invalid tier. Must be one of: ${Object.values(BundleTier).join(', ')}`);
    }

    // Validate billing cycle
    if (!Object.values(BillingCycle).includes(dto.billingCycle)) {
      throw new ValidationError(
        `Invalid billing cycle. Must be one of: ${Object.values(BillingCycle).join(', ')}`
      );
    }

    const config = this.TIER_CONFIG[dto.tier];
    const price = dto.billingCycle === BillingCycle.MONTHLY ? config.monthlyPrice : config.yearlyPrice;
    const startDate = new Date();
    const endDate =
      dto.billingCycle === BillingCycle.MONTHLY
        ? addMonths(startDate, 1)
        : addYears(startDate, 1);
    const renewalDate = dto.autoRenew ? endDate : null;

    const bundle = await this.subscriptionBundleRepository.create({
      userId: dto.userId,
      tier: dto.tier,
      billingCycle: dto.billingCycle,
      maxMessages: config.maxMessages,
      price,
      startDate,
      endDate,
      renewalDate,
      autoRenew: dto.autoRenew,
      isActive: true,
    });

    return bundle;
  }

  async getUserSubscriptions(userId: string): Promise<SubscriptionBundle[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return this.subscriptionBundleRepository.findByUserId(userId);
  }

  async getActiveSubscriptions(userId: string): Promise<SubscriptionBundle[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return this.subscriptionBundleRepository.findActiveByUserId(userId);
  }

  async cancelSubscription(bundleId: string, userId: string): Promise<SubscriptionBundle> {
    const bundle = await this.subscriptionBundleRepository.findById(bundleId);
    if (!bundle) {
      throw new NotFoundError('Subscription bundle');
    }

    if (bundle.userId !== userId) {
      throw new ValidationError('You can only cancel your own subscriptions');
    }

    // Cancel: ends current billing cycle, prevents renewal
    const updatedBundle = new SubscriptionBundle(
      bundle.id,
      bundle.userId,
      bundle.tier,
      bundle.billingCycle,
      bundle.maxMessages,
      bundle.price,
      bundle.startDate,
      bundle.endDate,
      null, // Remove renewal date
      false, // Disable auto-renew
      bundle.isActive, // Keep active until endDate
      bundle.messagesUsed,
      bundle.createdAt,
      bundle.updatedAt
    );

    return this.subscriptionBundleRepository.update(updatedBundle);
  }

  async processAutoRenewals(): Promise<void> {
    const now = new Date();
    // This would typically be called by a cron job
    // For now, we'll implement the logic
    // In production, you'd query for bundles where renewalDate <= now and autoRenew = true
  }

  async simulateBillingCycle(): Promise<void> {
    // Simulate billing logic - check for subscriptions that need renewal
    const now = new Date();
    // This is a simplified version - in production you'd have a more sophisticated query
    // For demonstration, we'll randomly mark some subscriptions as inactive (simulating payment failure)
  }

  async checkAndRenewSubscription(bundleId: string): Promise<SubscriptionBundle | null> {
    const bundle = await this.subscriptionBundleRepository.findById(bundleId);
    if (!bundle || !bundle.autoRenew) {
      return null;
    }

    const now = new Date();
    if (bundle.renewalDate && isBefore(bundle.renewalDate, now) && bundle.isActive) {
      // Simulate payment - randomly fail 10% of the time
      const paymentSucceeds = Math.random() > 0.1;

      if (!paymentSucceeds) {
        // Payment failed - mark as inactive
        const inactiveBundle = new SubscriptionBundle(
          bundle.id,
          bundle.userId,
          bundle.tier,
          bundle.billingCycle,
          bundle.maxMessages,
          bundle.price,
          bundle.startDate,
          bundle.endDate,
          null,
          false,
          false,
          bundle.messagesUsed,
          bundle.createdAt,
          bundle.updatedAt
        );
        return this.subscriptionBundleRepository.update(inactiveBundle);
      }

      // Payment succeeded - renew subscription
      const newStartDate = bundle.endDate;
      const newEndDate =
        bundle.billingCycle === BillingCycle.MONTHLY
          ? addMonths(newStartDate, 1)
          : addYears(newStartDate, 1);
      const newRenewalDate = bundle.autoRenew ? newEndDate : null;

      const renewedBundle = new SubscriptionBundle(
        bundle.id,
        bundle.userId,
        bundle.tier,
        bundle.billingCycle,
        bundle.maxMessages,
        bundle.price,
        newStartDate,
        newEndDate,
        newRenewalDate,
        bundle.autoRenew,
        true,
        0, // Reset usage for new billing cycle
        bundle.createdAt,
        bundle.updatedAt
      );

      return this.subscriptionBundleRepository.update(renewedBundle);
    }

    return null;
  }
}

