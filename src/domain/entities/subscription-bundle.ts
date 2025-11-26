export enum BundleTier {
  BASIC = 'Basic',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class SubscriptionBundle {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tier: BundleTier,
    public readonly billingCycle: BillingCycle,
    public readonly maxMessages: number,
    public readonly price: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly renewalDate: Date | null,
    public readonly autoRenew: boolean,
    public readonly isActive: boolean,
    public readonly messagesUsed: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get remainingQuota(): number {
    // -1 means unlimited (Enterprise tier)
    if (this.maxMessages === -1) {
      return Infinity;
    }
    return Math.max(0, this.maxMessages - this.messagesUsed);
  }

  canUse(): boolean {
    if (!this.isActive) return false;
    // -1 means unlimited (Enterprise tier)
    if (this.maxMessages === -1) return true;
    return this.remainingQuota > 0;
  }
}

