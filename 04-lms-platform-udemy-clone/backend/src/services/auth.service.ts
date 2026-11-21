import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { db } from '../database/db';
import { User, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'studyo_lms_jwt_secret_default_2026';

export class AuthService {
  public register(
    email: string,
    password: string,
    fullName: string,
    role: Role = 'STUDENT'
  ): User {
    const norm = email.trim().toLowerCase();
    for (const u of db.users.values()) {
      if (u.email === norm) {
        throw new Error('User with this email already exists');
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user: User = {
      id: randomUUID(),
      email: norm,
      passwordHash,
      fullName,
      role,
      createdAt: new Date().toISOString(),
    };

    db.users.set(user.id, user);
    return user;
  }

  public authenticate(email: string, password: string): User {
    const norm = email.trim().toLowerCase();
    const user = Array.from(db.users.values()).find(u => u.email === norm);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  public generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  public verifyToken(token: string): { userId: string; email: string; role: Role } {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: Role };
  }
}

export const authService = new AuthService();
