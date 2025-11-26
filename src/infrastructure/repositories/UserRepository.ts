import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Database } from '../database/Database';

export class UserRepository implements IUserRepository {
  private db = Database.getInstance();

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (id, email, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
      [user.id, user.email]
    );
    return this.mapToUser(result.rows[0]);
  }

  private mapToUser(row: any): User {
    return new User(row.id, row.email, row.created_at, row.updated_at);
  }
}

