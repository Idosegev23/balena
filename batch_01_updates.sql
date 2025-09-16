-- Batch 1 Update Commands
-- Companies 1 to 5

-- Bruker Optics GmbH & Co. KG
UPDATE companies
SET email = 'info.bopt.de@bruker.com', phone = '+49 7243 5042000', website = 'https://www.bruker.com', employees_count = 'are working on this permanent challenge at over 90 locations on all continents. Bruker continues to build upon its extensive range of products and solutions, its broad base of installed systems and a strong reputation among its customers. Being one of the world''s leading analytical instrumentation companies, Bruker is strongly committed to further fully meet its customers’ needs as well as to ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Bruker Optics GmbH & Co. KG';

-- Intertek BV
UPDATE companies
SET email = 'customerservice.geleen@intertek.com', phone = '+31 88 1268889', website = 'https://www.intertek.com', company_description = 'Intertek''s polymer labs provide testing, material qualification, consulting, compounding, processing, failure analysis and materials validation services to accelerate your polymer, recycled material and product development. www.intertek.com/polymers...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Intertek BV';

-- SCJ Plastics Pvt Ltd.
UPDATE companies
SET email = 'info@scjgroup.net', phone = '+91 11 26818181', website = 'https://www.scjindia.in', company_description = 'The SCJ group is a leader in the field of color and additive masterbatches, PVC Compounds, Co-Extruded Sheets and Telecom Cables, providing the plastic processing industry with quality products both for standard, as well as tailor made applications....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'SCJ Plastics Pvt Ltd.';

-- Pleiger Kunststoff GmbH & Co. KG
UPDATE companies
SET email = 'info@pleiger-kunststoff.de', phone = '+49 2324 3980', website = 'https://www.pleiger-kunststoff.de', foundation_year = '1953', employees_count = 'have the appropriate know-how in the areas of design, formulation development, tool and mold construction, as well as production and sales.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Pleiger Kunststoff GmbH & Co. KG';

-- Stearinerie Dubois SA
UPDATE companies
SET email = 'info@stearinerie-dubois.fr', phone = '+331461007320 1 4610073', website = 'https://www.stearinerie-dubois.com', employees_count = '101 - 500', company_description = 'Stéarinerie Dubois offers a wide range of bio-based and synthetic additives for the rubber and polymer industry....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Stearinerie Dubois SA';

