import prisma from '../../db/prisma';
import { NotFoundError } from '../../errors/httpErrors';

// PUBLIC_INTERFACE
export async function listProducts() {
  /** Lists active products. */
  return prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' }
  });
}

// PUBLIC_INTERFACE
export async function getProduct(id: string) {
  /** Gets a product by id. */
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

// PUBLIC_INTERFACE
export async function createProduct(data: {
  name: string;
  description?: string;
  priceCents: number;
  currency?: string;
  stock?: number;
  active?: boolean;
}) {
  /** Creates a product. Admin-only at route level. */
  return prisma.product.create({ data });
}

// PUBLIC_INTERFACE
export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    priceCents: number;
    currency: string;
    stock: number;
    active: boolean;
  }>
) {
  /** Updates a product. */
  await getProduct(id);
  return prisma.product.update({ where: { id }, data });
}

// PUBLIC_INTERFACE
export async function deleteProduct(id: string) {
  /** Soft-delete a product by setting active=false. */
  await getProduct(id);
  return prisma.product.update({ where: { id }, data: { active: false } });
}
