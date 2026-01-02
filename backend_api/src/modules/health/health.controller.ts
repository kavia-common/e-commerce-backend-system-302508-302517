import type { Request, Response } from 'express';
import { getStatus } from './health.service';

// PUBLIC_INTERFACE
export function check(_req: Request, res: Response) {
  /** Health endpoint response. */
  return res.status(200).json(getStatus());
}
