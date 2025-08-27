-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    images JSONB DEFAULT '[]'::jsonb,
    variants JSONB DEFAULT '[]'::jsonb,
    total_stock INTEGER DEFAULT 0 CHECK (total_stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS products_name_idx ON products(name);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at);

-- Create trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products (similar to your current in-memory data)
INSERT INTO products (name, description, price, images, variants, total_stock) VALUES
(
    'Wireless Bluetooth Headphones',
    'Premium quality headphones with noise cancellation',
    35.00,
    '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"]'::jsonb,
    '[
        {"id": "v1", "name": "Black", "stock": 25},
        {"id": "v2", "name": "White", "stock": 15},
        {"id": "v3", "name": "Silver", "stock": 5}
    ]'::jsonb,
    45
),
(
    'Adjustable Laptop Stand',
    'Ergonomic laptop stand for better posture',
    17.50,
    '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop"]'::jsonb,
    '[
        {"id": "v1", "name": "Natural Wood", "stock": 13},
        {"id": "v2", "name": "Black", "stock": 10}
    ]'::jsonb,
    23
),
(
    'USB-C Cable 6ft',
    'Fast charging USB-C to USB-C cable',
    5.00,
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop"]'::jsonb,
    '[
        {"id": "v1", "name": "Black", "stock": 70},
        {"id": "v2", "name": "White", "stock": 50}
    ]'::jsonb,
    120
),
(
    'Portable Bluetooth Speaker',
    'Waterproof speaker with 12-hour battery life',
    50.00,
    '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop"]'::jsonb,
    '[
        {"id": "v1", "name": "Red", "stock": 3},
        {"id": "v2", "name": "Blue", "stock": 2},
        {"id": "v3", "name": "Black", "stock": 3}
    ]'::jsonb,
    8
);
