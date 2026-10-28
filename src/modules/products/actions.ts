'use server';

import { revalidatePath } from 'next/cache';
import { requireStaffOrAdmin } from '@/lib/auth/guards';
import { saveProduct, setProductStatus, saveCategory } from './service';
import { ProductInput, CategoryInput } from './schema';

export async function saveProductAction(input: ProductInput) {
  const { user } = await requireStaffOrAdmin();
  const result = await saveProduct(input, user.id);
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return result;
}

export async function toggleProductStatusAction(
  productId: string,
  status: 'draft' | 'published' | 'archived',
) {
  const { user } = await requireStaffOrAdmin();
  const result = await setProductStatus(productId, status, user.id);
  revalidatePath('/admin/products');
  revalidatePath('/products');
  return result;
}

export async function saveCategoryAction(input: CategoryInput) {
  const { user } = await requireStaffOrAdmin();
  const result = await saveCategory(input, user.id);
  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  return result;
}
