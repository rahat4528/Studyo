import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { User, Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'studyo_quiz_jwt_secret_default_2026';

export class AuthService {
  public static async register(
    email: string,
    password: string,
    fullName: string,
    role: Role = 'STUDENT'
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    for (const u of db.users.values()) {
      if (u.email === normalizedEmail) {
        throw new Error('User with this email already exists');
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user: User = {
      id: uuidv4(),
      email: normalizedEmail,
      passwordHash,
      fullName,
      role,
      createdAt: new Date().toISOString()
    };

    db.users.set(user.id, user);

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '24h'
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  public static async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    let foundUser: User | undefined;

    for (const u of db.users.values()) {
      if (u.email === normalizedEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const isValid = bcrypt.compareSync(password, foundUser.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, role: foundUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userWithoutPassword } = foundUser;
    return { user: userWithoutPassword, token };
  }

  public static verifyToken(token: string): { userId: string; email: string; role: Role } {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: Role };
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
