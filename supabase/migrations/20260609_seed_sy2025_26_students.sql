/*
  # Seed SY 2025-2026 Student Data

  28 students across 5 levels, with metrics, enrollments, place assignments,
  year profiles, and a draft advancement session for the upcoming deliberation.

  Run AFTER 20260609_add_tithes_converts_columns.sql
*/

-- ============================================
-- 1. STUDENTS (student_metrics_students)
-- ============================================

-- 2nd Yr Practicum (entered ~Sept 2020)
INSERT INTO student_metrics_students (id, full_name, date_entered, current_status) VALUES
  ('75d65649-e6ea-48f5-95f9-c8a7489cacbf', 'Gian Antiojo', '2020-09-01', 'active'),
  ('175763ac-6988-4341-8285-221c048a3657', 'Ivanelle dela Cruz', '2020-09-01', 'active'),
  ('de1882f4-8d65-47c7-9c4d-401ec810ca75', 'Laizelle Figueroa', '2020-09-01', 'active'),
  ('5a7d3133-ed34-4d92-95c3-2136ee73d73b', 'Jarun Garcia', '2020-09-01', 'active'),
  ('9ad930d0-7ba6-4759-8583-7deb64ee5ada', 'Roiz Gregorio', '2020-09-01', 'active'),
  ('1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4', 'Shyr Mantaring', '2020-09-01', 'active'),
  ('4008a653-099f-4957-925c-9cab5588bb0e', 'Cesar Martinez', '2020-09-01', 'active'),
  ('1fe3c0af-4a46-41e5-b5ae-e793f0052480', 'Audrey Meas', '2020-09-01', 'active'),
  ('230292f0-d27b-4a0c-9eba-e09a1ff35271', 'Elijah Robles', '2020-09-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- 1st Yr Practicum (entered ~Sept 2021)
INSERT INTO student_metrics_students (id, full_name, date_entered, current_status) VALUES
  ('a45901bf-ffb5-4ccc-816d-2ce5a97e8855', 'Miracle Ferriol', '2021-09-01', 'active'),
  ('22f8ff61-9489-4e2d-bc44-a73d984559b1', 'Rhea Gregorio', '2021-09-01', 'active'),
  ('5434e64f-539c-49f1-88a2-1e06e211e13e', 'Courtnie Lucas', '2021-09-01', 'active'),
  ('860150c0-01cc-4167-a43c-ee5e799b71eb', 'Shawnelle Mamaclay', '2021-09-01', 'active'),
  ('ed776323-9406-42f9-a545-45e33f42fd3a', 'Emjay Saret', '2021-09-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2nd Year (entered ~Sept 2022)
INSERT INTO student_metrics_students (id, full_name, date_entered, current_status) VALUES
  ('46defcd5-196d-4edd-ab1c-6de089b96edc', 'Paul Carasco', '2022-09-01', 'active'),
  ('f7bfc0e0-38f4-49d4-8290-f18952e50b24', 'Jhelyssa Alexis Marasigan', '2022-09-01', 'active'),
  ('330eb8f4-7da3-4c2c-9931-b35bbd029f86', 'Eric Reyes', '2022-09-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- 1st Year (entered ~Sept 2023)
INSERT INTO student_metrics_students (id, full_name, date_entered, current_status) VALUES
  ('a3f394ab-07d5-4780-b358-85044cfbbee3', 'Johner dela Cruz', '2023-09-01', 'active'),
  ('58d03703-a257-4111-a61e-01ca0df0c557', 'Iseya Estella', '2023-09-01', 'active'),
  ('250d0880-46c2-4672-b038-b8f5a1e26b8d', 'Nicole Ferriol', '2023-09-01', 'active'),
  ('8adf9f24-a648-4d73-827e-9e9dabde063e', 'Jemimah Meas', '2023-09-01', 'active'),
  ('bf81a79c-67d5-46b4-9556-ed3eb2158d3e', 'Daniel Mendoza', '2023-09-01', 'active'),
  ('efc4dc77-0abb-471a-a963-435ae2d5d1e8', 'Jed Ramos', '2023-09-01', 'active'),
  ('d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec', 'Charisse Rosario', '2023-09-01', 'active'),
  ('f7672672-4f02-447f-af73-ddfe21641770', 'Celine Santos', '2023-09-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- Probationary (entered ~Sept 2025)
INSERT INTO student_metrics_students (id, full_name, date_entered, current_status) VALUES
  ('248b1d5f-4156-4596-bd06-a8f6ad00c83d', 'Timothy Jake Clemente', '2025-09-01', 'active'),
  ('b8beeaa7-7cc7-450e-b5e0-4728b56a1882', 'Cherry Tala', '2025-09-01', 'active')
ON CONFLICT (id) DO NOTHING;

-- Set current_level_id on all students
UPDATE student_metrics_students SET current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prac_2') WHERE id IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271');
UPDATE student_metrics_students SET current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prac_1') WHERE id IN ('a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a');
UPDATE student_metrics_students SET current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_2') WHERE id IN ('46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86');
UPDATE student_metrics_students SET current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_1') WHERE id IN ('a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770');
UPDATE student_metrics_students SET current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prob_1') WHERE id IN ('248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882');

-- ============================================
-- 2. ENROLLMENTS (student_enrollments)
-- ============================================

INSERT INTO student_enrollments (student_id, level_id, academic_year, enrolled_at, status)
SELECT s.id, l.id, '2025-2026', s.date_entered, 'active'
FROM student_metrics_students s
JOIN mbsi_levels l ON l.id = s.current_level_id
WHERE s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. PLACE ASSIGNMENTS (student_place_assignments)
-- ============================================

INSERT INTO student_place_assignments (student_id, enrollment_id, location, assigned_from, is_current)
SELECT
  s.id,
  e.id,
  CASE s.id
    -- prac_2
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 'Panama'
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 'Virginia Beach'
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 'Colorado'
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 'Kenya'
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 'San Francisco'
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 'Seattle'
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 'South Bay'
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 'Miami'
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 'South Bay'
    -- prac_1
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 'South Bay'
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 'South Bay'
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 'South Bay'
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 'Oxnard'
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 'South Bay'
    -- bible_2
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 'South Bay'
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 'Lanai, HI'
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 'South Bay'
    ELSE 'South Bay'
  END,
  '2025-09-01',
  true
FROM student_metrics_students s
LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.academic_year = '2025-2026'
WHERE s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882')
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. METRICS RECORDS (student_metrics_records)
-- ============================================

INSERT INTO student_metrics_records (student_id, year_level, academic_year, year, assignment, baptisms_us, thanksgiving_offering, caroling_amount, guests, evangelism_offering, tithes, converts, level_code)
SELECT s.id,
  l.display_name,
  '2025-2026',
  2026,
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 'Panama'
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 'Virginia Beach'
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 'Colorado'
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 'Kenya'
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 'San Francisco'
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 'Seattle'
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 'South Bay'
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 'Miami'
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 'South Bay'
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 'South Bay'
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 'South Bay'
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 'South Bay'
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 'Oxnard'
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 'South Bay'
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 'South Bay'
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 'Lanai, HI'
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 'South Bay'
    ELSE 'South Bay'
  END,
  -- baptisms_us
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 3
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 2
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 3
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 34
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 8
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 14
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 1
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 5
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 1
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 1
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 6
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 3
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 5
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 1
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 4
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 5
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 5
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 4
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 3
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 1
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 13
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 1
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 1
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 4
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 5
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 0
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 5
    ELSE 0
  END,
  -- thanksgiving_offering
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 1710.00
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 2500.00
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 1500.00
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 1550.00
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 2500.00
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 7900.74
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 1100.00
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 2000.00
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 420.00
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 8312.00
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 723.00
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 2150.00
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 1224.00
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 770.00
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 169.00
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 8700.00
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 431.00
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 1200.00
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 3250.00
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 2882.00
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 3025.00
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 447.00
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 300.00
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 545.00
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 700.00
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 391.00
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 450.00
    ELSE 0
  END,
  -- caroling_amount
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 1996.00
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 5000.00
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 3000.00
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 5000.00
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 20000.00
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 7500.00
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 20000.00
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 7000.00
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 17000.00
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 17000.00
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 15000.00
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 15000.00
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 28310.00
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 20000.00
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 20000.00
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 15000.00
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 20000.00
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 20000.00
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 20000.00
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 16000.00
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 20000.00
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 15000.00
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 15000.00
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 20000.00
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 20000.00
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 16000.00
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 20000.00
    ELSE 0
  END,
  -- guests (HFGC)
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 121
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 8
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 30
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 23
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 3
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 76
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 3
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 4
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 10
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 3
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 15
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 9
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 24
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 4
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 33
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 9
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 14
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 5
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 2
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 0
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 16
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 1
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 1
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 9
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 19
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 1
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 5
    ELSE 0
  END,
  -- evangelism_offering
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 0
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 2500.00
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 2000.00
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 0
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 2500.00
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 0
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 14.00
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 2000.00
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 20.00
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 0
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 200.00
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 50.00
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 2679.45
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 10.00
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 21.00
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 600.00
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 52.00
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 20.00
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 10.00
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 23.00
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 657.00
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 40.00
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 21.00
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 32.00
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 242.00
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 19.00
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 19.00
    ELSE 0
  END,
  -- tithes
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 70.00
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 1530.00
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 1214.00
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 172.00
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 220.00
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 556.00
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 428.44
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 836.33
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 58.00
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 355.00
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 212.00
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 378.00
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 270.00
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 35.00
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 80.00
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 42.00
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 88.00
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 245.00
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 310.00
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 230.00
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 3848.00
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 24.00
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 105.00
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 170.00
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 0
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 207.00
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 409.00
    ELSE 0
  END,
  -- converts
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 3
    WHEN '175763ac-6988-4341-8285-221c048a3657' THEN 2
    WHEN 'de1882f4-8d65-47c7-9c4d-401ec810ca75' THEN 2
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 13
    WHEN '9ad930d0-7ba6-4759-8583-7deb64ee5ada' THEN 5
    WHEN '1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4' THEN 7
    WHEN '4008a653-099f-4957-925c-9cab5588bb0e' THEN 0
    WHEN '1fe3c0af-4a46-41e5-b5ae-e793f0052480' THEN 4
    WHEN '230292f0-d27b-4a0c-9eba-e09a1ff35271' THEN 1
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 0
    WHEN '22f8ff61-9489-4e2d-bc44-a73d984559b1' THEN 2
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 0
    WHEN '860150c0-01cc-4167-a43c-ee5e799b71eb' THEN 2
    WHEN 'ed776323-9406-42f9-a545-45e33f42fd3a' THEN 0
    WHEN '46defcd5-196d-4edd-ab1c-6de089b96edc' THEN 0
    WHEN 'f7bfc0e0-38f4-49d4-8290-f18952e50b24' THEN 2
    WHEN '330eb8f4-7da3-4c2c-9931-b35bbd029f86' THEN 1
    WHEN 'a3f394ab-07d5-4780-b358-85044cfbbee3' THEN 2
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 0
    WHEN '250d0880-46c2-4672-b038-b8f5a1e26b8d' THEN 1
    WHEN '8adf9f24-a648-4d73-827e-9e9dabde063e' THEN 6
    WHEN 'bf81a79c-67d5-46b4-9556-ed3eb2158d3e' THEN 0
    WHEN 'efc4dc77-0abb-471a-a963-435ae2d5d1e8' THEN 0
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 0
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 1
    WHEN '248b1d5f-4156-4596-bd06-a8f6ad00c83d' THEN 0
    WHEN 'b8beeaa7-7cc7-450e-b5e0-4728b56a1882' THEN 2
    ELSE 0
  END,
  -- level_code
  l.code
FROM student_metrics_students s
JOIN mbsi_levels l ON l.id = s.current_level_id
WHERE s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882');

-- ============================================
-- 5. YEAR PROFILES (student_year_profiles)
-- ============================================

INSERT INTO student_year_profiles (student_id, enrollment_id, level_id, academic_year, achievements_ranking)
SELECT
  s.id,
  e.id,
  s.current_level_id,
  '2025-2026',
  CASE s.id
    WHEN '75d65649-e6ea-48f5-95f9-c8a7489cacbf' THEN 'RRB'
    WHEN '5a7d3133-ed34-4d92-95c3-2136ee73d73b' THEN 'RRB'
    WHEN 'a45901bf-ffb5-4ccc-816d-2ce5a97e8855' THEN 'HFGC, SBG'
    WHEN '5434e64f-539c-49f1-88a2-1e06e211e13e' THEN 'FORERUNNER'
    WHEN '58d03703-a257-4111-a61e-01ca0df0c557' THEN 'RRB'
    WHEN 'd9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec' THEN 'RRB, FORERUNNER'
    WHEN 'f7672672-4f02-447f-af73-ddfe21641770' THEN 'RRB'
    ELSE ''
  END
FROM student_metrics_students s
LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.academic_year = '2025-2026'
WHERE s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882')
ON CONFLICT (student_id, academic_year) DO NOTHING;

-- ============================================
-- 6. DRAFT ADVANCEMENT SESSION
-- ============================================

INSERT INTO advancement_sessions (id, academic_year, session_date, status, title, notes)
VALUES ('3394bbcd-c038-403d-a34d-65a40c7fa014', '2025-2026', CURRENT_DATE, 'draft', 'SY 2025-2026 Deliberation & Recommendation', 'Draft session for upcoming deliberation. Recommendations to be filled during the session.')
ON CONFLICT (academic_year) DO NOTHING;

-- ============================================
-- 7. DRAFT ADVANCEMENT DECISIONS (one per student)
-- ============================================

INSERT INTO advancement_decisions (session_id, student_id, enrollment_id, current_level_id, current_level_code, outcome, target_level_id, remarks, is_finalized)
SELECT
  '3394bbcd-c038-403d-a34d-65a40c7fa014',
  s.id,
  e.id,
  s.current_level_id,
  l.code,
  'advanced',
  l.next_level_id,
  '',
  false
FROM student_metrics_students s
JOIN mbsi_levels l ON l.id = s.current_level_id
LEFT JOIN student_enrollments e ON e.student_id = s.id AND e.academic_year = '2025-2026'
WHERE s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882')
ON CONFLICT (session_id, student_id) DO NOTHING;
