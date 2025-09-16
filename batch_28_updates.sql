-- Batch 28 Update Commands
-- Companies 136 to 140

-- Amandus Kahl GmbH & Co. KG
UPDATE companies
SET email = 'info@akahl.de', phone = '+49 40 72771-0', website = 'https://www.akahl.com', employees_count = 'ensure smooth operations within the group.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Amandus Kahl GmbH & Co. KG';

-- BioCote Ltd
UPDATE companies
SET email = 'Biocote@biocote.com', phone = '+44 24 2477712489', website = 'https://www.biocote.com', foundation_year = '1994', export_content = '> 75%', employees_count = '11 - 30', company_description = 'Proud members of the British Plastics Federation, BioCote® is a worldwide market-leading antimicrobial additives supplier with an established history of over 30 years. Trusted by leading brands and manufacturers of plastic ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BioCote Ltd';

-- GREAT EASTERN RESINS INDUSTRIAL CO., LTD
UPDATE companies
SET email = 'flora@greco.com.tw', phone = '+886 4 23587676-683', website = 'https://www.grecoresin.com', employees_count = '> 500', company_description = 'Founded in 1955, GRECO specializes in adhesives for footwear and specialty chemicals. Guided by "Quality, Technology, Service," we innovate in water-based PU adhesives, TPU resins, dry film photoresist, and specialty chemicals. As a leading footwear ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'GREAT EASTERN RESINS INDUSTRIAL CO., LTD';

-- Chrostiki S.A.
UPDATE companies
SET email = 'sales@chrostiki.gr', phone = '+30 210 6624692', website = 'https://www.chrostiki.com', foundation_year = '1959', employees_count = '31 - 100', company_description = 'Chrostiki S.A. is a leading Greek manufacturer of masterbatches, dry color blends, liquid colorants and printing inks, trading also in chemicals for the plastics and printing industries....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Chrostiki S.A.';

