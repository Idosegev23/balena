-- Batch 4 Update Commands
-- Companies 16 to 20

-- Maskom Plastik Sanayi ve Ticaret AŞ
UPDATE companies
SET email = 'info@maskom.com.tr', phone = '+90 216 5045858', website = 'https://www.maskom.com.tr', foundation_year = '2019', company_description = 'Maskom, which set out with the aim of being a brand that exists and produces solutions wherever there is plastic, started its activities in 2007.Maskom, which moved to Istanbul Gebze facilities in 2009 and Düzce, which carries out its activities toda...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Maskom Plastik Sanayi ve Ticaret AŞ';

-- FAINPLAST S.r.l.
UPDATE companies
SET email = 'info@fainplast.com', phone = '+39 0736 403605', website = 'https://www.fainplast.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'FAINPLAST S.r.l.';

-- RICO Elastomere Projecting GmbH
UPDATE companies
SET email = 'office@rico.at', phone = '+43 7242 76460', website = 'https://www.rico.at', company_description = 'RICO is a global solution provider for individual elastomer and thermoplastics projects and offers a full portfolio of services to meet the needs of its customers, including: product development support, prototyping, custom tooling and automation, as...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'RICO Elastomere Projecting GmbH';

-- DIONYMER SAS
UPDATE companies
SET email = 'thomas.hennebel@dionymer.com', phone = '+33 61450876 614508768', website = 'https://www.dionymer.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'DIONYMER SAS';

-- RUTALIA MASTERBATCHES & ADDITIVES EKOGRANULAT C. BURCHERT - EHM AE
UPDATE companies
SET email = 'rutalia@rutalia.com', phone = '+48 22 4259440', website = 'https://www.rutalia.com', foundation_year = '2006', employees_count = '5 - 10', company_description = 'Our company, RUTALIA Masterbatches & Additives, offers the widest range of products on the market for coloring and modifying plastics.We are a manufacturer and distributor of masterbatches and additives for plastics....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'RUTALIA MASTERBATCHES & ADDITIVES EKOGRANULAT C. BURCHERT - EHM AE';

