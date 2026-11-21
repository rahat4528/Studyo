import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { User, SchoolRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'studyo_course_jwt_secret_default_2026';

export class AuthService {
  public static async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const norm = email.trim().toLowerCase();
    for (const u of db.users.values()) {
      if (u.email === norm) {
        throw new Error('User already exists');
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user: User = {
      id: uuidv4(),
      email: norm,
      passwordHash,
      fullName,
      createdAt: new Date().toISOString()
    };

    db.users.set(user.id, user);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const norm = email.trim().toLowerCase();
    let found: User | undefined;

    for (const u of db.users.values()) {
      if (u.email === norm) {
        found = u;
        break;
      }
    }

    if (!found || !bcrypt.compareSync(password, found.passwordHash)) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: found.id, email: found.email }, JWT_SECRET, { expiresIn: '24h' });
    const { passwordHash: _, ...safeUser } = found;
    return { user: safeUser, token };
  }

  public static verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
