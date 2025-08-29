-- =================================================================
-- DATABASE MIGRATION SCRIPT
--
-- Version: 2.1
-- Description: Complete database schema setup.
-- This script is IDEMPOTENT and can be run multiple times safely.
-- Changes in V2.1: Added explicit unique constraint creation for categories.
-- =================================================================

-- Step 1: Enable necessary extensions
-- Step 1: Add any necessary extensions here in the future
-- CREATE EXTENSION IF NOT EXISTS "some_extension";

-- =================================================================
-- Step 2: Define and create core functions
-- =================================================================

-- Function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =================================================================
-- Step 3: Define and create tables
-- =================================================================

-- Drop existing tables in reverse order of dependency to ensure a clean slate
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories for products
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    home TEXT,
    road TEXT,
    block TEXT,
    town TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table, depends on categories
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    total_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table, depends on customers and products (via items JSON)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'delivered', 'picked-up')),
    delivery_type TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_area TEXT DEFAULT 'sitra' CHECK (delivery_area IN ('sitra', 'muharraq', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- Step 3.5: Alter existing tables idempotently
-- This ensures that older database schemas are updated correctly.
-- =================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'delivery_area'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_area TEXT DEFAULT 'sitra' CHECK (delivery_area IN ('sitra', 'muharraq', 'other'));
    END IF;
END $$;

-- =================================================================
-- Step 4: Create indexes for performance
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- =================================================================
-- Step 5: Create triggers to auto-update timestamps
-- =================================================================

-- Drop existing triggers before creating new ones to avoid duplicates
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- Step 6: Set up Row Level Security (RLS)
-- =================================================================
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- Step 7: Grant permissions to Supabase roles
-- =================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;

-- =================================================================
-- Step 8: Add constraints idempotently
-- This ensures that existing tables are updated correctly.
-- =================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'categories'::regclass
        AND conname = 'categories_name_key'
    ) THEN
        ALTER TABLE categories ADD CONSTRAINT categories_name_key UNIQUE (name);
    END IF;
END;
$$;

-- =================================================================
-- Step 9: Insert initial data (if it doesn't exist)
-- =================================================================
DO $$
BEGIN
    -- Note: Default categories are now initialized by the application
    -- in `server/lib/supabase.ts` if the table is empty.

    -- Insert a default admin user
    INSERT INTO admin_users (email, password_hash) VALUES
    ('admin@example.com', '$2y$10$If6v5L5ZX.Iqf82B1HfsA.8w.3zXyPF.B6/N9VJo.vjYdE.aJ/8yS') -- password is 'password'
    ON CONFLICT (email) DO NOTHING;

END $$;

-- =================================================================
-- Step 10: Create views and statistics functions
-- =================================================================

-- A view for enriched order details
CREATE OR REPLACE VIEW order_details AS
SELECT
    o.id,
    o.customer_id,
    o.items,
    o.total,
    o.status,
    o.delivery_type,
    o.delivery_area,
    o.notes,
    o.created_at,
    o.updated_at,
    c.name as customer_name,
    c.phone as customer_phone,
    c.address as customer_address,
    c.home as customer_home,
    c.road as customer_road,
    c.block as customer_block,
    c.town as customer_town
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- A function for dashboard statistics
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue DECIMAL,
    orders_today BIGINT,
    revenue_today DECIMAL,
    orders_this_month BIGINT,
    revenue_this_month DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_revenue,
        COUNT(o.id) FILTER (WHERE DATE(o.created_at) = CURRENT_DATE) as orders_today,
        COALESCE(SUM(o.total) FILTER (WHERE DATE(o.created_at) = CURRENT_DATE), 0) as revenue_today,
        COUNT(o.id) FILTER (WHERE DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)) as orders_this_month,
        COALESCE(SUM(o.total) FILTER (WHERE DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', CURRENT_DATE)), 0) as revenue_this_month
    FROM orders o;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- Step 11: Grant permissions on new views/functions
-- =================================================================
GRANT SELECT ON order_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_stats() TO authenticated;
GRANT SELECT ON order_details TO service_role;
GRANT EXECUTE ON FUNCTION get_order_stats() TO service_role;

-- =================================================================
-- Step 12: Create app_settings table
-- =================================================================
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotently add the updated_at column if it's missing from an existing table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'app_settings' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE app_settings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

COMMENT ON TABLE app_settings IS 'Stores application-wide settings as key-value pairs. The ''key'' is a unique identifier for the setting (e.g., ''storeConfig''), and the ''value'' is a JSONB object containing the setting data.';

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

GRANT ALL ON app_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_settings TO authenticated;

INSERT INTO app_settings (key, value)
VALUES (
    'storeConfig',
    '{
        "storeName": "",
        "storeDescription": "",
        "currency": "BHD",
        "currencySymbol": "BD",
        "contactPhone": "",
        "contactEmail": "",
        "contactAddress": "",
        "orderSuccessMessageEn": "Thank you for your order! We''ll process it within 2-4 hours and deliver within 1-3 business days.",
        "orderSuccessMessageAr": "شكراً لك على طلبك! سنقوم بمعالجته خلال 2-4 ساعات والتوصيل خلال 1-3 أيام عمل.",
        "orderInstructionsEn": "For any changes or questions about your order, please contact us.",
        "orderInstructionsAr": "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا.",
        "cashOnDeliveryEnabled": true,
        "bankTransferEnabled": false,
        "bankAccountInfo": ""
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- =================================================================
-- Final success message
-- =================================================================
SELECT 'Database migration script V2.2 executed successfully.' as status;
