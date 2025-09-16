-- Batch 29 Update Commands
-- Companies 141 to 145

-- IMI FABI S.p.A.
UPDATE companies
SET email = 'info@imifabi.com', phone = '+39 0342 490311', website = 'https://www.imifabi.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'IMI FABI S.p.A.';

-- Nordmann, Rassmann GmbH - Nordmann
UPDATE companies
SET email = 'info@nordmann.global', phone = '+49 40 3687-0', website = 'https://www.nordmann.global', foundation_year = '1912', employees_count = '> 500', company_description = 'The company is one of the leading multinational companies in chemical distribution. With subsidiaries in Europe, Asia and North America, Nordmann distributes natural and chemical raw materials, additives and specialty chemicals around the world. As a...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Nordmann, Rassmann GmbH - Nordmann';

-- WTH Walter Thieme Handel GmbH
UPDATE companies
SET email = 'info@wthgmbh.de', phone = '+49 4141 52920', website = 'https://www.wthgmbh.de', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'WTH Walter Thieme Handel GmbH';

-- ALOXE FRANCE SAS
UPDATE companies
SET email = 'contact@aloxe.one', phone = '+33 67634763 676347635', website = 'https://WWW.ALOXE.ONE', foundation_year = '2020', employees_count = '101 - 500', company_description = 'Aloxe is a pan-European supplier of recycled PET food grade.Our 3 plants in France, Italy and Poland totalize 100 kt installed capacities.Our range of products is standardized across plants and we have state-of-the-art assets, from extrusion and deco...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'ALOXE FRANCE SAS';

-- BRIGHT COLORS SA
UPDATE companies
SET email = 'info@britecolors.gr', phone = '+30 210 6728490', website = 'https://www.britecolors.gr', export_content = 'activity across all Europe, the Middle-East and North Africa.', company_description = 'BRIGHT COLORS S.A. is a leading masterbatch and compounding specialist based in Greece, with strong export activity across all Europe, the Middle-East and North Africa....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BRIGHT COLORS SA';

