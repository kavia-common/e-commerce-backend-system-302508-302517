import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    priceCents: z.number().int().min(0),
    currency: z.string().min(3).max(3).default('USD'),
    stock: z.number().int().min(0).default(0),
    active: z.boolean().optional()
  })
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    priceCents: z.number().int().min(0).optional(),
    currency: z.string().min(3).max(3).optional(),
    stock: z.number().int().min(0).optional(),
    active: z.boolean().optional()
  })
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
