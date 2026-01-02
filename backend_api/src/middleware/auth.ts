import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../errors/httpErrors';

export type JwtPayload = {
  sub: string;
  role: Role;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail fast: auth endpoints depend on this variable
    throw new Error('Missing required env var JWT_SECRET');
  }
  return secret;
}

// PUBLIC_INTERFACE
export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.header('Authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
};

// PUBLIC_INTERFACE
export function requireRole(...allowedRoles: Role[]): RequestHandler {
  /** Requires authenticated user and one of the allowed roles. */
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    return next();
  };
}
