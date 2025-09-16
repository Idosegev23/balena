-- Batch 33 Update Commands
-- Companies 161 to 165

-- GRAFE GmbH & Co. KG
UPDATE companies
SET email = 'grafe@grafe.com', phone = '+49 36459 450', website = 'https://www.grafe.com', foundation_year = '1991', employees_count = '101 - 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'GRAFE GmbH & Co. KG';

-- B & P Littleford LLC
UPDATE companies
SET email = 'sales@bplittleford.com', phone = '+1 989 7571300', website = 'https://www.bplittleford.com', company_description = 'B&P Littleford designs and custom builds a wide spectrum of mixing, compounding, extruding, drying, reacting, and centrifugal separation equipment for large or small-scale manufacturing applications.Our technologies are provided to industries such as...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'B & P Littleford LLC';

-- Marubeni International (Europe) GmbH Chemical Group
UPDATE companies
SET email = 'chemical-exhibition@marubeni.com', phone = '+49 211 3671-0', website = 'https://www.europe.marubeni.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Marubeni International (Europe) GmbH Chemical Group';

-- C. H. Erbslöh GmbH & Co. KG
UPDATE companies
SET email = 'info.de@cherbsloeh.com', phone = '+49 2151 525-00', website = 'https://www.cherbsloeh.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'C. H. Erbslöh GmbH & Co. KG';

-- Symphony Environmental Ltd
UPDATE companies
SET email = 'info@d2w.net', phone = '+44 208 2075900', website = 'https://www.d2w.net', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Symphony Environmental Ltd';

