import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../db/prisma';
import { BadRequestError, ConflictError, UnauthorizedError } from '../../errors/httpErrors';

function getSaltRounds(): number {
  const raw = process.env.BCRYPT_SALT_ROUNDS ?? '12';
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 8 || parsed > 15) return 12;
  return parsed;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing required env var JWT_SECRET');
  return secret;
}

function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? '7d';
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = getSaltRounds();
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

function signToken(payload: { sub: string; email: string; role: Role }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}

// PUBLIC_INTERFACE
export async function register(email: string, password: string) {
  /** Registers a new user and returns a JWT token + user info. */
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email already in use');

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.USER
    },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return { user, token };
}

// PUBLIC_INTERFACE
export async function login(email: string, password: string) {
  /** Verifies credentials and returns a JWT token + user info. */
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
    token
  };
}

// PUBLIC_INTERFACE
export async function ensureAdminExists() {
  /**
   * Optional helper: create an initial admin user if ADMIN_EMAIL/ADMIN_PASSWORD are set.
   * Not automatically called to avoid surprising side effects in production.
   */
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  if (password.length < 8) throw new BadRequestError('ADMIN_PASSWORD must be at least 8 characters');

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { email, passwordHash, role: Role.ADMIN }
  });
}
