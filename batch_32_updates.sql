-- Batch 32 Update Commands
-- Companies 156 to 160

-- Barnes Group Acquisition GmbH
UPDATE companies
SET email = 'lhaack@onebarnes.com', phone = '+49 7663 609-0', foundation_year = '1965', employees_count = 'in Europe, the USA and Asia, is one of the leading suppliers in the industry. Since 2013, männer has been part of Barnes Group Inc.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Barnes Group Acquisition GmbH';

-- IMERYS SA
UPDATE companies
SET website = 'https://www.imerys.com', employees_count = '> 500', company_description = 'Imerys is the world leader in mineral-based specialties, offering high value-added solutions to many different industries, ranging from process manufacturing to consumer goods.We engineer minerals that make excellent reinforcing fillers and nucleatin...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'IMERYS SA';

-- GKG Goldmann Kunststoffe GmbH & Co. KG
UPDATE companies
SET email = 'info@gold-mann.de', phone = '+49 521 93278-0', website = 'https://www.gold-mann.de', export_content = 'merchant. At the same time, we enable science graduates to start their careers directly after graduation.', employees_count = 'Through the targeted selection, promotion and training of our colleagues, we ensure a high level of knowledge and competence in chemical, technical and commercial matters for the Goldmann Group.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'GKG Goldmann Kunststoffe GmbH & Co. KG';

-- Supreme Petrochem Ltd.
UPDATE companies
SET email = 'kb_mathew@spl.co.in', phone = '+91 22 67091900', website = 'https://www.supremepetrochem.com', foundation_year = '1942', export_content = 's have grown considerably too. Today the company proudly serves customers in more than 100 countries worldwide.', company_description = 'Supreme Petrochem Ltd. is promoted jointly by The Supreme Industries Ltd., India’s largest plastics processor, and the well diversified R. Raheja Investments Pvt Ltd.The Supreme Industries Limited, founded in 1942 has been relevant with the ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Supreme Petrochem Ltd.';

-- Rajiv Plastics Pvt. Ltd.
UPDATE companies
SET email = 'information@rajivplastics.com', phone = '+91 22 66929701', website = 'https://www.rajivplastics.com', foundation_year = '1978', sales_volume = '20 - 100 Mill. US $', export_content = 'max. 50%', employees_count = '101 - 500', company_description = 'Rajiv Plastics is one of Asia’s leading Color & Additive Masterbatch and Compound manufacturers. Incorporated in 1978, we are an ISO 9001:2015 certified company with world class manufacturing facilities. We export to more than 60 countries worldwide....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Rajiv Plastics Pvt. Ltd.';

