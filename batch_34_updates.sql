-- Batch 34 Update Commands
-- Companies 166 to 170

-- CAS, A division of the American Chemical Society
UPDATE companies
SET email = 'help@cas.org', phone = '+1 614 4473731', website = 'https://www.cas.org', foundation_year = '1907', sales_volume = '> 100 Mill. US $', employees_count = '> 500', company_description = 'CAS connects the world’s scientific knowledge to accelerate breakthroughs that improve lives. We empower global innovators to efficiently navigate today’s complex data landscape and make confident decisions in each phase of the innovation journey. As...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'CAS, A division of the American Chemical Society';

-- EFLAYA SRL
UPDATE companies
SET email = 'info@eflaya.com', phone = '+39 045 4500122', website = 'https://www.eflaya.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'EFLAYA SRL';

-- UBE Europe GmbH
UPDATE companies
SET email = 'info@ube.com', phone = '+49 211 17883-0', website = 'https://www.ube.es', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'UBE Europe GmbH';

-- SHANDONG RUIFENG CHEMICAL CO., LTD
UPDATE companies
SET email = 'frank@ruifengchemical.com', phone = '+86 186 15145488', website = 'https://www.ruifengchemical.com', foundation_year = '1994', company_description = 'Founded in 1994, the company is a national high-tech enterprise. In July 2011, we were listed on the Shenzhen Stock Exchange. Stock code: 300243Specializing in the manufacturing and sales of PVC Additives, Engineering Plastic Additives and Compostabl...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'SHANDONG RUIFENG CHEMICAL CO., LTD';

-- Marangon Danilo & C. S.r.l.
UPDATE companies
SET email = 'info@marangondanilo.it', phone = '+39 0444 697745', website = 'https://www.marangondanilo.it', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Marangon Danilo & C. S.r.l.';

