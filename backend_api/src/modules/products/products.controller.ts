import type { Request, Response, NextFunction } from 'express';
import * as service from './products.service';

// PUBLIC_INTERFACE
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await service.listProducts();
    return res.status(200).json({ items: products });
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const product = await service.getProduct(id);
    return res.status(200).json(product);
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await service.createProduct(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    const product = await service.updateProduct(id, req.body);
    return res.status(200).json(product);
  } catch (err) {
    return next(err);
  }
}

// PUBLIC_INTERFACE
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as { id: string };
    await service.deleteProduct(id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
