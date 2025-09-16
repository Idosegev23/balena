-- Batch 6 Update Commands
-- Companies 26 to 30

-- Celanese Sales Germany GmbH
UPDATE companies
SET email = 'marcomminfo@celanese.com', phone = '+49 69 450090', website = 'https://www.celanese.com', employees_count = 'together with local partners to create meaningful, sustained change.', company_description = 'Our Vision at Celanese is to improve the world and everyday life through our people, chemistry and innovation. So, it follows that the Celanese Foundation is aligned with this vision and is dedicated to improving the quality of life for people around...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Celanese Sales Germany GmbH';

-- Joss Elastomers & Chemicals B.V.
UPDATE companies
SET email = 'info@joss.nl', phone = '+31 72 51570-64', website = 'https://www.joss.nl', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Joss Elastomers & Chemicals B.V.';

-- Kuraray Europe GmbH
UPDATE companies
SET email = 'k-show@kuraray.com', phone = '+49 69 30585300', website = 'https://www.kuraray.eu', foundation_year = '1926', employees_count = '> 500', company_description = 'Kuraray Europe GmbH was founded in 1991. The company is headquartered in Hattersheim near Frankfurt am Main and generated annual sales of 1.1 billion euros in 2024. Across Germany, more than 820 ...Exclusive K Show Landing Page: https://go.kuraray.co...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Kuraray Europe GmbH';

-- Bruker BioSpin GmbH & Co. KG
UPDATE companies
SET email = 'info@bruker.com', phone = '+49 7243 7695-000', website = 'https://www.bruker.com', company_description = 'The Bruker BioSpin Group develops, manufactures, and distributes advanced scientific instruments based on magnetic resonance and preclinical imaging technologies. This includes leading NMR, EPR, and TD-NMR spectrometers, as well as imaging systems ut...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Bruker BioSpin GmbH & Co. KG';

-- Symplast Kimya San. ve Tic. A.S.
UPDATE companies
SET email = 'info@symplast.de', phone = '+90 232 3257171', website = 'https://symplast.com.tr', foundation_year = '2013', employees_count = '101 - 500', company_description = 'Symplast is a globally operating compounder of thermoplastic elastomers (TPE) and thermoplastic vulcanizates (TPV), founded in 2013 in Izmir—where our headquarters and production facilities are still located today. Our European operations are managed...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Symplast Kimya San. ve Tic. A.S.';

