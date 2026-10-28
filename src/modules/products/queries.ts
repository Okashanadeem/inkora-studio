import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getPublishedProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      base_price,
      status,
      is_customizable,
      category_id,
      categories (name, slug)
    `,
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published products:', error);
    return [];
  }

  return data;
}

export async function getProductBySlug(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      base_price,
      status,
      is_customizable,
      seo_title,
      seo_description,
      category_id,
      categories (id, name, slug)
    `,
    )
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  // Fetch product options & values
  const { data: options } = await supabase
    .from('product_options')
    .select(
      `
      id,
      name,
      sort_order,
      option_values (id, label, price_modifier, sort_order)
    `,
    )
    .eq('product_id', data.id)
    .order('sort_order', { ascending: true });

  // Fetch price tiers
  const { data: priceTiers } = await supabase
    .from('price_tiers')
    .select('id, min_qty, unit_price')
    .eq('product_id', data.id)
    .order('min_qty', { ascending: true });

  // Fetch product images
  const { data: images } = await supabase
    .from('product_images')
    .select('id, r2_key, alt, sort_order')
    .eq('product_id', data.id)
    .order('sort_order', { ascending: true });

  return {
    ...data,
    options: options || [],
    priceTiers: priceTiers || [],
    images: images || [],
  };
}

export async function getAdminProductsList() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      base_price,
      status,
      is_customizable,
      created_at,
      categories (name)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }

  return data;
}

export async function getAdminCategoriesList() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching admin categories:', error);
    return [];
  }

  return data;
}
