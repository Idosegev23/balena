-- Enhanced database schema for K-Show companies with detailed company data
-- This script adds all the new fields we can extract from company profiles

-- Add new columns to existing companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS detailed_address TEXT,
ADD COLUMN IF NOT EXISTS sales_volume TEXT,
ADD COLUMN IF NOT EXISTS export_content TEXT,
ADD COLUMN IF NOT EXISTS employees_count TEXT,
ADD COLUMN IF NOT EXISTS foundation_year TEXT,
ADD COLUMN IF NOT EXISTS target_groups TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS main_email TEXT,
ADD COLUMN IF NOT EXISTS main_phone TEXT,
ADD COLUMN IF NOT EXISTS main_website TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'profile_scraping',
ADD COLUMN IF NOT EXISTS last_detailed_scrape TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scraping_status TEXT DEFAULT 'pending' CHECK (scraping_status IN ('pending', 'completed', 'failed', 'skipped'));

-- Add comments to explain the new fields
COMMENT ON COLUMN public.companies.detailed_address IS 'Full company address from Company data popup';
COMMENT ON COLUMN public.companies.sales_volume IS 'Sales volume range (e.g., "5 - 20 Mill. US $")';
COMMENT ON COLUMN public.companies.export_content IS 'Export percentage (e.g., "max. 10%")';
COMMENT ON COLUMN public.companies.employees_count IS 'Number of employees range (e.g., "31 - 100")';
COMMENT ON COLUMN public.companies.foundation_year IS 'Company foundation year';
COMMENT ON COLUMN public.companies.target_groups IS 'Target industries and customer groups';
COMMENT ON COLUMN public.companies.company_description IS 'Full company description from profile page';
COMMENT ON COLUMN public.companies.main_email IS 'Primary email from profile page (may differ from popup email)';
COMMENT ON COLUMN public.companies.main_phone IS 'Primary phone from profile page (may differ from popup phone)';
COMMENT ON COLUMN public.companies.main_website IS 'Primary website from profile page (may differ from popup website)';
COMMENT ON COLUMN public.companies.data_source IS 'Source of the detailed data (profile_scraping, manual, etc.)';
COMMENT ON COLUMN public.companies.last_detailed_scrape IS 'When detailed data was last scraped';
COMMENT ON COLUMN public.companies.scraping_status IS 'Status of detailed scraping process';

-- Create index for efficient querying of scraping status
CREATE INDEX IF NOT EXISTS idx_companies_scraping_status ON public.companies(scraping_status);
CREATE INDEX IF NOT EXISTS idx_companies_last_detailed_scrape ON public.companies(last_detailed_scrape);

-- Create a view for companies that need detailed scraping
CREATE OR REPLACE VIEW companies_needing_scraping AS
SELECT 
    id,
    company,
    profile_url,
    scraping_status,
    last_detailed_scrape,
    CASE 
        WHEN scraping_status = 'pending' THEN 'Never scraped'
        WHEN scraping_status = 'failed' THEN 'Failed - needs retry'
        WHEN last_detailed_scrape < NOW() - INTERVAL '30 days' THEN 'Outdated - needs refresh'
        ELSE 'Up to date'
    END as scraping_priority
FROM public.companies 
WHERE profile_url IS NOT NULL 
  AND (scraping_status IN ('pending', 'failed') 
       OR last_detailed_scrape IS NULL 
       OR last_detailed_scrape < NOW() - INTERVAL '30 days')
ORDER BY 
    CASE scraping_status
        WHEN 'pending' THEN 1
        WHEN 'failed' THEN 2
        ELSE 3
    END,
    last_detailed_scrape ASC NULLS FIRST;

-- Create a view for detailed company statistics
CREATE OR REPLACE VIEW company_data_statistics AS
SELECT 
    COUNT(*) as total_companies,
    COUNT(CASE WHEN profile_url IS NOT NULL THEN 1 END) as companies_with_profile_url,
    COUNT(CASE WHEN scraping_status = 'completed' THEN 1 END) as companies_scraped,
    COUNT(CASE WHEN scraping_status = 'pending' THEN 1 END) as companies_pending,
    COUNT(CASE WHEN scraping_status = 'failed' THEN 1 END) as companies_failed,
    COUNT(CASE WHEN detailed_address IS NOT NULL THEN 1 END) as companies_with_address,
    COUNT(CASE WHEN sales_volume IS NOT NULL THEN 1 END) as companies_with_sales_data,
    COUNT(CASE WHEN employees_count IS NOT NULL THEN 1 END) as companies_with_employee_data,
    COUNT(CASE WHEN company_description IS NOT NULL THEN 1 END) as companies_with_description,
    ROUND(
        COUNT(CASE WHEN scraping_status = 'completed' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN profile_url IS NOT NULL THEN 1 END), 0), 
        2
    ) as scraping_completion_percentage
FROM public.companies;

-- Function to update scraping status
CREATE OR REPLACE FUNCTION update_company_scraping_status(
    company_id INTEGER,
    new_status TEXT,
    detailed_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.companies 
    SET 
        scraping_status = new_status,
        last_detailed_scrape = CASE WHEN new_status = 'completed' THEN NOW() ELSE last_detailed_scrape END,
        -- Update fields from JSONB if provided
        detailed_address = COALESCE(detailed_data->>'address', detailed_address),
        sales_volume = COALESCE(detailed_data->>'sales_volume', sales_volume),
        export_content = COALESCE(detailed_data->>'export_content', export_content),
        employees_count = COALESCE(detailed_data->>'employees', detailed_address),
        foundation_year = COALESCE(detailed_data->>'foundation_year', foundation_year),
        target_groups = COALESCE(detailed_data->>'target_groups', target_groups),
        company_description = COALESCE(detailed_data->>'description', company_description),
        main_email = COALESCE(detailed_data->>'main_email', main_email),
        main_phone = COALESCE(detailed_data->>'main_phone', main_phone),
        main_website = COALESCE(detailed_data->>'main_website', main_website),
        -- Update existing fields if better data is available
        email = COALESCE(detailed_data->>'email', email),
        phone = COALESCE(detailed_data->>'phone', phone),
        website = COALESCE(detailed_data->>'website', website),
        updated_at = NOW()
    WHERE id = company_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get next company for scraping
CREATE OR REPLACE FUNCTION get_next_company_for_scraping()
RETURNS TABLE(
    id INTEGER,
    company TEXT,
    profile_url TEXT,
    current_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.company, c.profile_url, c.scraping_status
    FROM companies_needing_scraping c
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON companies_needing_scraping TO authenticated;
GRANT SELECT ON company_data_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION update_company_scraping_status(INTEGER, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_company_for_scraping() TO authenticated;
