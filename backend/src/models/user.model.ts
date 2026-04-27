import { query } from '../config/database';

export type UserRole = 'user' | 'admin';

export type UserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  address: string | null;
  role: UserRole;
  reset_token: string | null;
  reset_token_expires: Date | null;
  created_at: Date;
  deleted_at: Date | null;
  updated_at: Date;
  image: string | null;
};

export type PublicUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  address?: string | null;
  role?: UserRole;
  image?: string | null;
};

export const toPublicUser = (row: UserRow): PublicUser => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  address: row.address,
  role: row.role,
  image: row.image,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createUser = async (input: CreateUserInput): Promise<PublicUser> => {
  const result = await query<UserRow>(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        address,
        role,
        image
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      input.firstName,
      input.lastName,
      input.email,
      input.passwordHash,
      input.address ?? null,
      input.role ?? 'user',
      input.image ?? null,
    ]
  );

  return toPublicUser(result.rows[0]);
};

export const findUserByEmail = async (email: string): Promise<UserRow | null> => {
  const result = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<UserRow | null> => {
  const result = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE id = $1 AND deleted_at IS NULL
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const updateUserPassword = async (
  userId: string,
  passwordHash: string
): Promise<PublicUser | null> => {
  const result = await query<UserRow>(
    `
      UPDATE users
      SET password_hash = $2,
          reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `,
    [userId, passwordHash]
  );

  return result.rows[0] ? toPublicUser(result.rows[0]) : null;
};

export const storeResetToken = async (
  userId: string,
  resetToken: string,
  expiresAt: Date
): Promise<void> => {
  await query(
    `
      UPDATE users
      SET reset_token = $2,
          reset_token_expires = $3,
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId, resetToken, expiresAt]
  );
};

export const findUserByResetToken = async (resetToken: string): Promise<UserRow | null> => {
  const result = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires > NOW()
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [resetToken]
  );

  return result.rows[0] ?? null;
};

export const clearResetToken = async (userId: string): Promise<void> => {
  await query(
    `
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );
};

export const storeRefreshToken = async (
  userId: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> => {
  await query(
    `
      UPDATE users
      SET reset_token = $2,
          reset_token_expires = $3,
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId, refreshToken, expiresAt]
  );
};

export const findUserByRefreshToken = async (refreshToken: string): Promise<UserRow | null> => {
  const result = await query<UserRow>(
    `
      SELECT *
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires > NOW()
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [refreshToken]
  );

  return result.rows[0] ?? null;
};

export const clearRefreshToken = async (userId: string): Promise<void> => {
  await query(
    `
      UPDATE users
      SET reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );
};

export const softDeleteUser = async (userId: string): Promise<void> => {
  await query(
    `
      UPDATE users
      SET deleted_at = NOW(),
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `,
    [userId]
  );
};
