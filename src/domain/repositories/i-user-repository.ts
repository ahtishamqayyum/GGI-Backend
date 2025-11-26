import { User } from '../entities/user';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
}

