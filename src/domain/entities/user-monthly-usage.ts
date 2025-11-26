export class UserMonthlyUsage {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly year: number,
    public readonly month: number,
    public readonly messagesUsed: number,
    public readonly lastResetDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  get remainingFreeQuota(): number {
    return Math.max(0, 3 - this.messagesUsed);
  }

  canUseFreeQuota(): boolean {
    return this.remainingFreeQuota > 0;
  }
}

