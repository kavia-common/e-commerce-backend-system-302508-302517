import type { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

// PUBLIC_INTERFACE
export async function register(req: Request, res: Response, next: NextFunction) {
  /** Registers a user and returns token. */
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.register(email, password);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function login(req: Request, res: Response, next: NextFunction) {
  /** Logs a user in and returns token. */
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}
