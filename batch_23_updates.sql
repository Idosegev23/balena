-- Batch 23 Update Commands
-- Companies 111 to 115

-- ACTEGA GmbH
UPDATE companies
SET company_description = 'ACTEGA DS GmbH was founded in 1920 under the name of Diersch & Schröder. The company specializes in the manufacture and development of soft elastic plastics in granulate form and sealing compounds for food closures and packaging, TPE materials for me...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ACTEGA GmbH';

-- Evonik Industries AG
UPDATE companies
SET email = 'info@evonik.com', phone = '+49 201 177-01', website = 'https://www.evonik.com', company_description = 'Evonik is a superforce for global industry. Every day, we go beyond the boundaries of chemistry with our combination of innovative strength and leading technological expertise.Customer-tailored solutions include high-performance polymers such as PA12...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Evonik Industries AG';

-- ADEKA Polymer Additives Europe SAS
UPDATE companies
SET email = 'contact@adeka-pa.eu', phone = '+33 3 68750530', website = 'https://www.adeka-pa.eu', foundation_year = '1917', sales_volume = '> 100 Mill. US $', export_content = 'max. 75%', employees_count = '> 500', company_description = 'ADEKA Corporation is a speciality chemicals, electronic, life sciences company with a worldwide turnover in excess of € 2 billion per year.The polymer additives division forms a strategic and integral business for ADEKA. We are a global company with ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ADEKA Polymer Additives Europe SAS';

-- PALMAROLE AG
UPDATE companies
SET email = 'contact@palmarole.ch', phone = '+41 61 2810376', website = 'https://www.palmarole.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'PALMAROLE AG';

-- ADVANCE BIO MATERIAL CO PVT LTD
UPDATE companies
SET email = 'info@advancebioplast.com', phone = '+91 80 80209351', website = 'https://www.advancebioplast.com', foundation_year = '2012', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 10%', employees_count = '31 - 100', company_description = 'Advance Bio Material P. Ltd. is an innovator and is dedicated to developing high-performance Bioplastics. We serve a global customer base with design and technical support. Our India operation has offices in Mumbai, Ahmedabad, Chennai, and Delhi, cov...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ADVANCE BIO MATERIAL CO PVT LTD';

