-- Batch 3 Update Commands
-- Companies 11 to 15

-- BIOTEC Biologische Naturverpackungen GmbH & Co. KG
UPDATE companies
SET email = 'inquiries@biotec.de', phone = '+49 2822 9251-0', website = 'https://www.biotec.de', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BIOTEC Biologische Naturverpackungen GmbH & Co. KG';

-- Ascom Carbonate and Chemicals Manufacturing (ACCM)
UPDATE companies
SET email = 'samah.tantawi@accm.com.eg', phone = '+20 202 1224922008', foundation_year = '2009', sales_volume = '> 100 Mill. US $', export_content = '> 75%', employees_count = '> 500', company_description = 'The biggest manufacturer and exporter of ground calcium carbonate in Egypt.subsidiary of ASEC for Mining, ASCOM began production in 2009 and has since developed a reputation for market success. We provide our clients with ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Ascom Carbonate and Chemicals Manufacturing (ACCM)';

-- TRAMACO GmbH
UPDATE companies
SET email = 'info@tramaco.de', phone = '+49 4101 706-02', website = 'https://www.tramaco.de', foundation_year = '1973', employees_count = '31 - 100', company_description = 'Tramaco GmbH specialises in the development, production and sale of innovative, high-quality, high-performance chemical foaming agents, microspheres, adhesion promoters and additives for plastics and rubber processing companies and the coatings indus...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'TRAMACO GmbH';

-- Kromabatch S.r.l.
UPDATE companies
SET email = 'info@kromabatch.com', phone = '+39 0293 560123', website = 'https://www.kromabatch.com', foundation_year = '2009', employees_count = '31 - 100', company_description = 'Kromabatch is an Italian Company manufacturing high quality color and additive Masterbatches and Combi-batches for the Plastics Market.The Company boldly starts in 2009, founded by professionals with strong technical background and world class market...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Kromabatch S.r.l.';

-- BADGER COLOR CONCENTRATES, INC.
UPDATE companies
SET email = 'orders@badgercolor.com', phone = '+1 262 2623635710', website = 'https://www.badgercolor.com', foundation_year = '1998', employees_count = ', we leverage advanced extrusion, milling, and mixing technologies to deliver flexible, reliable, and responsive solutions in masterbatch and liquid color concentrates.', company_description = 'BADGER COLOR USA is passionate about partnering with customers to formulate custom solutions for a sustainable future with industry-leading flexibility, responsiveness, and reliability.Founded in 1998, BADGER COLOR USA is a proud member of ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BADGER COLOR CONCENTRATES, INC.';

