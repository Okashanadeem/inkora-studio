-- ============================================================================
-- Inkora Studio Master Database Schema & RLS Policies
-- Compliant with Sections 5, 6, 7, 9, 10, 11, 13 of Master Project Specification
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CUSTOMERS, AUTH PROFILES & ROLES
-- ============================================================================

CREATE TYPE user_role_type AS ENUM ('customer', 'staff', 'admin');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_roles_user_id UNIQUE (user_id)
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    phone_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_profiles_user_id UNIQUE (user_id)
);

CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Shipping',
    line1 TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'PK',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function to check if current user has staff or admin role
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. CATALOG TABLES
-- ============================================================================

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_key TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    base_price INT NOT NULL, -- Integer PKR
    status product_status NOT NULL DEFAULT 'draft',
    is_customizable BOOLEAN NOT NULL DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Size", "Material", "Finish"
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g. "A4", "A3", "Matte", "Gloss"
    price_modifier INT NOT NULL DEFAULT 0, -- PKR delta
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    options_combination JSONB NOT NULL DEFAULT '{}'::jsonb,
    price INT NOT NULL, -- PKR Integer
    stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    min_qty INT NOT NULL,
    unit_price INT NOT NULL, -- PKR Integer
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_tier_qty UNIQUE (product_id, min_qty)
);

-- ============================================================================
-- 3. CARTS & ORDERS
-- ============================================================================

CREATE TYPE order_status_type AS ENUM (
    'draft',
    'pending_verification',
    'awaiting_payment',
    'paid',
    'artwork_review',
    'proof_sent',
    'approved',
    'in_production',
    'quality_check',
    'ready_to_ship',
    'shipped',
    'delivered',
    'completed',
    'on_hold',
    'cancelled',
    'refunded',
    'returned'
);

CREATE TYPE payment_status_type AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
CREATE TYPE risk_level_type AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_phone TEXT,
    status order_status_type NOT NULL DEFAULT 'draft',
    payment_status payment_status_type NOT NULL DEFAULT 'unpaid',
    payment_method TEXT NOT NULL DEFAULT 'cod', -- cod, bank_transfer, online, quotation
    subtotal INT NOT NULL, -- PKR
    discount_total INT NOT NULL DEFAULT 0, -- PKR
    shipping_total INT NOT NULL DEFAULT 0, -- PKR
    tax_total INT NOT NULL DEFAULT 0, -- PKR
    grand_total INT NOT NULL, -- PKR
    risk_level risk_level_type NOT NULL DEFAULT 'low',
    risk_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    idempotency_key TEXT UNIQUE,
    tracking_token_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    name_snapshot TEXT NOT NULL,
    unit_price_snapshot INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    options_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    from_status order_status_type,
    to_status order_status_type NOT NULL,
    actor_id UUID REFERENCES auth.users(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_ref TEXT,
    amount INT NOT NULL,
    status payment_status_type NOT NULL,
    raw_event JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    courier TEXT NOT NULL,
    tracking_no TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE artwork_status AS ENUM ('uploaded', 'verified', 'rejected', 'approved');

CREATE TABLE public.artwork_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INT NOT NULL,
    width INT,
    height INT,
    dpi INT,
    status artwork_status NOT NULL DEFAULT 'uploaded',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE proof_status AS ENUM ('sent', 'approved', 'changes_requested');

CREATE TABLE public.proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    status proof_status NOT NULL DEFAULT 'sent',
    feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. PROMOTIONS ENGINE
-- ============================================================================

CREATE TYPE promotion_type AS ENUM ('percentage', 'fixed');
CREATE TYPE promotion_audience AS ENUM ('all', 'first_order', 'group');
CREATE TYPE promotion_scope AS ENUM ('all', 'categories', 'products');

CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type promotion_type NOT NULL,
    value INT NOT NULL, -- Percentage (e.g. 20) or Fixed PKR (e.g. 500)
    max_discount INT,
    min_spend INT NOT NULL DEFAULT 0,
    audience promotion_audience NOT NULL DEFAULT 'all',
    applies_to promotion_scope NOT NULL DEFAULT 'all',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_automatic BOOLEAN NOT NULL DEFAULT false,
    coupon_code TEXT UNIQUE,
    usage_limit_total INT,
    usage_limit_per_customer INT NOT NULL DEFAULT 1,
    stackable BOOLEAN NOT NULL DEFAULT false,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.promotion_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE
);

CREATE TABLE public.promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    email_hash TEXT,
    discount_amount INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atomic promotion redemption function with concurrency lock (Section 6, 9.3)
CREATE OR REPLACE FUNCTION public.redeem_promotion_atomic(
    p_promotion_id UUID,
    p_order_id UUID,
    p_user_id UUID,
    p_email_hash TEXT,
    p_discount INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_promo RECORD;
    v_total_redemptions INT;
    v_user_redemptions INT;
BEGIN
    -- Acquire exclusive row-level lock on the promotion
    SELECT * INTO v_promo
    FROM public.promotions
    WHERE id = p_promotion_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Validate global usage limit
    IF v_promo.usage_limit_total IS NOT NULL THEN
        SELECT COUNT(*) INTO v_total_redemptions
        FROM public.promotion_redemptions
        WHERE promotion_id = p_promotion_id;

        IF v_total_redemptions >= v_promo.usage_limit_total THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Validate per-customer usage limit
    IF p_user_id IS NOT NULL OR p_email_hash IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_redemptions
        FROM public.promotion_redemptions
        WHERE promotion_id = p_promotion_id
          AND ((p_user_id IS NOT NULL AND user_id = p_user_id)
               OR (p_email_hash IS NOT NULL AND email_hash = p_email_hash));

        IF v_user_redemptions >= v_promo.usage_limit_per_customer THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- Insert redemption record atomically
    INSERT INTO public.promotion_redemptions (promotion_id, order_id, user_id, email_hash, discount_amount)
    VALUES (p_promotion_id, p_order_id, p_user_id, p_email_hash, p_discount);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. REVIEWS, TRENDS & MARKETING
-- ============================================================================

CREATE TYPE review_status AS ENUM ('pending', 'published', 'rejected');

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL UNIQUE REFERENCES public.order_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT NOT NULL,
    status review_status NOT NULL DEFAULT 'pending',
    verified_purchase BOOLEAN NOT NULL DEFAULT true,
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.review_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_stats_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    views INT NOT NULL DEFAULT 0,
    add_to_carts INT NOT NULL DEFAULT 0,
    units_sold INT NOT NULL DEFAULT 0,
    cancelled_units INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_stats_daily UNIQUE (product_id, stat_date)
);

CREATE TABLE public.trend_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    pinned BOOLEAN NOT NULL DEFAULT false,
    excluded BOOLEAN NOT NULL DEFAULT false,
    position INT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE subscription_status AS ENUM ('pending', 'confirmed', 'unsubscribed');

CREATE TABLE public.email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status subscription_status NOT NULL DEFAULT 'pending',
    consent_source TEXT NOT NULL, -- checkout, footer, modal
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.email_subscriptions(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.consent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    action TEXT NOT NULL, -- subscribed, confirmed, unsubscribed
    source TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inquiry_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'product_page',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. SETTINGS, RISK & AUDIT LOGS
-- ============================================================================

CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    diff JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    signal TEXT NOT NULL,
    score INT NOT NULL,
    decision TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.idempotency_keys (
    key TEXT PRIMARY KEY,
    scope TEXT NOT NULL,
    response_hash TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. EXPLICIT RLS POLICIES
-- ============================================================================

-- Catalog: Anonymous & Customers can view published products and active categories
CREATE POLICY "Public categories read" ON public.categories
    FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admin categories manage" ON public.categories
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public products read" ON public.products
    FOR SELECT USING (status = 'published' OR public.is_staff_or_admin());

CREATE POLICY "Admin products manage" ON public.products
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public variants read" ON public.product_variants
    FOR SELECT USING (is_active = true OR public.is_staff_or_admin());

CREATE POLICY "Admin variants manage" ON public.product_variants
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public product images read" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Admin product images manage" ON public.product_images
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public options read" ON public.product_options
    FOR SELECT USING (true);

CREATE POLICY "Admin options manage" ON public.product_options
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public option values read" ON public.option_values
    FOR SELECT USING (true);

CREATE POLICY "Admin option values manage" ON public.option_values
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Public price tiers read" ON public.price_tiers
    FOR SELECT USING (true);

CREATE POLICY "Admin price tiers manage" ON public.price_tiers
    FOR ALL USING (public.is_staff_or_admin());

-- Profiles & User Roles
CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_staff_or_admin());

-- Orders & Order Items
CREATE POLICY "Users read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_staff_or_admin());

CREATE POLICY "Staff manage orders" ON public.orders
    FOR ALL USING (public.is_staff_or_admin());

CREATE POLICY "Users read own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_staff_or_admin())
        )
    );

CREATE POLICY "Staff manage order items" ON public.order_items
    FOR ALL USING (public.is_staff_or_admin());

-- Reviews: Only published reviews are publicly readable
CREATE POLICY "Public published reviews read" ON public.reviews
    FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.is_staff_or_admin());

CREATE POLICY "Staff manage reviews" ON public.reviews
    FOR ALL USING (public.is_staff_or_admin());

-- Settings: Only staff/admin can view/edit settings
CREATE POLICY "Staff view settings" ON public.settings
    FOR SELECT USING (public.is_staff_or_admin());

CREATE POLICY "Admin edit settings" ON public.settings
    FOR ALL USING (public.is_admin());

-- Audit log: Staff/Admin can view, only system writes
CREATE POLICY "Admin view audit log" ON public.audit_log
    FOR SELECT USING (public.is_admin());

-- Inquiry clicks: public can insert
CREATE POLICY "Public record inquiry" ON public.inquiry_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff view inquiries" ON public.inquiry_clicks
    FOR SELECT USING (public.is_staff_or_admin());
