-- Batch 36 Update Commands
-- Companies 176 to 178

-- Miracll Chemicals Co., Ltd.
UPDATE companies
SET email = 'miracll@miracll.com', phone = '+86 535 39798988065', website = 'https://www.miracll.com', foundation_year = '2009', company_description = 'Miracll Chemicals Co., Ltd. was established in 2009, listed company (Code: 300848.SZ), the core products are Thermoplastic Polyurethane Elastomer(TPU), Reactive Polyurethane Hot Melt Adhesive(PUR), Water-Borne Polyurethane(PUD), Biodegradable materia...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Miracll Chemicals Co., Ltd.';

-- BERKIM KAUCUK PLASTIK KIMYA SAN. VE TIC. A.S.
UPDATE companies
SET email = 'info@berkimkimya.com.tr', phone = '+90 264 3535327', website = 'https://www.berkimkimya.com.tr', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BERKIM KAUCUK PLASTIK KIMYA SAN. VE TIC. A.S.';

-- Dow
UPDATE companies
SET email = 'info@dow.com', phone = '+41 44 7282111', website = 'https://www.dow.com', company_description = 'Dow (NYSE: DOW) Packaging & Specialty Plastics (P&SP), a business unit of Dow, combines core strengths of R&D, worldwide reach, broad product lines and industry expertise to deliver high performing technologies for end use markets in food packaging, ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Dow';

