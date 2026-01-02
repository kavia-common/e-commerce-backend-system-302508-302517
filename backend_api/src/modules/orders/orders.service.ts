import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../errors/httpErrors';

// PUBLIC_INTERFACE
export async function placeOrder(userId: string, items: Array<{ productId: string; quantity: number }>) {
  /** Places an order for the authenticated user, validating stock and computing totals atomically. */
  if (items.length === 0) throw new BadRequestError('Order must contain at least one item');

  return prisma.$transaction(async (tx) => {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await tx.product.findMany({ where: { id: { in: productIds }, active: true } });

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products not found');
    }

    const productById = new Map(products.map((p) => [p.id, p]));
    // Validate stock and compute totals
    let totalCents = 0;
    let currency = products[0]?.currency ?? 'USD';

    for (const item of items) {
      const product = productById.get(item.productId)!;

      if (product.currency !== currency) {
        throw new BadRequestError('All items must share the same currency');
      }

      if (product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for product ${product.id}`);
      }

      totalCents += product.priceCents * item.quantity;
    }

    // Decrement stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        totalCents,
        currency,
        items: {
          create: items.map((item) => {
            const product = productById.get(item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: product.priceCents
            };
          })
        }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    return order;
  });
}

// PUBLIC_INTERFACE
export async function listMyOrders(userId: string) {
  /** Returns the authenticated user's order history. */
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } }
    }
  });
}
