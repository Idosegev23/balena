-- Batch 19 Update Commands
-- Companies 91 to 95

-- BANDERA LUIGI COSTRUZIONI MECCANICHE SPA
UPDATE companies
SET email = 'lbandera@lbandera.com', phone = '+39 0331 398-111', website = 'https://luigibandera.com', foundation_year = '1947', sales_volume = '20 - 100 Mill. US $', export_content = '> 75%', employees_count = '101 - 500', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'BANDERA LUIGI COSTRUZIONI MECCANICHE SPA';

-- Beologic NV
UPDATE companies
SET email = 'info@beologic.com', phone = '+32 56 735325', website = 'https://www.beologic.com', foundation_year = '2002', employees_count = '11 - 30', company_description = 'Sustainability can be challenging – we help you make it workAt Beologic, we create thermoplastic pellets and powders for injection molding, rotational molding, and extrusion. With over 20 years of expertise, we combine innovation and sustainability t...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Beologic NV';

-- Addiplast Group S.A.S.
UPDATE companies
SET email = 'contact@addiplast-group.com', phone = '+33 4 71751090', website = 'https://www.addiplast-group.com', foundation_year = '1986', sales_volume = '20 - 100 Mill. US $', export_content = 'max. 75%', employees_count = '101 - 500', company_description = 'Addiplast Group is a family-owned French company and a European leader in the design and production of high-performance thermoplastic compounds and color & fonctional masterbatches. Since 1986, we have combined cutting-edge R&D capabilities with flex...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Addiplast Group S.A.S.';

-- FKuR Kunststoff GmbH
UPDATE companies
SET email = 'sales@fkur.com', phone = '+49 2154 9251-0', website = 'https://www.fkur.com', company_description = 'FKuR is a medium-sized, privately held company focusing on the development, production and marketing of high-quality special compounds and the distribution of plastic specialties and recyclates.Plastics care for Future – Let`s keep it in the loop....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'FKuR Kunststoff GmbH';

-- Sukano AG
UPDATE companies
SET email = 'media@sukano.com', phone = '+41 44 7875777', website = 'https://sukano.com', foundation_year = '1988', company_description = 'Sukano is a global specialist in the development and production of additive and color masterbatches and compounds for polyesters, biopolymers, high-temperature polymers, and specialty resins. The company is driven by expertise and devotes its technic...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Sukano AG';

