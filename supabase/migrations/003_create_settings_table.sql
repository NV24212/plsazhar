-- =================================================================
-- MIGRATION SCRIPT: Create app_settings table
--
-- Version: 3.0
-- Description: Creates a table to store application-wide settings
-- as key-value pairs. This allows for flexible and centralized
-- management of settings like custom messages, feature flags, etc.
-- =================================================================

-- Step 1: Define and create the app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add a comment to describe the table's purpose
COMMENT ON TABLE app_settings IS 'Stores application-wide settings as key-value pairs. The ''key'' is a unique identifier for the setting (e.g., ''storeConfig''), and the ''value'' is a JSONB object containing the setting data.';

-- Step 3: Create a trigger to auto-update the 'updated_at' timestamp
-- This uses the function created in a previous migration.
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Grant permissions to Supabase roles
-- Mirroring permissions from other tables for consistency.
GRANT ALL ON app_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON app_settings TO authenticated;

-- Step 5: Insert a default settings object
-- This provides a default configuration on a fresh database setup.
-- The key 'storeConfig' will hold the main settings object.
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
SELECT 'Migration 003_create_settings_table executed successfully.' as status;
