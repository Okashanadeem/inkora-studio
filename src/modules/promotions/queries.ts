import { createAdminClient } from '@/lib/supabase/admin';
import { PromotionCandidate } from './engine';

export async function getActivePromotions(): Promise<PromotionCandidate[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Default seeded fallback promotions
    return [
      {
        id: 'promo-w20',
        name: 'WELCOME20',
        type: 'percentage',
        value: 20,
        minSpend: 0,
        isAutomatic: false,
        couponCode: 'WELCOME20',
        stackable: false,
        priority: 1,
      },
      {
        id: 'promo-spend2k',
        name: 'Spend PKR 2,000 Save 20%',
        type: 'percentage',
        value: 20,
        minSpend: 2000,
        maxDiscount: 500,
        isAutomatic: true,
        stackable: false,
        priority: 2,
      },
    ];
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('promotions')
    .select(
      `
      id,
      name,
      type,
      value,
      max_discount,
      min_spend,
      is_automatic,
      coupon_code,
      stackable,
      priority
    `,
    )
    .eq('is_active', true);

  if (error || !data) {
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type as 'percentage' | 'fixed',
    value: p.value,
    maxDiscount: p.max_discount || undefined,
    minSpend: p.min_spend,
    isAutomatic: p.is_automatic,
    couponCode: p.coupon_code || undefined,
    stackable: p.stackable,
    priority: p.priority,
  }));
}

export async function getAdminPromotionsList() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}
