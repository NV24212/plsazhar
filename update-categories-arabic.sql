-- Update categories with Arabic translations
-- Run this in your Supabase SQL Editor to add Arabic category names

-- Add Arabic name column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);

-- Update existing categories with Arabic translations
UPDATE categories SET name_ar = 'الأجهزة الإلكترونية' WHERE name = 'Electronics';
UPDATE categories SET name_ar = 'الإكسسوارات' WHERE name = 'Accessories';  
UPDATE categories SET name_ar = 'المنزل والمكتب' WHERE name = 'Home & Office';

-- View updated categories
SELECT id, name, name_ar, created_at FROM categories ORDER BY id;
