-- Batch 9 Update Commands
-- Companies 41 to 45

-- Envalior BV
UPDATE companies
SET email = 'monique.os-van@envalior.com', phone = '+31 6 30503410', website = 'https://envalior.com', company_description = 'At Envalior, we believe that our customers deserve only the highest quality products, services and support. Our commitment to quality is simple: zero defects. To achieve this, we follow a Total Quality Program that focuses on continuous improvement i...', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Envalior BV';

-- MP3 S.R.L.
UPDATE companies
SET email = 'info@ilpa-mp3.com', phone = '+39 051 6715811', website = 'https://www.mp3extrusion.com', foundation_year = '1978', export_content = 'In 2012, MP3 acquired 100% control of AMP Recycling, which boasts a long tradition in the field of plastic material processing. It began making plastic containers in the early ‘70s, especially for the vegetable, flower, plant and tree growing sector and became the national sector leader and a protagonist in Europe.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'MP3 S.R.L.';

-- Ampacet Europe SA
UPDATE companies
SET email = 'marketing.europe@ampacet.com', phone = '+352 29 20991', website = 'https://www.ampacet.com', company_description = 'Founded in 1937, Ampacet Corporation is a leading global masterbatch supplier committed to designing innovative custom colors, high performance additive solutions, multipurpose whites and blacks as well as sustainable masterbatches....', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Ampacet Europe SA';

-- Shree Radhekrishna Extrutech Pvt. Ltd.
UPDATE companies
SET email = 'exports@radhekrishnaexports.com', phone = '+91 79 9924204506', website = 'https://www.extrutech.in', foundation_year = '1992', sales_volume = '5 - 20 Mill. US $', export_content = 'max. 50%', employees_count = '101 - 500', company_description = 'Extrutech is a globally trusted manufacturer and exporter of advanced plastic extrusion machinery, specializing in screw & barrel systems, complete extrusion lines, and both upstream & downstream equipment. With over 32+ years of ......', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'Shree Radhekrishna Extrutech Pvt. Ltd.';

-- TEPE KIMYA SAN VE TIC A.S.
UPDATE companies
SET email = 'info@tepekimya.com', phone = '+90 216 5931920', website = 'https://www.tepekimya.com.tr', export_content = 'ing its products to 60+ countries all across globe and developing its products to provide innovative solutions to industry.', data_source = 'profile_scraping', scraping_status = 'completed', last_detailed_scrape = NOW()
WHERE company = 'TEPE KIMYA SAN VE TIC A.S.';

