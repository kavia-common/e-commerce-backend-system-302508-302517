import type { Request, Response, NextFunction } from 'express';
import * as service from './orders.service';
import { UnauthorizedError } from '../../errors/httpErrors';

// PUBLIC_INTERFACE
export async function place(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { items } = req.body as { items: Array<{ productId: string; quantity: number }> };
    const order = await service.placeOrder(req.user.sub, items);
    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function myOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError();
    const orders = await service.listMyOrders(req.user.sub);
    return res.status(200).json({ items: orders });
  } catch (err) {
    return next(err);
  }
}
