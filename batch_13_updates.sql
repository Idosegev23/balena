-- Batch 13 Update Commands
-- Companies 61 to 65

-- BEGRA Granulate GmbH & Co. KG
UPDATE companies
SET email = 'granulate@begra.de', phone = '+49 6848 7003-0', website = 'https://www.begra.de', foundation_year = '1972', export_content = 'max. 50%', employees_count = '101 - 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BEGRA Granulate GmbH & Co. KG';

-- KRAIBURG TPE GmbH & Co. KG
UPDATE companies
SET email = 'info@kraiburg-tpe.com', phone = '+49 8638 98100', website = 'https://www.kraiburg.tpe.com', foundation_year = '2001', employees_count = 'worldwide and production sites in Germany, the USA and Malaysia, the company offers a broad product portfolio for applications in the automotive, industrial and consumer goods industries as well as for the strictly regulated medical sector.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'KRAIBURG TPE GmbH & Co. KG';

-- Guangzhou Meihe Chemical Limited
UPDATE companies
SET email = 'info@synchemer.com', phone = '+86 20 36685350', website = 'https://www.synchemer.com', foundation_year = '2012', export_content = '> 75%', employees_count = '101 - 500', company_description = 'SYNCHEMER CO., LIMITED is a High-Tech Enterprise, we are focusing on polymer additives developing, producing and selling. The products are widely used in automotive, construction, electronics, pharmaceutical industries… Benefit from Global and Domest...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Guangzhou Meihe Chemical Limited';

-- K.D. Feddersen Ueberseegesellschaft mbH
UPDATE companies
SET email = 'polymers@kdfeddersen.com', phone = '+49 40 23507-535', website = 'https://kdfeddersen.global', foundation_year = '1949', company_description = 'With more than 75 years of experience, K.D. Feddersen Ueberseegesellschaft specializes in global polymer sourcing - offering the very best polymer, additive, or filler material for our customers.Our portfolio comprises a range of polymers, additives ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'K.D. Feddersen Ueberseegesellschaft mbH';

-- EMS-CHEMIE (Deutschland) Vertriebs GmbH
UPDATE companies
SET email = 'welcome@de.emsgrivory.com', phone = '+49 6078 7830', website = 'https://www.emsgrivory.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'EMS-CHEMIE (Deutschland) Vertriebs GmbH';

