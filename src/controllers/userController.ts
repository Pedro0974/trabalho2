// src/controllers/userController.ts
import { Request, Response } from 'express';
import userService from '../services/userService';
import User from '../models/User';
import bcrypt from 'bcrypt';

class UserController {
  async register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    const existingUser = await userService.findByUsername(username);

    if (existingUser) {
      res.status(400).json({ error: 'Username is already taken' });
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        id: '', // O ID será gerado automaticamente pelo PostgreSQL
        username,
        email,
        password_hash: hashedPassword,
      };

      const userId = await userService.createUser(newUser);

      res.json({ userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new UserController();
