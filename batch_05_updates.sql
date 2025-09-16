-- Batch 5 Update Commands
-- Companies 21 to 25

-- NUREL, S.A.
UPDATE companies
SET email = 'marketing_nurel@samca.com', phone = '+34 976 465579', website = 'https://www.nurel.com', foundation_year = '1968', sales_volume = '> 100 Mill. US $', export_content = 'max. 75%', employees_count = '101 - 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'NUREL, S.A.';

-- Büchler Reinli + Spitzli AG
UPDATE companies
SET email = 'm.voegtle@brsflawil.ch', phone = '+41 71 3941300', website = 'https://www.brsflawil.ch', foundation_year = '1966', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 50%', employees_count = '31 - 100', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Büchler Reinli + Spitzli AG';

-- TECNI-PLASPER SLU
UPDATE companies
SET email = 'plasper@plasper.com', phone = '+34 93 8468369', website = 'https://www.plasper.com', company_description = 'Since 1983, Plasper has been a trusted partner in the plastics industry, offering two key lines of solutions.✅ Our Recycling Line produces high-quality recycled polymers, including P-PVC compounds and HFFR, as well as providing re-compounding service...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'TECNI-PLASPER SLU';

-- Plastiblow S.r.l.
UPDATE companies
SET email = 'plastiblow@plastiblow.it', phone = '+39 02 48012102', website = 'https://www.plastiblow.it', company_description = 'Plastiblow is worldwide recognized as a qualified producer of extrusion blow molding machines. Its range of models cover a variety of applications from bottles to canisters blown from different thermoplastic materials and with capacities up to 30 lit...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Plastiblow S.r.l.';

-- Milliken Europe bv
UPDATE companies
SET email = 'eurochem@milliken.com', phone = '+32 265 11-00', website = 'https://www.milliken.com', company_description = 'Milliken & Company is a global manufacturing leader whose focus on materials science delivers tomorrow’s breakthroughs today. From industry-leading molecules to sustainable innovations, Milliken creates products that enhance people’s lives and ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Milliken Europe bv';

