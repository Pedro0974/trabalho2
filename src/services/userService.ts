// src/services/userService.ts
import connection from '../connection';
import User from '../models/User';
import bcrypt from 'bcrypt';

class UserService {
  async findByUsername(username: string): Promise<User | null> {
    const user = await connection('users').where({ username }).first();
    return user || null;
  }

  async createUser(user: User): Promise<string> {
    // Hash the password before saving to the database
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
    
    const [createdUserId] = await connection('users').insert(user, 'id');
    return createdUserId;
  }
}

export default new UserService();
