-- ============================================================================
-- Inkora Studio Development Seed Data
-- ============================================================================

-- 1. Default Business Settings (Section 6, 12, 20)
INSERT INTO public.settings (key, value) VALUES
('store', '{"name": "Inkora Studio", "currency": "PKR", "email": "orders@inkorastudio.com"}'::jsonb),
('whatsapp', '{"number": "923111257119", "message_template": "Hi, I am interested in {product_name}.\nProduct link: {product_url}\nCould you tell me more about the customization options?"}'::jsonb),
('shipping', '{"standard_rate": 250, "free_shipping_threshold": 3000}'::jsonb),
('risk', '{"high_value_cod_threshold": 10000, "max_daily_orders_per_ip": 5}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. Seed Categories
INSERT INTO public.categories (id, name, slug, sort_order, is_active, seo_title, seo_description) VALUES
('a0000000-0000-0000-0000-000000000001', 'Art Prints', 'art-prints', 1, true, 'Custom Art Prints in Pakistan | Inkora Studio', 'High definition custom matte and glossy art prints in multiple sizes.'),
('a0000000-0000-0000-0000-000000000002', 'Business Cards', 'business-cards', 2, true, 'Premium Business Cards | Inkora Studio', 'Custom business card printing with velvet and matte laminations.'),
('a0000000-0000-0000-0000-000000000003', 'Merchandise & Plaques', 'merchandise-plaques', 3, true, 'Custom Plaques & Merchandise | Inkora Studio', 'Acrylic awards, desk plaques, and custom gifts.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Seed Products
INSERT INTO public.products (id, name, slug, description, category_id, base_price, status, is_customizable) VALUES
('b0000000-0000-0000-0000-000000000001', 'Custom Matte Art Print', 'custom-matte-art-print', 'Archival heavy matte paper printed with high-resolution pigment inks.', 'a0000000-0000-0000-0000-000000000001', 1200, 'published', true),
('b0000000-0000-0000-0000-000000000002', 'Velvet Business Cards (500 pcs)', 'velvet-business-cards-500', '350gsm premium art card with velvet soft-touch finish.', 'a0000000-0000-0000-0000-000000000002', 3500, 'published', true),
('b0000000-0000-0000-0000-000000000003', 'Acrylic Desk Plaque', 'acrylic-desk-plaque', '5mm cast clear acrylic plaque with UV direct print.', 'a0000000-0000-0000-0000-000000000003', 2800, 'published', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Seed Product Options for Art Print
INSERT INTO public.product_options (id, product_id, name, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Size', 1),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Frame', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.option_values (option_id, label, price_modifier, sort_order) VALUES
('c0000000-0000-0000-0000-000000000001', 'A4 (8.3 x 11.7 in)', 0, 1),
('c0000000-0000-0000-0000-000000000001', 'A3 (11.7 x 16.5 in)', 800, 2),
('c0000000-0000-0000-0000-000000000002', 'Print Only (No Frame)', 0, 1),
('c0000000-0000-0000-0000-000000000002', 'Black Wooden Frame', 1200, 2)
ON CONFLICT DO NOTHING;

-- 5. Seed Bulk Price Tiers
INSERT INTO public.price_tiers (product_id, min_qty, unit_price) VALUES
('b0000000-0000-0000-0000-000000000001', 5, 1000),
('b0000000-0000-0000-0000-000000000001', 10, 850)
ON CONFLICT DO NOTHING;

-- 6. Seed Baseline Promotions (Section 9.2)
INSERT INTO public.promotions (id, name, type, value, min_spend, audience, applies_to, is_active, coupon_code) VALUES
('d0000000-0000-0000-0000-000000000001', 'WELCOME20', 'percentage', 20, 0, 'first_order', 'all', true, 'WELCOME20'),
('d0000000-0000-0000-0000-000000000002', 'Spend PKR 2,000 Save 20%', 'percentage', 20, 2000, 'all', 'all', true, NULL)
ON CONFLICT (coupon_code) DO NOTHING;
