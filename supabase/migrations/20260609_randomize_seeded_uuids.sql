/*
  # Replace predictable sequential UUIDs with random UUIDs

  Temporarily makes FK constraints DEFERRABLE so all updates happen
  in a single transaction, then constraint checks run at commit time.
*/

BEGIN;

-- Make FK constraints deferrable for this transaction
ALTER TABLE advancement_decisions DROP CONSTRAINT advancement_decisions_student_id_fkey;
ALTER TABLE student_year_profiles DROP CONSTRAINT student_year_profiles_student_id_fkey;
ALTER TABLE student_place_assignments DROP CONSTRAINT student_place_assignments_student_id_fkey;
ALTER TABLE student_enrollments DROP CONSTRAINT student_enrollments_student_id_fkey;
ALTER TABLE student_metrics_records DROP CONSTRAINT student_metrics_records_student_id_fkey;
ALTER TABLE advancement_decisions DROP CONSTRAINT advancement_decisions_session_id_fkey;

-- Update student_metrics_students (parent)
UPDATE student_metrics_students SET id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE student_metrics_students SET id = '175763ac-6988-4341-8285-221c048a3657' WHERE id = 'a0000001-0000-0000-0000-000000000002';
UPDATE student_metrics_students SET id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE id = 'a0000001-0000-0000-0000-000000000003';
UPDATE student_metrics_students SET id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE id = 'a0000001-0000-0000-0000-000000000004';
UPDATE student_metrics_students SET id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE id = 'a0000001-0000-0000-0000-000000000005';
UPDATE student_metrics_students SET id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE id = 'a0000001-0000-0000-0000-000000000006';
UPDATE student_metrics_students SET id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE id = 'a0000001-0000-0000-0000-000000000007';
UPDATE student_metrics_students SET id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE id = 'a0000001-0000-0000-0000-000000000008';
UPDATE student_metrics_students SET id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE id = 'a0000001-0000-0000-0000-000000000009';
UPDATE student_metrics_students SET id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE id = 'a0000001-0000-0000-0000-000000000010';
UPDATE student_metrics_students SET id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE id = 'a0000001-0000-0000-0000-000000000011';
UPDATE student_metrics_students SET id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE id = 'a0000001-0000-0000-0000-000000000012';
UPDATE student_metrics_students SET id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE id = 'a0000001-0000-0000-0000-000000000013';
UPDATE student_metrics_students SET id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE id = 'a0000001-0000-0000-0000-000000000014';
UPDATE student_metrics_students SET id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE id = 'a0000001-0000-0000-0000-000000000015';
UPDATE student_metrics_students SET id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE id = 'a0000001-0000-0000-0000-000000000016';
UPDATE student_metrics_students SET id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE id = 'a0000001-0000-0000-0000-000000000017';
UPDATE student_metrics_students SET id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE id = 'a0000001-0000-0000-0000-000000000018';
UPDATE student_metrics_students SET id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE id = 'a0000001-0000-0000-0000-000000000019';
UPDATE student_metrics_students SET id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE id = 'a0000001-0000-0000-0000-000000000020';
UPDATE student_metrics_students SET id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE id = 'a0000001-0000-0000-0000-000000000021';
UPDATE student_metrics_students SET id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE id = 'a0000001-0000-0000-0000-000000000022';
UPDATE student_metrics_students SET id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE id = 'a0000001-0000-0000-0000-000000000023';
UPDATE student_metrics_students SET id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE id = 'a0000001-0000-0000-0000-000000000024';
UPDATE student_metrics_students SET id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE id = 'a0000001-0000-0000-0000-000000000025';
UPDATE student_metrics_students SET id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE id = 'a0000001-0000-0000-0000-000000000026';
UPDATE student_metrics_students SET id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE id = 'a0000001-0000-0000-0000-000000000027';

-- Update child tables
UPDATE student_metrics_records SET student_id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE student_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE student_metrics_records SET student_id = '175763ac-6988-4341-8285-221c048a3657' WHERE student_id = 'a0000001-0000-0000-0000-000000000002';
UPDATE student_metrics_records SET student_id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE student_id = 'a0000001-0000-0000-0000-000000000003';
UPDATE student_metrics_records SET student_id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE student_id = 'a0000001-0000-0000-0000-000000000004';
UPDATE student_metrics_records SET student_id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE student_id = 'a0000001-0000-0000-0000-000000000005';
UPDATE student_metrics_records SET student_id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE student_id = 'a0000001-0000-0000-0000-000000000006';
UPDATE student_metrics_records SET student_id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE student_id = 'a0000001-0000-0000-0000-000000000007';
UPDATE student_metrics_records SET student_id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE student_id = 'a0000001-0000-0000-0000-000000000008';
UPDATE student_metrics_records SET student_id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE student_id = 'a0000001-0000-0000-0000-000000000009';
UPDATE student_metrics_records SET student_id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE student_id = 'a0000001-0000-0000-0000-000000000010';
UPDATE student_metrics_records SET student_id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE student_id = 'a0000001-0000-0000-0000-000000000011';
UPDATE student_metrics_records SET student_id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE student_id = 'a0000001-0000-0000-0000-000000000012';
UPDATE student_metrics_records SET student_id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE student_id = 'a0000001-0000-0000-0000-000000000013';
UPDATE student_metrics_records SET student_id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE student_id = 'a0000001-0000-0000-0000-000000000014';
UPDATE student_metrics_records SET student_id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE student_id = 'a0000001-0000-0000-0000-000000000015';
UPDATE student_metrics_records SET student_id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE student_id = 'a0000001-0000-0000-0000-000000000016';
UPDATE student_metrics_records SET student_id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE student_id = 'a0000001-0000-0000-0000-000000000017';
UPDATE student_metrics_records SET student_id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE student_id = 'a0000001-0000-0000-0000-000000000018';
UPDATE student_metrics_records SET student_id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE student_id = 'a0000001-0000-0000-0000-000000000019';
UPDATE student_metrics_records SET student_id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE student_id = 'a0000001-0000-0000-0000-000000000020';
UPDATE student_metrics_records SET student_id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE student_id = 'a0000001-0000-0000-0000-000000000021';
UPDATE student_metrics_records SET student_id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE student_id = 'a0000001-0000-0000-0000-000000000022';
UPDATE student_metrics_records SET student_id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE student_id = 'a0000001-0000-0000-0000-000000000023';
UPDATE student_metrics_records SET student_id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE student_id = 'a0000001-0000-0000-0000-000000000024';
UPDATE student_metrics_records SET student_id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE student_id = 'a0000001-0000-0000-0000-000000000025';
UPDATE student_metrics_records SET student_id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE student_id = 'a0000001-0000-0000-0000-000000000026';
UPDATE student_metrics_records SET student_id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE student_id = 'a0000001-0000-0000-0000-000000000027';

UPDATE student_enrollments SET student_id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE student_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE student_enrollments SET student_id = '175763ac-6988-4341-8285-221c048a3657' WHERE student_id = 'a0000001-0000-0000-0000-000000000002';
UPDATE student_enrollments SET student_id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE student_id = 'a0000001-0000-0000-0000-000000000003';
UPDATE student_enrollments SET student_id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE student_id = 'a0000001-0000-0000-0000-000000000004';
UPDATE student_enrollments SET student_id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE student_id = 'a0000001-0000-0000-0000-000000000005';
UPDATE student_enrollments SET student_id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE student_id = 'a0000001-0000-0000-0000-000000000006';
UPDATE student_enrollments SET student_id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE student_id = 'a0000001-0000-0000-0000-000000000007';
UPDATE student_enrollments SET student_id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE student_id = 'a0000001-0000-0000-0000-000000000008';
UPDATE student_enrollments SET student_id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE student_id = 'a0000001-0000-0000-0000-000000000009';
UPDATE student_enrollments SET student_id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE student_id = 'a0000001-0000-0000-0000-000000000010';
UPDATE student_enrollments SET student_id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE student_id = 'a0000001-0000-0000-0000-000000000011';
UPDATE student_enrollments SET student_id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE student_id = 'a0000001-0000-0000-0000-000000000012';
UPDATE student_enrollments SET student_id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE student_id = 'a0000001-0000-0000-0000-000000000013';
UPDATE student_enrollments SET student_id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE student_id = 'a0000001-0000-0000-0000-000000000014';
UPDATE student_enrollments SET student_id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE student_id = 'a0000001-0000-0000-0000-000000000015';
UPDATE student_enrollments SET student_id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE student_id = 'a0000001-0000-0000-0000-000000000016';
UPDATE student_enrollments SET student_id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE student_id = 'a0000001-0000-0000-0000-000000000017';
UPDATE student_enrollments SET student_id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE student_id = 'a0000001-0000-0000-0000-000000000018';
UPDATE student_enrollments SET student_id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE student_id = 'a0000001-0000-0000-0000-000000000019';
UPDATE student_enrollments SET student_id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE student_id = 'a0000001-0000-0000-0000-000000000020';
UPDATE student_enrollments SET student_id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE student_id = 'a0000001-0000-0000-0000-000000000021';
UPDATE student_enrollments SET student_id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE student_id = 'a0000001-0000-0000-0000-000000000022';
UPDATE student_enrollments SET student_id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE student_id = 'a0000001-0000-0000-0000-000000000023';
UPDATE student_enrollments SET student_id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE student_id = 'a0000001-0000-0000-0000-000000000024';
UPDATE student_enrollments SET student_id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE student_id = 'a0000001-0000-0000-0000-000000000025';
UPDATE student_enrollments SET student_id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE student_id = 'a0000001-0000-0000-0000-000000000026';
UPDATE student_enrollments SET student_id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE student_id = 'a0000001-0000-0000-0000-000000000027';

UPDATE student_place_assignments SET student_id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE student_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE student_place_assignments SET student_id = '175763ac-6988-4341-8285-221c048a3657' WHERE student_id = 'a0000001-0000-0000-0000-000000000002';
UPDATE student_place_assignments SET student_id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE student_id = 'a0000001-0000-0000-0000-000000000003';
UPDATE student_place_assignments SET student_id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE student_id = 'a0000001-0000-0000-0000-000000000004';
UPDATE student_place_assignments SET student_id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE student_id = 'a0000001-0000-0000-0000-000000000005';
UPDATE student_place_assignments SET student_id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE student_id = 'a0000001-0000-0000-0000-000000000006';
UPDATE student_place_assignments SET student_id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE student_id = 'a0000001-0000-0000-0000-000000000007';
UPDATE student_place_assignments SET student_id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE student_id = 'a0000001-0000-0000-0000-000000000008';
UPDATE student_place_assignments SET student_id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE student_id = 'a0000001-0000-0000-0000-000000000009';
UPDATE student_place_assignments SET student_id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE student_id = 'a0000001-0000-0000-0000-000000000010';
UPDATE student_place_assignments SET student_id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE student_id = 'a0000001-0000-0000-0000-000000000011';
UPDATE student_place_assignments SET student_id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE student_id = 'a0000001-0000-0000-0000-000000000012';
UPDATE student_place_assignments SET student_id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE student_id = 'a0000001-0000-0000-0000-000000000013';
UPDATE student_place_assignments SET student_id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE student_id = 'a0000001-0000-0000-0000-000000000014';
UPDATE student_place_assignments SET student_id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE student_id = 'a0000001-0000-0000-0000-000000000015';
UPDATE student_place_assignments SET student_id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE student_id = 'a0000001-0000-0000-0000-000000000016';
UPDATE student_place_assignments SET student_id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE student_id = 'a0000001-0000-0000-0000-000000000017';
UPDATE student_place_assignments SET student_id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE student_id = 'a0000001-0000-0000-0000-000000000018';
UPDATE student_place_assignments SET student_id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE student_id = 'a0000001-0000-0000-0000-000000000019';
UPDATE student_place_assignments SET student_id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE student_id = 'a0000001-0000-0000-0000-000000000020';
UPDATE student_place_assignments SET student_id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE student_id = 'a0000001-0000-0000-0000-000000000021';
UPDATE student_place_assignments SET student_id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE student_id = 'a0000001-0000-0000-0000-000000000022';
UPDATE student_place_assignments SET student_id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE student_id = 'a0000001-0000-0000-0000-000000000023';
UPDATE student_place_assignments SET student_id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE student_id = 'a0000001-0000-0000-0000-000000000024';
UPDATE student_place_assignments SET student_id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE student_id = 'a0000001-0000-0000-0000-000000000025';
UPDATE student_place_assignments SET student_id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE student_id = 'a0000001-0000-0000-0000-000000000026';
UPDATE student_place_assignments SET student_id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE student_id = 'a0000001-0000-0000-0000-000000000027';

UPDATE student_year_profiles SET student_id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE student_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE student_year_profiles SET student_id = '175763ac-6988-4341-8285-221c048a3657' WHERE student_id = 'a0000001-0000-0000-0000-000000000002';
UPDATE student_year_profiles SET student_id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE student_id = 'a0000001-0000-0000-0000-000000000003';
UPDATE student_year_profiles SET student_id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE student_id = 'a0000001-0000-0000-0000-000000000004';
UPDATE student_year_profiles SET student_id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE student_id = 'a0000001-0000-0000-0000-000000000005';
UPDATE student_year_profiles SET student_id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE student_id = 'a0000001-0000-0000-0000-000000000006';
UPDATE student_year_profiles SET student_id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE student_id = 'a0000001-0000-0000-0000-000000000007';
UPDATE student_year_profiles SET student_id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE student_id = 'a0000001-0000-0000-0000-000000000008';
UPDATE student_year_profiles SET student_id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE student_id = 'a0000001-0000-0000-0000-000000000009';
UPDATE student_year_profiles SET student_id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE student_id = 'a0000001-0000-0000-0000-000000000010';
UPDATE student_year_profiles SET student_id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE student_id = 'a0000001-0000-0000-0000-000000000011';
UPDATE student_year_profiles SET student_id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE student_id = 'a0000001-0000-0000-0000-000000000012';
UPDATE student_year_profiles SET student_id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE student_id = 'a0000001-0000-0000-0000-000000000013';
UPDATE student_year_profiles SET student_id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE student_id = 'a0000001-0000-0000-0000-000000000014';
UPDATE student_year_profiles SET student_id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE student_id = 'a0000001-0000-0000-0000-000000000015';
UPDATE student_year_profiles SET student_id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE student_id = 'a0000001-0000-0000-0000-000000000016';
UPDATE student_year_profiles SET student_id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE student_id = 'a0000001-0000-0000-0000-000000000017';
UPDATE student_year_profiles SET student_id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE student_id = 'a0000001-0000-0000-0000-000000000018';
UPDATE student_year_profiles SET student_id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE student_id = 'a0000001-0000-0000-0000-000000000019';
UPDATE student_year_profiles SET student_id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE student_id = 'a0000001-0000-0000-0000-000000000020';
UPDATE student_year_profiles SET student_id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE student_id = 'a0000001-0000-0000-0000-000000000021';
UPDATE student_year_profiles SET student_id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE student_id = 'a0000001-0000-0000-0000-000000000022';
UPDATE student_year_profiles SET student_id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE student_id = 'a0000001-0000-0000-0000-000000000023';
UPDATE student_year_profiles SET student_id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE student_id = 'a0000001-0000-0000-0000-000000000024';
UPDATE student_year_profiles SET student_id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE student_id = 'a0000001-0000-0000-0000-000000000025';
UPDATE student_year_profiles SET student_id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE student_id = 'a0000001-0000-0000-0000-000000000026';
UPDATE student_year_profiles SET student_id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE student_id = 'a0000001-0000-0000-0000-000000000027';

UPDATE advancement_decisions SET student_id = '75d65649-e6ea-48f5-95f9-c8a7489cacbf' WHERE student_id = 'a0000001-0000-0000-0000-000000000001';
UPDATE advancement_decisions SET student_id = '175763ac-6988-4341-8285-221c048a3657' WHERE student_id = 'a0000001-0000-0000-0000-000000000002';
UPDATE advancement_decisions SET student_id = 'de1882f4-8d65-47c7-9c4d-401ec810ca75' WHERE student_id = 'a0000001-0000-0000-0000-000000000003';
UPDATE advancement_decisions SET student_id = '5a7d3133-ed34-4d92-95c3-2136ee73d73b' WHERE student_id = 'a0000001-0000-0000-0000-000000000004';
UPDATE advancement_decisions SET student_id = '9ad930d0-7ba6-4759-8583-7deb64ee5ada' WHERE student_id = 'a0000001-0000-0000-0000-000000000005';
UPDATE advancement_decisions SET student_id = '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' WHERE student_id = 'a0000001-0000-0000-0000-000000000006';
UPDATE advancement_decisions SET student_id = '4008a653-099f-4957-925c-9cab5588bb0e' WHERE student_id = 'a0000001-0000-0000-0000-000000000007';
UPDATE advancement_decisions SET student_id = '1fe3c0af-4a46-41e5-b5ae-e793f0052480' WHERE student_id = 'a0000001-0000-0000-0000-000000000008';
UPDATE advancement_decisions SET student_id = '230292f0-d27b-4a0c-9eba-e09a1ff35271' WHERE student_id = 'a0000001-0000-0000-0000-000000000009';
UPDATE advancement_decisions SET student_id = 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' WHERE student_id = 'a0000001-0000-0000-0000-000000000010';
UPDATE advancement_decisions SET student_id = '22f8ff61-9489-4e2d-bc44-a73d984559b1' WHERE student_id = 'a0000001-0000-0000-0000-000000000011';
UPDATE advancement_decisions SET student_id = '5434e64f-539c-49f1-88a2-1e06e211e13e' WHERE student_id = 'a0000001-0000-0000-0000-000000000012';
UPDATE advancement_decisions SET student_id = '860150c0-01cc-4167-a43c-ee5e799b71eb' WHERE student_id = 'a0000001-0000-0000-0000-000000000013';
UPDATE advancement_decisions SET student_id = 'ed776323-9406-42f9-a545-45e33f42fd3a' WHERE student_id = 'a0000001-0000-0000-0000-000000000014';
UPDATE advancement_decisions SET student_id = '46defcd5-196d-4edd-ab1c-6de089b96edc' WHERE student_id = 'a0000001-0000-0000-0000-000000000015';
UPDATE advancement_decisions SET student_id = 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' WHERE student_id = 'a0000001-0000-0000-0000-000000000016';
UPDATE advancement_decisions SET student_id = '330eb8f4-7da3-4c2c-9931-b35bbd029f86' WHERE student_id = 'a0000001-0000-0000-0000-000000000017';
UPDATE advancement_decisions SET student_id = 'a3f394ab-07d5-4780-b358-85044cfbbee3' WHERE student_id = 'a0000001-0000-0000-0000-000000000018';
UPDATE advancement_decisions SET student_id = '58d03703-a257-4111-a61e-01ca0df0c557' WHERE student_id = 'a0000001-0000-0000-0000-000000000019';
UPDATE advancement_decisions SET student_id = '250d0880-46c2-4672-b038-b8f5a1e26b8d' WHERE student_id = 'a0000001-0000-0000-0000-000000000020';
UPDATE advancement_decisions SET student_id = '8adf9f24-a648-4d73-827e-9e9dabde063e' WHERE student_id = 'a0000001-0000-0000-0000-000000000021';
UPDATE advancement_decisions SET student_id = 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' WHERE student_id = 'a0000001-0000-0000-0000-000000000022';
UPDATE advancement_decisions SET student_id = 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' WHERE student_id = 'a0000001-0000-0000-0000-000000000023';
UPDATE advancement_decisions SET student_id = 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' WHERE student_id = 'a0000001-0000-0000-0000-000000000024';
UPDATE advancement_decisions SET student_id = 'f7672672-4f02-447f-af73-ddfe21641770' WHERE student_id = 'a0000001-0000-0000-0000-000000000025';
UPDATE advancement_decisions SET student_id = '248b1d5f-4156-4596-bd06-a8f6ad00c83d' WHERE student_id = 'a0000001-0000-0000-0000-000000000026';
UPDATE advancement_decisions SET student_id = 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' WHERE student_id = 'a0000001-0000-0000-0000-000000000027';

-- Update advancement session
UPDATE advancement_sessions SET id = '3394bbcd-c038-403d-a34d-65a40c7fa014' WHERE id = 'b0000001-0000-0000-0000-000000000001';
UPDATE advancement_decisions SET session_id = '3394bbcd-c038-403d-a34d-65a40c7fa014' WHERE session_id = 'b0000001-0000-0000-0000-000000000001';

-- Re-add FK constraints
ALTER TABLE advancement_decisions ADD CONSTRAINT advancement_decisions_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES student_metrics_students(id) ON DELETE CASCADE;
ALTER TABLE student_year_profiles ADD CONSTRAINT student_year_profiles_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES student_metrics_students(id) ON DELETE CASCADE;
ALTER TABLE student_place_assignments ADD CONSTRAINT student_place_assignments_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES student_metrics_students(id) ON DELETE CASCADE;
ALTER TABLE student_enrollments ADD CONSTRAINT student_enrollments_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES student_metrics_students(id) ON DELETE CASCADE;
ALTER TABLE student_metrics_records ADD CONSTRAINT student_metrics_records_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES student_metrics_students(id) ON DELETE CASCADE;
ALTER TABLE advancement_decisions ADD CONSTRAINT advancement_decisions_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES advancement_sessions(id) ON DELETE CASCADE;

COMMIT;
