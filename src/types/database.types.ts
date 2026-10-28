export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'customer' | 'staff' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'customer' | 'staff' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'customer' | 'staff' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_key: string | null;
          sort_order: number;
          is_active: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          image_key?: string | null;
          sort_order?: number;
          is_active?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          image_key?: string | null;
          sort_order?: number;
          is_active?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          base_price: number;
          status: 'draft' | 'published' | 'archived';
          is_customizable: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          base_price: number;
          status?: 'draft' | 'published' | 'archived';
          is_customizable?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category_id?: string | null;
          base_price?: number;
          status?: 'draft' | 'published' | 'archived';
          is_customizable?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          status: string;
          payment_status: string;
          payment_method: string;
          subtotal: number;
          discount_total: number;
          shipping_total: number;
          tax_total: number;
          grand_total: number;
          risk_level: 'low' | 'medium' | 'high';
          risk_reasons: Json;
          idempotency_key: string | null;
          tracking_token_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          subtotal: number;
          discount_total?: number;
          shipping_total?: number;
          tax_total?: number;
          grand_total: number;
          risk_level?: 'low' | 'medium' | 'high';
          risk_reasons?: Json;
          idempotency_key?: string | null;
          tracking_token_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          subtotal?: number;
          discount_total?: number;
          shipping_total?: number;
          tax_total?: number;
          grand_total?: number;
          risk_level?: 'low' | 'medium' | 'high';
          risk_reasons?: Json;
          idempotency_key?: string | null;
          tracking_token_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string;
          diff: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id: string;
          diff?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string;
          diff?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
