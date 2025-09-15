-- Logo System Database Setup for K-Show 2025
-- Ensures logo column exists and sets up related functionality

-- Ensure logo column exists in companies table
DO $$ 
BEGIN
    -- Check if logo column exists, if not, add it
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'logo'
    ) THEN
        ALTER TABLE companies ADD COLUMN logo TEXT;
        COMMENT ON COLUMN companies.logo IS 'URL to company logo stored in Supabase Storage';
    END IF;
END $$;

-- Create index on logo column for better performance
CREATE INDEX IF NOT EXISTS idx_companies_logo ON companies(logo) WHERE logo IS NOT NULL;

-- Create a function to update the updated_at timestamp when logo changes
CREATE OR REPLACE FUNCTION update_logo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update timestamp if logo actually changed
    IF OLD.logo IS DISTINCT FROM NEW.logo THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp when logo changes
DROP TRIGGER IF EXISTS trigger_update_logo_timestamp ON companies;
CREATE TRIGGER trigger_update_logo_timestamp
    BEFORE UPDATE ON companies
    FOR EACH ROW
    WHEN (OLD.logo IS DISTINCT FROM NEW.logo)
    EXECUTE FUNCTION update_logo_timestamp();

-- Create view for companies with logo status
CREATE OR REPLACE VIEW companies_logo_status AS
SELECT 
    id,
    company,
    website,
    logo,
    CASE 
        WHEN logo IS NOT NULL AND logo != '' THEN 'has_logo'
        WHEN website IS NOT NULL AND website != '' THEN 'can_scrape'
        ELSE 'no_logo_source'
    END AS logo_status,
    created_at,
    updated_at
FROM companies;

-- Grant permissions
GRANT SELECT ON companies_logo_status TO authenticated;
GRANT SELECT ON companies_logo_status TO anon;

-- Create function to get logo statistics
CREATE OR REPLACE FUNCTION get_logo_statistics()
RETURNS TABLE (
    total_companies INTEGER,
    with_logos INTEGER,
    without_logos INTEGER,
    with_websites INTEGER,
    scrapable INTEGER,
    logo_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_companies,
        COUNT(logo)::INTEGER as with_logos,
        (COUNT(*) - COUNT(logo))::INTEGER as without_logos,
        COUNT(website)::INTEGER as with_websites,
        (COUNT(website) - COUNT(logo))::INTEGER as scrapable,
        ROUND((COUNT(logo)::DECIMAL / COUNT(*)) * 100, 2) as logo_percentage
    FROM companies;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_logo_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_logo_statistics() TO anon;

-- Insert sample logos for testing (if needed)
-- Uncomment these lines if you want to add sample logos for testing
/*
UPDATE companies 
SET logo = 'https://via.placeholder.com/200x100/0066CC/FFFFFF?text=Sample+Logo'
WHERE id IN (
    SELECT id FROM companies 
    WHERE logo IS NULL 
    LIMIT 3
);
*/

-- Create RLS policies for logo management (if RLS is enabled)
-- These policies ensure users can only update logos if they have proper permissions

-- Allow authenticated users to view all company logos
DROP POLICY IF EXISTS "Allow authenticated users to view company logos" ON companies;
CREATE POLICY "Allow authenticated users to view company logos"
    ON companies FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to update company logos
DROP POLICY IF EXISTS "Allow authenticated users to update company logos" ON companies;
CREATE POLICY "Allow authenticated users to update company logos"
    ON companies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Summary of changes
DO $$
BEGIN
    RAISE NOTICE 'Logo database setup completed successfully!';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '1. ✅ Ensured logo column exists in companies table';
    RAISE NOTICE '2. ✅ Created index on logo column';
    RAISE NOTICE '3. ✅ Added automatic timestamp update trigger';
    RAISE NOTICE '4. ✅ Created companies_logo_status view';
    RAISE NOTICE '5. ✅ Created logo statistics function';
    RAISE NOTICE '6. ✅ Set up RLS policies for logo management';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run setup_logo_storage.py to create Supabase storage bucket';
    RAISE NOTICE '2. Use logo_scraper.py to automatically fetch logos';
    RAISE NOTICE '3. Use LogoUploader component for manual uploads';
END $$;
