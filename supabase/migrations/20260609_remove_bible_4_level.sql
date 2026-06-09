/*
  # Remove 4th Year Bible Student level (bible_4) and all students at that level

  1. Deletes all students at bible_4 level (cascades to metrics records,
     enrollments, place assignments, year profiles, advancement decisions)
  2. Fixes progression chain: prac_2 → graduated
  3. Deletes the bible_4 level row
*/

-- 1. Delete all students currently at bible_4 level
-- ON DELETE CASCADE handles: student_metrics_records, student_enrollments,
-- student_place_assignments, student_year_profiles, advancement_decisions
DELETE FROM student_metrics_students
WHERE current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_4');

-- 2. Fix progression chain: prac_2 → graduated (skip bible_4)
UPDATE mbsi_levels
SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'graduated')
WHERE code = 'prac_2';

-- 3. Delete the bible_4 level
DELETE FROM mbsi_levels WHERE code = 'bible_4';
