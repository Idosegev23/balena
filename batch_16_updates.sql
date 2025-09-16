-- Batch 16 Update Commands
-- Companies 76 to 80

-- Gianeco srl
UPDATE companies
SET email = 'info@gianeco.com', phone = '+39 011 9370420', website = 'https://www.gianeco.com', foundation_year = '2013', export_content = '> 75%', company_description = 'Gianeco S.r.l., founded in 2013 in Turin, gives new life to over 2,000 tons of recycled thermoplastic elastomers and bioplastics every year. We operate in 45+ countries, serving sectors like construction, agriculture, fashion, design, and packaging, ...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Gianeco srl';

-- Cabot Switzerland GmbH
UPDATE companies
SET email = 'cabot.plastics@cabotcorp.com', phone = '+41 52 630380', website = 'https://www.cabotcorp.com', employees_count = '> 500', company_description = 'Cabot Corporation is a leading global specialty chemicals and performance materials company headquartered in Boston, Massachusetts, USA, and has been providing innovative performance solutions to customers for over 140 years. We are a leading provide...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Cabot Switzerland GmbH';

-- Clariant SE, Frankfurt am Main Muttenz Branch, Switzerland
UPDATE companies
SET email = 'bernardo.rosa@clariant.com', phone = '+49 69 30580388', website = 'https://www.clariant.com', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Clariant SE, Frankfurt am Main Muttenz Branch, Switzerland';

-- VEKA AG Ein Unternehmen der Laumann Gruppe
UPDATE companies
SET email = 'info@vekaplan.de', phone = '+49 48324 02526-290', website = 'https://www.vekaplan.de', employees_count = '. For this simple but decisive reason, VEKA focuses on the greatest possible qualification in the selection, education and training of its employees. After all, VEKAPLAN partners rightly expect the highest level of performance, service and competence.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'VEKA AG Ein Unternehmen der Laumann Gruppe';

-- IKS Schön GmbH
UPDATE companies
SET email = 'kontakt@iks-schoen.de', phone = '+49 2131 38424-0', website = 'https://www.weltderkunststoffe.de', foundation_year = '1974', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 25%', employees_count = '11 - 30', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'IKS Schön GmbH';

