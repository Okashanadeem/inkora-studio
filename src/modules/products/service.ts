import { createAdminClient } from '@/lib/supabase/admin';
import { ProductInput, CategoryInput, productInputSchema, categoryInputSchema } from './schema';
import { logAuditEvent } from '@/lib/auth/guards';

/**
 * Service to create or update a product and its associated options, values, and tiers
 */
export async function saveProduct(input: ProductInput, actorId?: string) {
  const validated = productInputSchema.parse(input);
  const adminClient = createAdminClient();

  const productData = {
    name: validated.name,
    slug: validated.slug,
    description: validated.description || null,
    category_id: validated.categoryId || null,
    base_price: validated.basePrice,
    status: validated.status,
    is_customizable: validated.isCustomizable,
    seo_title: validated.seoTitle || null,
    seo_description: validated.seoDescription || null,
  };

  let productId = validated.id;

  if (productId) {
    // Update existing product
    const { error } = await adminClient.from('products').update(productData).eq('id', productId);

    if (error) throw error;
  } else {
    // Insert new product
    const { data, error } = await adminClient
      .from('products')
      .insert(productData)
      .select('id')
      .single();

    if (error) throw error;
    productId = data.id;
  }

  // Handle options & values if supplied
  if (validated.options && validated.options.length > 0) {
    for (const opt of validated.options) {
      let optionId = opt.id;
      if (!optionId) {
        const { data: optData } = await adminClient
          .from('product_options')
          .insert({
            product_id: productId,
            name: opt.name,
            sort_order: opt.sortOrder,
          })
          .select('id')
          .single();
        optionId = optData?.id;
      }

      if (optionId && opt.values) {
        for (const val of opt.values) {
          if (!val.id) {
            await adminClient.from('option_values').insert({
              option_id: optionId,
              label: val.label,
              price_modifier: val.priceModifier,
              sort_order: val.sortOrder,
            });
          }
        }
      }
    }
  }

  // Log audit event
  await logAuditEvent({
    actorId,
    action: validated.id ? 'product.update' : 'product.create',
    entity: 'products',
    entityId: productId!,
    diff: { name: validated.name, status: validated.status, basePrice: validated.basePrice },
  });

  return { success: true, productId: productId! };
}

/**
 * Service to toggle product publish status
 */
export async function setProductStatus(
  productId: string,
  status: 'draft' | 'published' | 'archived',
  actorId?: string,
) {
  const adminClient = createAdminClient();
  const { error } = await adminClient.from('products').update({ status }).eq('id', productId);

  if (error) throw error;

  await logAuditEvent({
    actorId,
    action: 'product.status_change',
    entity: 'products',
    entityId: productId,
    diff: { status },
  });

  return { success: true };
}

/**
 * Service to create or update a category
 */
export async function saveCategory(input: CategoryInput, actorId?: string) {
  const validated = categoryInputSchema.parse(input);
  const adminClient = createAdminClient();

  const categoryData = {
    name: validated.name,
    slug: validated.slug,
    parent_id: validated.parentId || null,
    image_key: validated.imageKey || null,
    sort_order: validated.sortOrder,
    is_active: validated.isActive,
    seo_title: validated.seoTitle || null,
    seo_description: validated.seoDescription || null,
  };

  let categoryId = validated.id;

  if (categoryId) {
    const { error } = await adminClient
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId);

    if (error) throw error;
  } else {
    const { data, error } = await adminClient
      .from('categories')
      .insert(categoryData)
      .select('id')
      .single();

    if (error) throw error;
    categoryId = data.id;
  }

  await logAuditEvent({
    actorId,
    action: validated.id ? 'category.update' : 'category.create',
    entity: 'categories',
    entityId: categoryId!,
    diff: { name: validated.name, isActive: validated.isActive },
  });

  return { success: true, categoryId: categoryId! };
}
