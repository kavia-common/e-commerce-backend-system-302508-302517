import { z } from 'zod';

export const placeOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().min(1).max(999)
        })
      )
      .min(1)
  })
});
