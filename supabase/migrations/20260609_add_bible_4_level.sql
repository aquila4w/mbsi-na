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
  AND d.session_id = 'b0000001-0000-0000-0000-000000000001'
  AND s.id::text LIKE 'a0000001-0000-0000-0000-%';
