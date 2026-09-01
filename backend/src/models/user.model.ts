import { query } from '../config/database';
import type { RegisterDto } from '../validators/auth.validator';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
}

export const UserModel = {
  findByEmail: async (email: string): Promise<User | null> => {
    const { rows } = await query<User>(
      `
        SELECT
          id,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          password_hash AS "passwordHash",
          role,
          email_verified AS "emailVerified",
          created_at AS "createdAt"
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [email]
    );

    return rows[0] ?? null;
  },

  findById: async (id: string): Promise<User | null> => {
    const { rows } = await query<User>(
      `
        SELECT
          id,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          role,
          email_verified AS "emailVerified",
          created_at AS "createdAt"
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  },

  create: async (data: RegisterDto): Promise<User> => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(data.password, rounds);

    const { rows } = await query<User>(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          password_hash AS "passwordHash",
          role,
          email_verified AS "emailVerified",
          created_at AS "createdAt"
      `,
      [data.firstName, data.lastName, data.email, passwordHash]
    );

    return rows[0];
  },

  verifyPassword: async (plainText: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(plainText, hash);
  },
  updatePassword: async (id: string, passwordHash: string): Promise<void> => {
    await query(
      `
        UPDATE users
        SET password_hash = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
      [passwordHash, id]
    );
  },
};
