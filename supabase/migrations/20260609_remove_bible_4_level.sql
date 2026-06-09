/*
  # Remove 4th Year Bible Students (at bible_4 level)

  Deletes all students currently at bible_4 level.
  ON DELETE CASCADE handles: student_metrics_records, student_enrollments,
  student_place_assignments, student_year_profiles, advancement_decisions.

  The bible_4 level itself is kept in the progression chain.
*/

DELETE FROM student_metrics_students
WHERE current_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_4');
