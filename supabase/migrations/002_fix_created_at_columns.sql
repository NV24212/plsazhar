-- Migration to fix missing created_at columns in customers and orders tables
-- This addresses the error: "Could not find the 'createdAt' column in the schema cache"

-- First, check if the columns exist and add them if they don't
DO $$
BEGIN
    -- Add created_at to customers table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE customers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE customers SET created_at = NOW() WHERE created_at IS NULL;
    END IF;

    -- Add updated_at to customers table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE customers SET updated_at = NOW() WHERE updated_at IS NULL;
    END IF;

    -- Add created_at to orders table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE orders SET created_at = NOW() WHERE created_at IS NULL;
    END IF;

    -- Add updated_at to orders table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE orders SET updated_at = NOW() WHERE updated_at IS NULL;
    END IF;

    -- Add created_at to products table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
    END IF;

    -- Add updated_at to products table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;
    END IF;

    RAISE NOTICE 'Schema migration completed successfully';
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers(created_at);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at);

-- Create trigger function to update updated_at automatically if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create triggers for all tables
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
