-- Batch 21 Update Commands
-- Companies 101 to 105

-- LORENZ Kunststofftechnik GmbH
UPDATE companies
SET email = 'info@lomix.de', phone = '+49 5407 8322-0', website = 'https://www.lomix.de', foundation_year = '1966', company_description = 'As a medium-sized company, we have been your partner in the development and manufacture of customer-specific plastic products for more than 50 years. We are a European leader in the development and production of glass fiber reinforced composites, SMC...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'LORENZ Kunststofftechnik GmbH';

-- Pöppelmann Kunststoff-Technik GmbH & Co. KG
UPDATE companies
SET email = 'k-tech@poeppelmann.com', phone = '+49 4442 982-620', website = 'https://www.poeppelmann.com', foundation_year = '1949', employees_count = '> 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Pöppelmann Kunststoff-Technik GmbH & Co. KG';

-- Gema Elektro Plastik ve Elektronik San. Dis Tic. A.S.
UPDATE companies
SET email = 'info@gemapolimer.com', phone = '+90 232 2515041', website = 'https://www.gemapolimer.com', foundation_year = '1996', export_content = '> 75%', employees_count = '101 - 500', company_description = 'Gema Polimer is among the leading companies in manufacturing Masterbatch & Compounds with a production capacity of 100.000 tons. With experience of more than 40 years in the sector manufacturing the highest quality products in an ever evolving market...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Gema Elektro Plastik ve Elektronik San. Dis Tic. A.S.';

-- JJ Plastalloy Pvt. Ltd.
UPDATE companies
SET email = 'dhirendra@jjplastalloy.com', phone = '+91 22 35127082', website = 'https://www.jjplastalloy.com', export_content = 'ing high-quality masterbatches and polymer compounds tailored for diverse industries, including automotive, packaging, agriculture, and textiles. With over 29 years of expertise, the company provides innovative solutions for color, additive, and specialty requirements, enhancing product performance and sustainability. Recognized as a 2-star export house by the Government of India, JJ Plastalloy...', company_description = 'JJ Plastalloy specializes in manufacturing and exporting high-quality masterbatches and polymer compounds tailored for diverse industries, including automotive, packaging, agriculture, and textiles. With over 29 years of expertise, the company provid...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'JJ Plastalloy Pvt. Ltd.';

-- Shenyang Ketong Plastic Co. ,LTD
UPDATE companies
SET email = 'ketong@syketong.com', phone = '+86 24 89362427', website = 'https://www.syketong.com', foundation_year = '2003', employees_count = '101 - 500', company_description = 'Shenyang Keton Plastics Co.,Ltd.is a high-tech company specializing in the research, production and sales of toughening agents, compatibilizers and functional ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Shenyang Ketong Plastic Co. ,LTD';

