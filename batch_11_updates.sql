-- Batch 11 Update Commands
-- Companies 51 to 55

-- BDL S.R.L.
UPDATE companies
SET email = 'info@bidielle.com', phone = '+39 0522 922521', website = 'https://www.bidielle.com', foundation_year = '1977', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 50%', employees_count = '31 - 100', company_description = 'For over 40 years, BDL has been dedicated to the manufacturing of plastic injection molds. A constant commitment to quality has led to the creation of a flexible and dynamic structure, capable of offering each client tailored solutions to their speci...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BDL S.R.L.';

-- Axia Plastics LLC
UPDATE companies
SET email = 'poliveira@vinmar.com', phone = '+31 61 5689952', website = 'https://axiaplastics.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Axia Plastics LLC';

-- Dynasol Group
UPDATE companies
SET email = 'daniela.quintero@dynasol.com', phone = '+1 281 8851700', website = 'https://dynasolgroup.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Dynasol Group';

-- Us Masterbatch Joint Stock Company
UPDATE companies
SET email = 'info@usmasterbatch.com', phone = '+84 24 6682771', website = 'https://usmasterbatch.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Us Masterbatch Joint Stock Company';

-- Polymer-Service PSG GmbH
UPDATE companies
SET email = 'info@polymer-service.de', phone = '+49 40 30902-400', website = 'https://www.polymer-service.de', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Polymer-Service PSG GmbH';

