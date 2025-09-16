-- Batch 15 Update Commands
-- Companies 71 to 75

-- Sitra S.p.A. Masterbatch
UPDATE companies
SET email = 'commerciale@sitramasterbatch.com', phone = '+39 0776 562237', website = 'https://www.sitramasterbatch.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Sitra S.p.A. Masterbatch';

-- BYK-Chemie GmbH
UPDATE companies
SET email = 'info@byk.com', phone = '+49 281 670-0', website = 'https://www.byk.com', sales_volume = '> 100 Mill. US $', employees_count = '> 500', company_description = 'BYK is a leading global supplier of specialty chemicals. The company’s innovative additives and differentiated solutions optimize product and material properties as well as production and application processes. Among other things, BYK additives impro...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BYK-Chemie GmbH';

-- Lehmann & Voss & Co. KG
UPDATE companies
SET email = 'info@lehvoss.de', phone = '+49 40 44197-0', website = 'https://www.lehvoss.com', company_description = 'The LEHVOSS Group under the management of Lehmann&Voss&Co. is a group of companies in the chemicals sector that develops, produces and markets chemical and mineral specialities for various industrial clients. Lehmann&Voss&Co., Hamburg, was founded in...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Lehmann & Voss & Co. KG';

-- T. Michel Formenbau GmbH & Co. KG
UPDATE companies
SET email = 'info@michel-form.de', phone = '+49 6772 9694-00', website = 'https://www.michel-form.de', foundation_year = '2000', employees_count = '31 - 100', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'T. Michel Formenbau GmbH & Co. KG';

-- Beijing Phabuilder Biotechnology Co., Ltd.
UPDATE companies
SET email = 'market@phabuilder.com', phone = '+86 185 15320363', website = 'https://www.phabuilder.com', foundation_year = '2021', export_content = '> 75%', employees_count = '101 - 500', company_description = 'PhaBuilder uses Halomonas (halophilic bacteria) as its core microbial chassis to build a fully integrated PHA industrial ecosystem that spans the entire value chain: strain design (PHAmily), scaled production (PHAdustry), material modification R&D (P...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Beijing Phabuilder Biotechnology Co., Ltd.';

