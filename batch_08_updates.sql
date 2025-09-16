-- Batch 8 Update Commands
-- Companies 36 to 40

-- Plásticos Compuestos S.A.
UPDATE companies
SET email = 'oficina@kompuestos.com', phone = '+34 93 8639670', website = 'https://www.kompuestos.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Plásticos Compuestos S.A.';

-- Galata Chemicals GmbH
UPDATE companies
SET email = 'galata.emeaorders@galatachemicals.com', phone = '+49 6206 9570', website = 'https://www.galatachemicals.com', foundation_year = '2010', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Galata Chemicals GmbH';

-- Best Machine Company Co. Ltd.
UPDATE companies
SET email = 'info@bestmachine.com.tr', phone = '+90 535 7124359', website = 'https://www.bestmachine.com.tr', export_content = 'ed to more than 5 countries in the world, especially Middle East, which earns us a great reputation. We adhere to the principle of “Quality first, service-orientation” and try to provide the best service. We warmly welcome you to our company and create brilliance together!', company_description = 'Best Machine, an international technology-oriented engineering group company, specialized in technology consulting services and equipments manufacturing.We have strong technical support. of which 60% are professional technicians....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Best Machine Company Co. Ltd.';

-- Terbrack Kunststoff GmbH & Co. KG
UPDATE companies
SET email = 'info@terbrack.de', phone = '+49 2564 393-0', website = 'https://www.terbrack.de', foundation_year = '1954', employees_count = 'one of the leading producers in the field of processing ultra-high and high molecular weight polyethylenes. But also other high performance polymers are processed at TERBRACK.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Terbrack Kunststoff GmbH & Co. KG';

-- ISO-TECH Kunststoff GmbH
UPDATE companies
SET email = 'verkauf@iso-tech.net', phone = '+49 2561 4290-0', website = 'https://www.iso-tech.net', foundation_year = '1990', employees_count = '101 - 500', company_description = 'As one of the leading manufacturers and further processors, ISO-TECH has been producing high-quality thermoplastic products for domestic and foreign customers for more than 30 years. A broad range of production possibilities, a sustainable corporate ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ISO-TECH Kunststoff GmbH';

