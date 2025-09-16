-- Batch 24 Update Commands
-- Companies 116 to 120

-- BENVIC SAS
UPDATE companies
SET email = 'contact@benvic.com', phone = '+33 3 80467300', website = 'https://www.benvic.com', company_description = 'Benvic is a leading international polymer compounder with over 60 years of technical expertise in the formulation and manufacture of PVC compounds, engineering plastics, biobased plastics, compostables and medical applications....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BENVIC SAS';

-- ALBIS Distribution GmbH & Co. KG
UPDATE companies
SET email = 'info@albis.com', phone = '+49 40 781050', website = 'https://www.albis.com', employees_count = '> 500', company_description = 'ALBIS is one of the world''s leading distributors of standard polymers, engineering plastics, and thermoplastic elastomers. With technical know-how, a strong distribution network and a strong commitment to finding the best solution, ALBIS as an indep...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ALBIS Distribution GmbH & Co. KG';

-- MOCOM Compounds GmbH & Co. KG
UPDATE companies
SET email = 'info@mocom.eu', phone = '+49 40 781050', website = 'https://www.mocom.eu', employees_count = '> 500', company_description = 'MOCOM Compounds GmbH & Co. KG, with its headquarters in Hamburg, Germany, is a global compounder of thermoplastic polymers and recycling specialist. The company offers the plastics processing industry a comprehensive product range of high-performance...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'MOCOM Compounds GmbH & Co. KG';

-- RTP Company
UPDATE companies
SET email = 'rtp@rtpcompany.com', phone = '+1 507 4546900', website = 'https://www.rtpcompany.com', foundation_year = '1982', sales_volume = '> 100 Mill. US $', employees_count = '> 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'RTP Company';

-- Isik Plastik A.S.
UPDATE companies
SET email = 'info@isikplastik.com.tr', phone = '+90 262 7512235', website = 'https://www.isikplastik.com.tr', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Isik Plastik A.S.';

