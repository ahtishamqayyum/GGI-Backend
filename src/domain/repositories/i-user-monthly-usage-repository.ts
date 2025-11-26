import { UserMonthlyUsage } from '../entities/user-monthly-usage';

export interface IUserMonthlyUsageRepository {
  findByUserIdAndMonth(
    userId: string,
    year: number,
    month: number
  ): Promise<UserMonthlyUsage | null>;
  create(
    usage: Omit<UserMonthlyUsage, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserMonthlyUsage>;
  update(usage: UserMonthlyUsage): Promise<UserMonthlyUsage>;
  resetMonthlyQuota(userId: string, year: number, month: number): Promise<void>;
}

