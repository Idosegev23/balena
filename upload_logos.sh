#!/bin/bash

# Upload logos to Supabase Storage

echo 'Uploading logo 1/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Amandus_Kahl_GmbH__Co_KG.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Amandus_Kahl_GmbH__Co_KG.svg' 
echo ''

echo 'Uploading logo 2/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Apex-Desco_Machine_Company_Corp.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Apex-Desco_Machine_Company_Corp.svg' 
echo ''

echo 'Uploading logo 3/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BASF_SE.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BASF_SE.jpg' 
echo ''

echo 'Uploading logo 4/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Axxicon_BV.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Axxicon_BV.png' 
echo ''

echo 'Uploading logo 5/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Addiplast_Group_SAS.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Addiplast_Group_SAS.jpg' 
echo ''

echo 'Uploading logo 6/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ALESSIOHITECH_SRL.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ALESSIOHITECH_SRL.png' 
echo ''

echo 'Uploading logo 7/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BANDERA_LUIGI_COSTRUZIONI_MECCANICHE_SPA.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BANDERA_LUIGI_COSTRUZIONI_MECCANICHE_SPA.jpg' 
echo ''

echo 'Uploading logo 8/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Bekum_Maschinenfabriken_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Bekum_Maschinenfabriken_GmbH.svg' 
echo ''

echo 'Uploading logo 9/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Altero_Recycling_Machinery_SL.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Altero_Recycling_Machinery_SL.png' 
echo ''

echo 'Uploading logo 10/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Hans_Weber_Maschinenfabrik_GmbH.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Hans_Weber_Maschinenfabrik_GmbH.png' 
echo ''

echo 'Uploading logo 11/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_bauku_extrusion_technology_UG.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_bauku_extrusion_technology_UG.jpg' 
echo ''

echo 'Uploading logo 12/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BEN_Kunststoffe_Vertriebs-_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BEN_Kunststoffe_Vertriebs-_GmbH.svg' 
echo ''

echo 'Uploading logo 13/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_AVANZARE_Innovacion_Tecnologica_SL.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_AVANZARE_Innovacion_Tecnologica_SL.png' 
echo ''

echo 'Uploading logo 14/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_AF-COLOR_Zweigniederlassung_der_AKRO-PLASTIC_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_AF-COLOR_Zweigniederlassung_der_AKRO-PLASTIC_GmbH.svg' 
echo ''

echo 'Uploading logo 15/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Battaggion_SpA.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Battaggion_SpA.png' 
echo ''

echo 'Uploading logo 16/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BBA_Innova_AG.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BBA_Innova_AG.png' 
echo ''

echo 'Uploading logo 17/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Albrecht_Bäumer_GmbH__Co_KG.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Albrecht_Bäumer_GmbH__Co_KG.svg' 
echo ''

echo 'Uploading logo 18/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Axens_SA.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Axens_SA.svg' 
echo ''

echo 'Uploading logo 19/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ASAHI_KASEI_EUROPE_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ASAHI_KASEI_EUROPE_GmbH.svg' 
echo ''

echo 'Uploading logo 20/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BADGER_COLOR_CONCENTRATES_INC.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BADGER_COLOR_CONCENTRATES_INC.jpg' 
echo ''

echo 'Uploading logo 21/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ALBIS_Distribution_GmbH__Co_KG.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ALBIS_Distribution_GmbH__Co_KG.png' 
echo ''

echo 'Uploading logo 22/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_AMIK_ITALIA_SPA.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_AMIK_ITALIA_SPA.png' 
echo ''

echo 'Uploading logo 23/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_AGRANA_Stärke_GmbH.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_AGRANA_Stärke_GmbH.png' 
echo ''

echo 'Uploading logo 24/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ACTEGA_GmbH.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ACTEGA_GmbH.jpg' 
echo ''

echo 'Uploading logo 25/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BARLOG_Plastics_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BARLOG_Plastics_GmbH.svg' 
echo ''

echo 'Uploading logo 26/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_eprotec_extrusion_technology_AG.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_eprotec_extrusion_technology_AG.jpg' 
echo ''

echo 'Uploading logo 27/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ALOXE_FRANCE_SAS.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ALOXE_FRANCE_SAS.svg' 
echo ''

echo 'Uploading logo 28/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_SANGIR_PLASTICS_PVT_LTD.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_SANGIR_PLASTICS_PVT_LTD.png' 
echo ''

echo 'Uploading logo 29/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_AISA_Automation_Industrielle_SA.jpg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/jpeg' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_AISA_Automation_Industrielle_SA.jpg' 
echo ''

echo 'Uploading logo 30/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BDI-BioEnergy_International_GmbH.svg' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/svg+xml' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BDI-BioEnergy_International_GmbH.svg' 
echo ''

echo 'Uploading logo 31/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ADEKA_Polymer_Additives_Europe_SAS.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ADEKA_Polymer_Additives_Europe_SAS.png' 
echo ''

echo 'Uploading logo 32/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_BEGRA_Granulate_GmbH__Co_KG.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_BEGRA_Granulate_GmbH__Co_KG.png' 
echo ''

echo 'Uploading logo 33/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Astra_Polymer_Compounding_Co_Ltd.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Astra_Polymer_Compounding_Co_Ltd.png' 
echo ''

echo 'Uploading logo 34/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Axia_Plastics_LLC.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Axia_Plastics_LLC.png' 
echo ''

echo 'Uploading logo 35/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_ASPEN_GLOBAL_SOLUTIONS_SAS.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_ASPEN_GLOBAL_SOLUTIONS_SAS.png' 
echo ''

echo 'Uploading logo 36/36...'
curl -X POST \
  'https://luxmmluqpyjzkepidsjk.supabase.co/storage/v1/object/company-logos/logos/logo_Ampacet_Europe_SA.png' \
  -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eG1tbHVxcHlqemtlcGlkc2prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDg2NDc2MSwiZXhwIjoyMDQwNDQwNzYxfQ.P3kNhDhJBnFXBgqrfCmQJOQZjKoJdCl8YHQpYvKNGHs' \
  -H 'content-type: image/png' \
  --data-binary '@/Users/idosegev/Downloads/TriRoars/balena/logos/logo_Ampacet_Europe_SA.png' 
echo ''

