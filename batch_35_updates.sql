-- Batch 35 Update Commands
-- Companies 171 to 175

-- Omya GmbH
UPDATE companies
SET email = 'info.polymers@omya.com', phone = '+49 221 3775-224', website = 'https://www.omya.com', sales_volume = '> 100 Mill. US $', employees_count = '> 500', company_description = 'Omya is a leading global producer of essential minerals and a worldwide distributor of specialty materials. Founded in Switzerland in 1884 and privately owned, we employ 9,000 people across 160 plants in 50 countries. Omya provides added-value produc...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Omya GmbH';

-- L. Brüggemann GmbH & Co. KG
UPDATE companies
SET email = 'info@brueggemann.com', phone = '+49 7131 1575-0', website = 'https://www.brueggemann.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'L. Brüggemann GmbH & Co. KG';

-- PREMIUM
UPDATE companies
SET email = 'info@bieglo.com', phone = '+49 40 401130000', website = 'https://www.bieglo.com', company_description = 'The BIEGLO GmbH is a Hamburg-based distribution company specialized in high-performance polymers. Together with our U.S. subsidiary BARplast LLC, which serves the American market, we offer premium thermoplastics such as PEEK, PI (Polyimide), PBI, TPI...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'PREMIUM';

-- SANGIR PLASTICS PVT LTD
UPDATE companies
SET email = 'k2025@sangir.com', website = 'https://www.sangir.com', company_description = 'We are Sangir, a major producer of specialty thermoplastic solutions and a major supplier to diverse industries and projects.Sangir is certified for ISO 9001-2015 and also accredited with ISO 14001:2015 & ISO 45001-2018 Certifications......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'SANGIR PLASTICS PVT LTD';

-- AF-COLOR Zweigniederlassung der AKRO-PLASTIC GmbH
UPDATE companies
SET email = 'info@af-color.com', phone = '+49 2636 80920', website = 'https://www.af-color.com', foundation_year = '2003', employees_count = '31 - 100', company_description = 'Customized masterbatch formulations for your applicationIn every industry, color and function shape the properties and brand image of plastic products. AF-COLOR is your specialist for both commercially available and high-quality technical ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'AF-COLOR Zweigniederlassung der AKRO-PLASTIC GmbH';

