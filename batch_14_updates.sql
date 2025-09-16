-- Batch 14 Update Commands
-- Companies 66 to 70

-- LCY Chemical Corp.
UPDATE companies
SET email = 'yh.chuang@lcygroup.com', phone = '+886 2 27631611', website = 'https://www.lcygroup.com', company_description = 'With a legacy dating back to 1915, LCY Chemical Corp is committed to reimagining science for a thriving tomorrow. We address human and societal challenges through circular economy solutions and contribute to sustainable industrial practices....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'LCY Chemical Corp.';

-- Marfran Srl
UPDATE companies
SET email = 'info@marfran.com', phone = '+39 030 9860511', website = 'https://www.marfran.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Marfran Srl';

-- Plastek UK Ltd
UPDATE companies
SET email = 'danielle.harkness@plastekgroup.com', phone = '+44 1623 662233', website = 'https://www.plastekgroup.com', foundation_year = '1999', sales_volume = '20 - 100 Mill. US $', export_content = 'max. 75%', employees_count = '101 - 500', company_description = 'The Plastek Group is a trusted global supplier of premium quality injection moulding tools and plastic moulded and blow moulded components serving a wide range of industries including: Homecare, Personal Care, Infant Nutrition, Medical Devices, Plumb...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Plastek UK Ltd';

-- ASPEN GLOBAL SOLUTIONS SAS
UPDATE companies
SET email = 'julie@aspen-gs.com', phone = '+33 69002 048765686', website = 'https://www.aspen-gs.fr', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ASPEN GLOBAL SOLUTIONS SAS';

-- Shandong Ruian Biotechnology Co., Ltd.
UPDATE companies
SET email = 'ruiankeji@ruiangeo.com', phone = '+86 400 0130200', website = 'https://www.ruiangeo.com', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 50%', employees_count = '101 - 500', company_description = 'Gregeo’s Main Product: PBAT, PBS, TPEE, PCDL, PETG/PCTG and corresponding composite for different applicationsA comprehensive service provider specializing in technological innovation for new materialsRuian Group is a global-operated new materials se...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Shandong Ruian Biotechnology Co., Ltd.';

