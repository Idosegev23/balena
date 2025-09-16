-- Batch 27 Update Commands
-- Companies 131 to 135

-- Fraunhofer-Institut für Umwelt-, Sicherheits- und Energietechnik UMSICHT
UPDATE companies
SET email = 'info@umsicht.fraunhofer.de', phone = '+49 208 8598-0', website = 'https://www.umsicht.fraunhofer.de', company_description = 'Fraunhofer UMSICHT supports industries and society in the transfer to a climate-neutral and circular economic system. Our research focuses on Circular Economy, Green Hydrogen, Carbon Management and Local Energy Systems....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Fraunhofer-Institut für Umwelt-, Sicherheits- und Energietechnik UMSICHT';

-- DK Kunststoff-Service GmbH
UPDATE companies
SET email = 'dk@dk-kunststoffe.de', phone = '+49 521 52044-0', website = 'https://www.dk-kunststoffe.de', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'DK Kunststoff-Service GmbH';

-- K.D. Feddersen GmbH & Co. KG
UPDATE companies
SET email = 'info@kdfeddersen.com', phone = '+49 40 2350701', website = 'https://www.kdfeddersen.com', company_description = 'Wir sind Ihr Partner, wenn es um die Distribution von hochwertigen technischen Kunststoffen geht....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'K.D. Feddersen GmbH & Co. KG';

-- Polyram – MCT Germany GmbH
UPDATE companies
SET email = 'yifat@polyram-group.com', phone = '+972 4 6599-968', website = 'https://www.polyram-group.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Polyram – MCT Germany GmbH';

-- Biesterfeld Plastic GmbH
UPDATE companies
SET email = 'contact@biesterfeld.com', phone = '+49 40 32008-0', website = 'https://www.biesterfeld.com', foundation_year = '1906', sales_volume = 'of 1.4 billion EUR. The fully family-owned company operates in the business divisions Biesterfeld Plastic, Biesterfeld Spezialchemie and Biesterfeld Performance Rubber.', employees_count = 'across 50 locations in Europe, North and South America, Asia and Africa and generates an annual revenue of 1.4 billion EUR. The fully family-owned company operates in the business divisions Biesterfeld Plastic, Biesterfeld Spezialchemie and Biesterfeld Performance Rubber.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Biesterfeld Plastic GmbH';

