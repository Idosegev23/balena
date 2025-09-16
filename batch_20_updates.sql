-- Batch 20 Update Commands
-- Companies 96 to 100

-- LIFELINE TECHNOLOGIES
UPDATE companies
SET email = 'jayshree.jadhav@lifelinetechnologies.in', phone = '+91 98218 56789', website = 'https://www.lifelinetechnologies.in', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'LIFELINE TECHNOLOGIES';

-- TEKU GmbH Fluorkunststoffe
UPDATE companies
SET email = 'info@teku-gmbh.de', phone = '+49 2051 2803-0', website = 'https://www.teku-gmbh.de', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'TEKU GmbH Fluorkunststoffe';

-- Blend Colours Pvt. Ltd.
UPDATE companies
SET email = 'shailesh@blendcolours.com', phone = '+91 40 24361499', website = 'https://www.blendcolours.com', foundation_year = '1999', sales_volume = '20 - 100 Mill. US $', export_content = 'max. 50%', employees_count = '101 - 500', company_description = 'Blend Colours is a leading manufacturer of all types of masterbatches, fillers and compounds from India, recognised as ‘two star export house’.Technology has always been a key differentiator for Blend Colours, which has notably benefited its customer...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Blend Colours Pvt. Ltd.';

-- SIMONA AG
UPDATE companies
SET email = 'mail@simona-group.com', phone = '+49 6752 14-0', website = 'https://www.simona.de', employees_count = '> 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'SIMONA AG';

-- Mitras Materials GmbH
UPDATE companies
SET email = 'info@mitras-materials.com', phone = '+49 961 89308', website = 'https://www.mitras-materials.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Mitras Materials GmbH';

