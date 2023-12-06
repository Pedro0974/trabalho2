// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userService from '../services/userService';

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const user = await userService.findByUsername(username);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  }
}

export default new AuthController();
