/*
  # Demo Data Seeder & Cleanup

  Creates two SQL functions:
  - seed_demo_data(p_user_ids jsonb) — populates demo data using provided user IDs
  - cleanup_demo_data() — removes all demo data

  Auth users are created client-side via signUp (so Supabase Auth properly hashes passwords).
  The client then passes user IDs to seed_demo_data for profiles, courses, and all related data.
*/

-- ============================================
-- CLEANUP FUNCTION (idempotent, safe to re-run)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_profiles int;
  deleted_courses int;
BEGIN
  DELETE FROM courses WHERE created_by IN (
    SELECT id FROM profiles WHERE email LIKE '%@demo.mbsina.org'
  );
  GET DIAGNOSTICS deleted_courses = ROW_COUNT;

  DELETE FROM auth.users WHERE email LIKE '%@demo.mbsina.org';
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;

  DELETE FROM profiles WHERE email LIKE '%@demo.mbsina.org';

  RETURN jsonb_build_object(
    'deleted_auth_users', deleted_profiles,
    'deleted_courses', deleted_courses,
    'status', 'cleaned'
  );
END;
$$;

-- ============================================
-- SEED FUNCTION (takes user IDs from client)
-- ============================================
CREATE OR REPLACE FUNCTION seed_demo_data(p_user_ids jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_santos_id uuid; v_reyes_id uuid; v_cruz_id uuid; v_marco_id uuid;
  v_maria_id uuid; v_juan_id uuid; v_ana_id uuid; v_pedro_id uuid;
  v_rosa_id uuid; v_luis_id uuid; v_carmen_id uuid; v_diego_id uuid;
  v_bib101_id uuid; v_min201_id uuid; v_his301_id uuid;
  v_mod1_id uuid; v_mod2_id uuid; v_mod3_id uuid;
  v_mod4_id uuid; v_mod5_id uuid; v_mod6_id uuid;
  v_disc_id uuid; v_disc2_id uuid; v_disc3_id uuid;
  v_quiz1_id uuid; v_quiz2_id uuid; v_quiz3_id uuid;
  v_q1_id uuid; v_q2_id uuid; v_q3_id uuid; v_q4_id uuid; v_q5_id uuid;
  v_q6_id uuid; v_q7_id uuid; v_q8_id uuid; v_q9_id uuid; v_q10_id uuid;
  v_asgn1_id uuid; v_asgn2_id uuid; v_asgn3_id uuid;
  v_asgn4_id uuid; v_asgn5_id uuid; v_asgn6_id uuid;
  v_grp1_id uuid; v_grp2_id uuid; v_grp3_id uuid;
  v_grp4_id uuid; v_grp5_id uuid; v_grp6_id uuid;
  v_rubric1_id uuid;
  v_attempt1_id uuid; v_attempt2_id uuid;
  v_bank_id uuid; v_cat1_id uuid; v_cat2_id uuid;
BEGIN
  -- Extract user IDs from the JSON parameter (passed from client after signUp)
  v_santos_id := (p_user_ids->>'santos@demo.mbsina.org')::uuid;
  v_reyes_id := (p_user_ids->>'reyes@demo.mbsina.org')::uuid;
  v_cruz_id := (p_user_ids->>'cruz@demo.mbsina.org')::uuid;
  v_marco_id := (p_user_ids->>'marco@demo.mbsina.org')::uuid;
  v_maria_id := (p_user_ids->>'maria@demo.mbsina.org')::uuid;
  v_juan_id := (p_user_ids->>'juan@demo.mbsina.org')::uuid;
  v_ana_id := (p_user_ids->>'ana@demo.mbsina.org')::uuid;
  v_pedro_id := (p_user_ids->>'pedro@demo.mbsina.org')::uuid;
  v_rosa_id := (p_user_ids->>'rosa@demo.mbsina.org')::uuid;
  v_luis_id := (p_user_ids->>'luis@demo.mbsina.org')::uuid;
  v_carmen_id := (p_user_ids->>'carmen@demo.mbsina.org')::uuid;
  v_diego_id := (p_user_ids->>'diego@demo.mbsina.org')::uuid;

  -- Auto-confirm emails for all demo users (signUp may leave them unconfirmed)
  UPDATE auth.users SET email_confirmed_at = now() WHERE email LIKE '%@demo.mbsina.org';

  -- ==========================================
  -- PROFILES
  -- ==========================================
  INSERT INTO profiles (id, email, full_name, role) VALUES
    (v_santos_id, 'santos@demo.mbsina.org', 'Prof. Eduardo Santos', 'teacher'),
    (v_reyes_id, 'reyes@demo.mbsina.org', 'Prof. Maria Reyes', 'teacher'),
    (v_cruz_id, 'cruz@demo.mbsina.org', 'Prof. Antonio Cruz', 'teacher'),
    (v_marco_id, 'marco@demo.mbsina.org', 'Marco Rivera', 'ta'),
    (v_maria_id, 'maria@demo.mbsina.org', 'Maria Garcia', 'student'),
    (v_juan_id, 'juan@demo.mbsina.org', 'Juan Dela Cruz', 'student'),
    (v_ana_id, 'ana@demo.mbsina.org', 'Ana Reyes', 'student'),
    (v_pedro_id, 'pedro@demo.mbsina.org', 'Pedro Santos', 'student'),
    (v_rosa_id, 'rosa@demo.mbsina.org', 'Rosa Mendoza', 'student'),
    (v_luis_id, 'luis@demo.mbsina.org', 'Luis Ramos', 'student'),
    (v_carmen_id, 'carmen@demo.mbsina.org', 'Carmen Villareal', 'student'),
    (v_diego_id, 'diego@demo.mbsina.org', 'Diego Santiago', 'student')
  ON CONFLICT (id) DO NOTHING;

  -- ==========================================
  -- COURSE 1: BIB101 Biblical Foundations I
  -- ==========================================
  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'BIB101', 'Biblical Foundations I',
    'An introductory course covering the foundational principles of biblical studies, including hermeneutics, canon formation, and the historical context of Scripture.',
    'Fall 2026', 'published', v_santos_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_bib101_id;

  -- Modules
  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_bib101_id, 'Introduction to Biblical Studies', 'Overview of biblical interpretation methods and the formation of the canon', 1, true) RETURNING id INTO v_mod1_id;
  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_bib101_id, 'Old Testament Overview', 'Survey of the Old Testament books, themes, and historical context', 2, true) RETURNING id INTO v_mod2_id;
  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_bib101_id, 'New Testament Foundations', 'Introduction to the Gospels, Acts, and the Epistles', 3, true) RETURNING id INTO v_mod3_id;

  -- Module Items
  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod1_id, 'page', 'What is Biblical Hermeneutics?', '<h2>Introduction to Hermeneutics</h2><p>Biblical hermeneutics is the study of the principles of interpretation of the Bible.</p><h3>Key Principles</h3><ul><li>Context is king</li><li>Genre matters</li><li>Scripture interprets Scripture</li></ul>', 1),
    (v_mod1_id, 'assignment', 'Hermeneutics Essay', 'Write a 500-word essay on the importance of context in biblical interpretation.', 2),
    (v_mod1_id, 'discussion', 'Share Your Approach', 'How do you currently approach reading and understanding the Bible?', 3),
    (v_mod2_id, 'page', 'The Pentateuch', '<h2>The Five Books of Moses</h2><p>Genesis through Deuteronomy form the foundation of the Old Testament.</p>', 1),
    (v_mod2_id, 'page', 'The Prophets', '<h2>Major and Minor Prophets</h2><p>The prophetic books reveal God''s heart for justice, mercy, and faithfulness.</p>', 2),
    (v_mod3_id, 'page', 'The Gospels', '<h2>Four Perspectives on Christ</h2><p>Matthew, Mark, Luke, and John each present a unique portrait of Jesus.</p>', 1),
    (v_mod3_id, 'page', 'Acts and the Early Church', '<h2>The Birth of the Church</h2><p>The Book of Acts chronicles the spread of the gospel from Jerusalem to Rome.</p>', 2);

  -- Discussion
  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES (gen_random_uuid(), v_bib101_id, 'Old Testament Themes Discussion', 'What is the most significant theme you see running through the Old Testament?', 'threaded', v_santos_id) RETURNING id INTO v_disc_id;

  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc_id, v_santos_id, 'Welcome! Identify one major OT theme and explain its significance. Reply to at least one classmate.'),
    (v_disc_id, v_maria_id, 'The theme of covenant is the most significant. God establishes covenants with Noah, Abraham, Moses, and David, culminating in the New Covenant through Christ.'),
    (v_disc_id, v_juan_id, 'Great point Maria! I would add the theme of redemption. From the Exodus to the return from exile, God constantly redeems His people.'),
    (v_disc_id, v_ana_id, 'I see the theme of God''s faithfulness despite human failure. Even when Israel rebelled, God remained faithful to His promises!');

  -- Assignments
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_bib101_id, 'Hermeneutics Essay', 'Write a 500-word essay on the importance of context in biblical interpretation. Use at least 3 Scripture references.', '2026-10-15', 100, 'published', v_santos_id) RETURNING id INTO v_asgn1_id;
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_bib101_id, 'OT Character Study', 'Choose one character from the Old Testament and write a 750-word analysis of their faith journey.', '2026-11-20', 100, 'published', v_santos_id) RETURNING id INTO v_asgn2_id;

  -- Submissions
  INSERT INTO submissions (assignment_id, student_id, content, submitted_at, grade, feedback, graded_by, graded_at, status) VALUES
    (v_asgn1_id, v_maria_id, 'Context is fundamental to biblical interpretation because...', now() - interval '5 days', 92, 'Excellent work! Well-researched.', v_santos_id, now() - interval '3 days', 'graded'),
    (v_asgn1_id, v_juan_id, 'The importance of context in Scripture cannot be overstated...', now() - interval '4 days', 88, 'Good arguments. More examples would help.', v_santos_id, now() - interval '2 days', 'graded'),
    (v_asgn1_id, v_ana_id, 'When we read the Bible without context, we risk misinterpretation...', now() - interval '3 days', 95, 'Outstanding essay!', v_santos_id, now() - interval '1 day', 'graded'),
    (v_asgn1_id, v_pedro_id, 'In this essay I will discuss why context matters...', now() - interval '2 days', 82, 'Good effort. Work on your thesis.', v_santos_id, now() - interval '1 day', 'graded'),
    (v_asgn1_id, v_rosa_id, 'Biblical context involves historical, cultural, and literary dimensions...', now() - interval '1 day', 90, 'Well-structured and insightful!', v_santos_id, now(), 'graded'),
    (v_asgn2_id, v_maria_id, 'The faith journey of Abraham teaches us about trusting God''s promises...', now(), 88, 'Solid analysis.', v_santos_id, now(), 'graded');

  -- Quiz
  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions, created_by)
  VALUES (gen_random_uuid(), v_bib101_id, 'Old Testament Quiz', 'Test your knowledge of the Old Testament', 'graded', 30, 50, 2, true, true, '2026-11-01', 'published', 70, 'Answer all questions. 30 minutes. Up to 2 attempts.', v_santos_id) RETURNING id INTO v_quiz1_id;

  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES (gen_random_uuid(), v_quiz1_id, 'How many books are in the Old Testament?', 'multiple_choice', 10, 1, '39 books.') RETURNING id INTO v_q1_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES (gen_random_uuid(), v_quiz1_id, 'The first five books are called the Pentateuch.', 'true_false', 10, 2, 'Genesis through Deuteronomy.') RETURNING id INTO v_q2_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES (gen_random_uuid(), v_quiz1_id, 'Which prophet was taken to Babylon?', 'multiple_choice', 10, 3, 'Daniel.') RETURNING id INTO v_q3_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES (gen_random_uuid(), v_quiz1_id, 'The Book of Psalms was written entirely by King David.', 'true_false', 10, 4, 'David wrote many but not all.') RETURNING id INTO v_q4_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES (gen_random_uuid(), v_quiz1_id, 'Explain the significance of the Abrahamic covenant.', 'short_answer', 10, 5, 'God promised to bless all nations through Abraham.') RETURNING id INTO v_q5_id;

  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q1_id, '39', true, 1), (v_q1_id, '40', false, 2), (v_q1_id, '46', false, 3), (v_q1_id, '66', false, 4);
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q2_id, 'True', true, 1), (v_q2_id, 'False', false, 2);
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q3_id, 'Isaiah', false, 1), (v_q3_id, 'Jeremiah', false, 2), (v_q3_id, 'Daniel', true, 3), (v_q3_id, 'Ezekiel', false, 4);
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q4_id, 'True', false, 1), (v_q4_id, 'False', true, 2);

  -- Quiz attempts
  INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, started_at, submitted_at, score, time_spent, status) VALUES (gen_random_uuid(), v_quiz1_id, v_maria_id, 1, now() - interval '2 hours', now() - interval '1 hour 30 minutes', 40, 1800, 'graded') RETURNING id INTO v_attempt1_id;
  INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, started_at, submitted_at, score, time_spent, status) VALUES (gen_random_uuid(), v_quiz1_id, v_juan_id, 1, now() - interval '3 hours', now() - interval '2 hours 40 minutes', 35, 1200, 'graded') RETURNING id INTO v_attempt2_id;

  -- Announcements
  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_bib101_id, 'Welcome to Biblical Foundations I!', 'Welcome everyone! Review the syllabus and introduce yourself in the forum.', v_santos_id, true),
    (v_bib101_id, 'Midterm Study Guide Available', 'The study guide is in Module 2. Office hours Thursday 2-4 PM.', v_santos_id, false);

  -- Groups
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_bib101_id, 'Team Alpha', 'OT research group', 5) RETURNING id INTO v_grp1_id;
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_bib101_id, 'Team Beta', 'NT research group', 5) RETURNING id INTO v_grp2_id;

  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp1_id, v_maria_id, 'leader'), (v_grp1_id, v_juan_id, 'member'), (v_grp1_id, v_ana_id, 'member'), (v_grp1_id, v_pedro_id, 'member'),
    (v_grp2_id, v_rosa_id, 'leader'), (v_grp2_id, v_luis_id, 'member'), (v_grp2_id, v_carmen_id, 'member'), (v_grp2_id, v_diego_id, 'member');

  -- Rubric
  INSERT INTO rubrics (id, course_id, title, description, points_possible, created_by) VALUES (gen_random_uuid(), v_bib101_id, 'Essay Grading Rubric', 'Standard rubric for biblical studies essays', 100, v_santos_id) RETURNING id INTO v_rubric1_id;
  INSERT INTO rubric_criteria (rubric_id, description, points, position) VALUES
    (v_rubric1_id, 'Thesis clarity and argument strength', 30, 1),
    (v_rubric1_id, 'Use of Scripture references', 25, 2),
    (v_rubric1_id, 'Writing quality and grammar', 20, 3),
    (v_rubric1_id, 'Theological accuracy', 25, 4);

  -- Enrollments
  INSERT INTO enrollments (user_id, course_id, role, status) VALUES
    (v_santos_id, v_bib101_id, 'teacher', 'active'),
    (v_marco_id, v_bib101_id, 'ta', 'active'),
    (v_maria_id, v_bib101_id, 'student', 'active'),
    (v_juan_id, v_bib101_id, 'student', 'active'),
    (v_ana_id, v_bib101_id, 'student', 'active'),
    (v_pedro_id, v_bib101_id, 'student', 'active'),
    (v_rosa_id, v_bib101_id, 'student', 'active'),
    (v_luis_id, v_bib101_id, 'student', 'active'),
    (v_carmen_id, v_bib101_id, 'student', 'active'),
    (v_diego_id, v_bib101_id, 'student', 'active');

  -- ==========================================
  -- COURSE 2: MIN201 Practical Ministry I
  -- ==========================================
  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'MIN201', 'Practical Ministry I', 'Hands-on training in pastoral care, preaching, and church administration.', 'Fall 2026', 'published', v_reyes_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_min201_id;

  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_min201_id, 'Foundations of Ministry', 'Core principles of effective ministry leadership', 1, true) RETURNING id INTO v_mod4_id;
  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_min201_id, 'Field Practice', 'Practical application through church assignment', 2, true) RETURNING id INTO v_mod5_id;

  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod4_id, 'page', 'The Call to Ministry', '<h2>Understanding Your Calling</h2><p>Ministry is not just a profession—it is a calling from God.</p>', 1),
    (v_mod4_id, 'assignment', 'Ministry Philosophy Paper', 'Write a 1000-word paper on your personal philosophy of ministry.', 2),
    (v_mod5_id, 'page', 'Field Practice Guidelines', '<h2>Expectations</h2><p>Minimum 10 hours per week at your assigned church.</p>', 1),
    (v_mod5_id, 'discussion', 'Field Practice Reflections', 'Share weekly field practice experiences.', 2),
    (v_mod5_id, 'assignment', 'Field Practice Report', 'Submit a detailed report of your activities and lessons learned.', 3);

  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES (gen_random_uuid(), v_min201_id, 'Field Practice Reflections', 'Share your weekly experiences.', 'threaded', v_reyes_id) RETURNING id INTO v_disc2_id;
  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc2_id, v_reyes_id, 'Week 1 reflections! Share your first week experiences.'),
    (v_disc2_id, v_rosa_id, 'Amazing first week at South Bay! Helped lead worship and visited two families.'),
    (v_disc2_id, v_luis_id, 'Assigned to youth ministry. Intimidating at first, but the teens were receptive.'),
    (v_disc2_id, v_carmen_id, 'Difficult experience visiting a hospital patient. Presence matters more than words.');

  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_min201_id, 'Ministry Philosophy Paper', 'Write a 1000-word paper on your philosophy of ministry.', '2026-10-01', 100, 'published', v_reyes_id) RETURNING id INTO v_asgn3_id;
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_min201_id, 'Field Practice Report', 'Detailed report of your field practice activities.', '2026-12-01', 100, 'published', v_reyes_id) RETURNING id INTO v_asgn4_id;

  INSERT INTO submissions (assignment_id, student_id, content, submitted_at, grade, feedback, graded_by, graded_at, status) VALUES
    (v_asgn3_id, v_rosa_id, 'My philosophy of ministry centers on servant leadership...', now() - interval '3 days', 90, 'Excellent integration of Scripture and personal reflection.', v_reyes_id, now() - interval '1 day', 'graded'),
    (v_asgn3_id, v_luis_id, 'I believe ministry should be grounded in love and authenticity...', now() - interval '2 days', 85, 'Good start! Expand on your discipleship approach.', v_reyes_id, now() - interval '1 day', 'graded');

  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions, created_by)
  VALUES (gen_random_uuid(), v_min201_id, 'Ministry Principles Quiz', 'Assess your understanding of core ministry principles', 'graded', 20, 40, 2, true, true, '2026-10-15', 'published', 60, '20 minutes. Up to 2 attempts.', v_reyes_id) RETURNING id INTO v_quiz2_id;

  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES (gen_random_uuid(), v_quiz2_id, 'What is the primary characteristic of servant leadership (Mark 10:45)?', 'multiple_choice', 10, 1) RETURNING id INTO v_q6_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES (gen_random_uuid(), v_quiz2_id, 'Pastoral care only involves preaching on Sundays.', 'true_false', 10, 2) RETURNING id INTO v_q7_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES (gen_random_uuid(), v_quiz2_id, 'Effective ministry requires both spiritual maturity and practical skills.', 'true_false', 10, 3) RETURNING id INTO v_q8_id;
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES (gen_random_uuid(), v_quiz2_id, 'Name one essential quality of a minister from 1 Timothy 3.', 'short_answer', 10, 4) RETURNING id INTO v_q9_id;

  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q6_id, 'Seeking to serve rather than be served', true, 1), (v_q6_id, 'Having authority over others', false, 2), (v_q6_id, 'Attending seminary', false, 3), (v_q6_id, 'Preaching eloquently', false, 4);
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q7_id, 'True', false, 1), (v_q7_id, 'False', true, 2);
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q8_id, 'True', true, 1), (v_q8_id, 'False', false, 2);

  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_min201_id, 'Field Practice Assignments Posted', 'Check Module 2 for your church assignments.', v_reyes_id, true),
    (v_min201_id, 'Guest Speaker Next Week', 'Pastor David Lim on church planting. Prepare questions!', v_reyes_id, false);

  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_min201_id, 'Ministry Team Grace', 'Pastoral care focus', 5) RETURNING id INTO v_grp3_id;
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_min201_id, 'Ministry Team Hope', 'Youth ministry focus', 5) RETURNING id INTO v_grp4_id;
  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp3_id, v_maria_id, 'leader'), (v_grp3_id, v_rosa_id, 'member'), (v_grp3_id, v_luis_id, 'member'), (v_grp3_id, v_carmen_id, 'member'),
    (v_grp4_id, v_juan_id, 'leader'), (v_grp4_id, v_ana_id, 'member'), (v_grp4_id, v_pedro_id, 'member'), (v_grp4_id, v_diego_id, 'member');

  INSERT INTO enrollments (user_id, course_id, role, status) VALUES
    (v_reyes_id, v_min201_id, 'teacher', 'active'),
    (v_marco_id, v_min201_id, 'ta', 'active'),
    (v_maria_id, v_min201_id, 'student', 'active'),
    (v_juan_id, v_min201_id, 'student', 'active'),
    (v_ana_id, v_min201_id, 'student', 'active'),
    (v_pedro_id, v_min201_id, 'student', 'active'),
    (v_rosa_id, v_min201_id, 'student', 'active'),
    (v_luis_id, v_min201_id, 'student', 'active'),
    (v_carmen_id, v_min201_id, 'student', 'active'),
    (v_diego_id, v_min201_id, 'student', 'active');

  -- ==========================================
  -- COURSE 3: HIS301 Church History
  -- ==========================================
  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'HIS301', 'Church History', 'A survey of church history from the apostolic age to the modern era.', 'Fall 2026', 'published', v_cruz_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_his301_id;

  INSERT INTO modules (id, course_id, title, description, position, published) VALUES (gen_random_uuid(), v_his301_id, 'The Early Church', 'From Pentecost to Constantine', 1, true) RETURNING id INTO v_mod6_id;

  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod6_id, 'page', 'The Apostolic Age', '<h2>The Birth of the Church</h2><p>Following Pentecost, the early church grew rapidly despite persecution.</p>', 1),
    (v_mod6_id, 'page', 'Persecution and Martyrdom', '<h2>The First 300 Years</h2><p>From Nero to Diocletian, the early church faced systematic persecution.</p>', 2);

  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES (gen_random_uuid(), v_his301_id, 'Early Church Lessons', 'What can the modern church learn from the early church fathers?', 'side_comment', v_cruz_id) RETURNING id INTO v_disc3_id;
  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc3_id, v_cruz_id, 'Let''s discuss how the early church''s approach can inform our modern practices.'),
    (v_disc3_id, v_pedro_id, 'Their commitment to meeting daily and sharing everything in common is challenging today.'),
    (v_disc3_id, v_diego_id, 'The early church modeled incredible perseverance through persecution.');

  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_his301_id, 'Church Fathers Research Paper', 'Research one early church father and write a 1000-word paper.', '2026-11-15', 100, 'published', v_cruz_id) RETURNING id INTO v_asgn5_id;
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES (gen_random_uuid(), v_his301_id, 'Timeline Project', 'Create a visual timeline of the first 500 years of church history.', '2026-12-10', 100, 'published', v_cruz_id) RETURNING id INTO v_asgn6_id;

  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions, created_by)
  VALUES (gen_random_uuid(), v_his301_id, 'Early Church Quiz', 'Test your knowledge of the first 300 years', 'graded', 25, 50, 1, true, false, '2026-10-20', 'published', 70, '25 minutes. One attempt only.', v_cruz_id) RETURNING id INTO v_quiz3_id;

  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES (gen_random_uuid(), v_quiz3_id, 'In what year did Constantine issue the Edict of Milan?', 'multiple_choice', 10, 1) RETURNING id INTO v_q10_id;
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES (v_q10_id, '313 AD', true, 1), (v_q10_id, '325 AD', false, 2), (v_q10_id, '380 AD', false, 3), (v_q10_id, '301 AD', false, 4);

  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_his301_id, 'Course Materials Available', 'All reading materials and slides are in the modules.', v_cruz_id, true),
    (v_his301_id, 'Library Resources', 'Key church history texts reserved at the seminary library.', v_cruz_id, false);

  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_his301_id, 'History Scholars A', 'Research group A', 5) RETURNING id INTO v_grp5_id;
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES (gen_random_uuid(), v_his301_id, 'History Scholars B', 'Research group B', 5) RETURNING id INTO v_grp6_id;
  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp5_id, v_ana_id, 'leader'), (v_grp5_id, v_pedro_id, 'member'), (v_grp5_id, v_luis_id, 'member'), (v_grp5_id, v_diego_id, 'member'),
    (v_grp6_id, v_maria_id, 'leader'), (v_grp6_id, v_juan_id, 'member'), (v_grp6_id, v_rosa_id, 'member'), (v_grp6_id, v_carmen_id, 'member');

  INSERT INTO enrollments (user_id, course_id, role, status) VALUES
    (v_cruz_id, v_his301_id, 'teacher', 'active'),
    (v_marco_id, v_his301_id, 'ta', 'active'),
    (v_maria_id, v_his301_id, 'student', 'active'),
    (v_juan_id, v_his301_id, 'student', 'active'),
    (v_ana_id, v_his301_id, 'student', 'active'),
    (v_pedro_id, v_his301_id, 'student', 'active'),
    (v_rosa_id, v_his301_id, 'student', 'active'),
    (v_luis_id, v_his301_id, 'student', 'active'),
    (v_carmen_id, v_his301_id, 'student', 'active'),
    (v_diego_id, v_his301_id, 'student', 'active');

  -- ==========================================
  -- QUESTION BANK (shared)
  -- ==========================================
  INSERT INTO question_banks (id, name, description, is_public, created_by) VALUES (gen_random_uuid(), 'MBSI General Bible Knowledge', 'Shared question bank for biblical studies', true, v_santos_id) RETURNING id INTO v_bank_id;
  INSERT INTO question_categories (id, question_bank_id, name, description) VALUES (gen_random_uuid(), v_bank_id, 'Old Testament', 'OT questions') RETURNING id INTO v_cat1_id;
  INSERT INTO question_categories (id, question_bank_id, name, description) VALUES (gen_random_uuid(), v_bank_id, 'New Testament', 'NT questions') RETURNING id INTO v_cat2_id;

  INSERT INTO question_bank_items (question_bank_id, category_id, question_text, question_type, difficulty_level, points, tags, created_by) VALUES
    (v_bank_id, v_cat1_id, 'Who wrote the Book of Psalms primarily?', 'multiple_choice', 'medium', 10, ARRAY['psalms','david'], v_santos_id),
    (v_bank_id, v_cat1_id, 'What is the shortest book in the OT?', 'multiple_choice', 'easy', 5, ARRAY['obadiah'], v_santos_id),
    (v_bank_id, v_cat2_id, 'How many Gospel accounts are in the NT?', 'multiple_choice', 'easy', 5, ARRAY['gospels'], v_santos_id),
    (v_bank_id, v_cat2_id, 'Which apostle wrote the most NT books?', 'multiple_choice', 'medium', 10, ARRAY['paul','epistles'], v_santos_id),
    (v_bank_id, v_cat1_id, 'Explain the significance of the Day of Atonement.', 'essay', 'hard', 20, ARRAY['leviticus','atonement'], v_santos_id);

  -- ==========================================
  -- RETURN SUMMARY
  -- ==========================================
  RETURN jsonb_build_object(
    'users', 12, 'teachers', 3, 'students', 8, 'ta', 1,
    'courses', 3, 'modules', 6, 'discussions', 3,
    'announcements', 6, 'quizzes', 3, 'questions', 10,
    'assignments', 6, 'submissions', 6, 'groups', 6,
    'rubrics', 1, 'question_bank_items', 5,
    'password', 'Demo@1234', 'status', 'seeded'
  );
END;
$$;
