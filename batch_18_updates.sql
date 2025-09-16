-- Batch 18 Update Commands
-- Companies 86 to 90

-- European Bioplastics e.V.
UPDATE companies
SET email = 'info@european-bioplastics.org', phone = '+49 30 28482-350', website = 'https://www.european-bioplastics.org', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'European Bioplastics e.V.';

-- Frilvam S.p.a.
UPDATE companies
SET email = 'frilvam@frilvam.com', phone = '+39 0331 587171', website = 'https://www.frilvam.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Frilvam S.p.a.';

-- ADVANCED & FUNCTIONAL TECHNOLOGIES FOR BIOCOMPOSITES S.L.
UPDATE companies
SET email = 'info@adbioplastics.com', phone = '+34 96 820000', website = 'https://www.adbioplastics.com', foundation_year = '2016', company_description = 'ADBioplastics is a Spanish company specialised in the development and commercialisation of advanced additives and bioplastics.Our PLA-Premium bioplastic improves elongation at break (mechanical properties) by up to 70%, achieving a version of PLA Pre...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ADVANCED & FUNCTIONAL TECHNOLOGIES FOR BIOCOMPOSITES S.L.';

-- Delta Tecnic, S.A.
UPDATE companies
SET email = 'deltatec@deltatecnic.com', phone = '+34 93 8674284', website = 'https://www.deltatecnic.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Delta Tecnic, S.A.';

-- ASAHI KASEI EUROPE GmbH
UPDATE companies
SET email = 'plastics@asahi-kasei.eu', phone = '+49 211 33992000', website = 'https://www.asahi-kasei.eu', foundation_year = '1922', sales_volume = '> 100 Mill. US $', employees_count = '> 500', company_description = 'With more than 50,000 employees worldwide, the Japanese technology company Asahi Kasei contributes to a sustainable society by providing solutions to the world''s challenges through its three business sectors of Material, Homes, and Health Care. Its ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ASAHI KASEI EUROPE GmbH';

