/*
  # Add 4th Year Bible Student level and fix progression chain

  Updated progression:
  bible_1 → bible_2 → prac_1 → prac_2 → bible_4 → graduated

  Also updates advancement decisions to target the correct next level.
*/

-- 1. Add bible_4 level
INSERT INTO mbsi_levels (code, display_name, tier, tier_order, level_order, is_terminal)
VALUES ('bible_4', '4th Year Bible Student', 'mbsi', 2, 4, false)
ON CONFLICT (code) DO NOTHING;

-- 2. Update next_level_id chain
-- prac_2 → bible_4 (was → graduated)
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_4') WHERE code = 'prac_2';
-- bible_4 → graduated
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'graduated') WHERE code = 'bible_4';

-- 3. Update advancement decisions target_level_id for all seeded students
-- (each student's target = their current level's next_level_id)
UPDATE advancement_decisions d
SET target_level_id = l.next_level_id
FROM student_metrics_students s
JOIN mbsi_levels l ON l.id = s.current_level_id
WHERE d.student_id = s.id
  AND d.session_id = '3394bbcd-c038-403d-a34d-65a40c7fa014'
  AND s.id::text IN ('75d65649-e6ea-48f5-95f9-c8a7489cacbf','175763ac-6988-4341-8285-221c048a3657','de1882f4-8d65-47c7-9c4d-401ec810ca75','5a7d3133-ed34-4d92-95c3-2136ee73d73b','9ad930d0-7ba6-4759-8583-7deb64ee5ada','1437b0e3-fbb6-4f70-87a9-c1ee73eaabf4','4008a653-099f-4957-925c-9cab5588bb0e','1fe3c0af-4a46-41e5-b5ae-e793f0052480','230292f0-d27b-4a0c-9eba-e09a1ff35271','a45901bf-ffb5-4ccc-816d-2ce5a97e8855','22f8ff61-9489-4e2d-bc44-a73d984559b1','5434e64f-539c-49f1-88a2-1e06e211e13e','860150c0-01cc-4167-a43c-ee5e799b71eb','ed776323-9406-42f9-a545-45e33f42fd3a','46defcd5-196d-4edd-ab1c-6de089b96edc','f7bfc0e0-38f4-49d4-8290-f18952e50b24','330eb8f4-7da3-4c2c-9931-b35bbd029f86','a3f394ab-07d5-4780-b358-85044cfbbee3','58d03703-a257-4111-a61e-01ca0df0c557','250d0880-46c2-4672-b038-b8f5a1e26b8d','8adf9f24-a648-4d73-827e-9e9dabde063e','bf81a79c-67d5-46b4-9556-ed3eb2158d3e','efc4dc77-0abb-471a-a963-435ae2d5d1e8','d9d3b6c5-b148-4fe6-a36d-bb4dd5a143ec','f7672672-4f02-447f-af73-ddfe21641770','248b1d5f-4156-4596-bd06-a8f6ad00c83d','b8beeaa7-7cc7-450e-b5e0-4728b56a1882');
