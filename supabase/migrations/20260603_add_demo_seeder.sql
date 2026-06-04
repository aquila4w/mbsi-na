/*
  # Demo Data Seeder & Cleanup

  Creates two SQL functions:
  - seed_demo_data() — populates a full demo scenario
  - cleanup_demo_data() — removes all demo data

  All demo users have emails ending with @demo.mbsina.org
  All demo passwords: Demo@1234
*/

-- ============================================
-- ENSURE pgcrypto IS AVAILABLE
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  deleted_other int;
BEGIN
  -- Delete courses created by demo teachers
  DELETE FROM courses WHERE created_by IN (
    SELECT id FROM profiles WHERE email LIKE '%@demo.mbsina.org'
  );
  GET DIAGNOSTICS deleted_courses = ROW_COUNT;

  -- Delete demo auth users (cascades to profiles via FK)
  DELETE FROM auth.users WHERE email LIKE '%@demo.mbsina.org';
  GET DIAGNOSTICS deleted_profiles = ROW_COUNT;

  -- Delete any remaining orphaned profiles
  DELETE FROM profiles WHERE email LIKE '%@demo.mbsina.org';

  RETURN jsonb_build_object(
    'deleted_auth_users', deleted_profiles,
    'deleted_courses', deleted_courses,
    'status', 'cleaned'
  );
END;
$$;

-- ============================================
-- SEED FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION seed_demo_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- User IDs
  v_santos_id uuid;
  v_reyes_id uuid;
  v_cruz_id uuid;
  v_marco_id uuid;
  v_maria_id uuid; v_juan_id uuid; v_ana_id uuid; v_pedro_id uuid;
  v_rosa_id uuid; v_luis_id uuid; v_carmen_id uuid; v_diego_id uuid;

  -- Course IDs
  v_bib101_id uuid; v_min201_id uuid; v_his301_id uuid;

  -- Module IDs
  v_mod1_id uuid; v_mod2_id uuid; v_mod3_id uuid;
  v_mod4_id uuid; v_mod5_id uuid; v_mod6_id uuid;

  -- Other IDs
  v_disc_id uuid; v_disc2_id uuid; v_disc3_id uuid;
  v_quiz1_id uuid; v_quiz2_id uuid; v_quiz3_id uuid;
  v_q1_id uuid; v_q2_id uuid; v_q3_id uuid; v_q4_id uuid; v_q5_id uuid;
  v_q6_id uuid; v_q7_id uuid; v_q8_id uuid; v_q9_id uuid; v_q10_id uuid;
  v_a1_id uuid; v_a2_id uuid; v_a3_id uuid; v_a4_id uuid;
  v_a5_id uuid; v_a6_id uuid;
  v_asgn1_id uuid; v_asgn2_id uuid; v_asgn3_id uuid; v_asgn4_id uuid;
  v_asgn5_id uuid; v_asgn6_id uuid;
  v_grp1_id uuid; v_grp2_id uuid; v_grp3_id uuid; v_grp4_id uuid; v_grp5_id uuid; v_grp6_id uuid;
  v_rubric1_id uuid;
  v_attempt1_id uuid; v_attempt2_id uuid;
  v_sub1_id uuid; v_sub2_id uuid; v_sub3_id uuid; v_sub4_id uuid;
  v_sub5_id uuid; v_sub6_id uuid;
  v_bank_id uuid;
  v_cat1_id uuid; v_cat2_id uuid;

  -- Counters
  v_user_count int := 0;
  v_course_count int := 0;

  demo_password text := crypt('Demo@1234', gen_salt('bf'));
BEGIN
  -- Clean up first in case of re-run
  PERFORM cleanup_demo_data();

  -- ============================================
  -- CREATE AUTH USERS
  -- ============================================

  -- Teachers
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'santos@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Prof. Santos"}')
  RETURNING id INTO v_santos_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'reyes@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Prof. Reyes"}')
  RETURNING id INTO v_reyes_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'cruz@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Prof. Cruz"}')
  RETURNING id INTO v_cruz_id;

  -- TA
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'marco@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marco Rivera"}')
  RETURNING id INTO v_marco_id;

  -- Students
  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'maria@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Garcia"}')
  RETURNING id INTO v_maria_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'juan@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Juan Dela Cruz"}')
  RETURNING id INTO v_juan_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'ana@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Reyes"}')
  RETURNING id INTO v_ana_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'pedro@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pedro Santos"}')
  RETURNING id INTO v_pedro_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'rosa@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rosa Mendoza"}')
  RETURNING id INTO v_rosa_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'luis@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luis Ramos"}')
  RETURNING id INTO v_luis_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'carmen@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carmen Villareal"}')
  RETURNING id INTO v_carmen_id;

  INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'authenticated', 'authenticated', 'diego@demo.mbsina.org', demo_password, now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Santiago"}')
  RETURNING id INTO v_diego_id;

  -- ============================================
  -- CREATE PROFILES
  -- ============================================

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
    (v_diego_id, 'diego@demo.mbsina.org', 'Diego Santiago', 'student');

  v_user_count := 12;

  -- ============================================
  -- COURSE 1: Biblical Foundations I (BIB101)
  -- ============================================

  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'BIB101', 'Biblical Foundations I',
    'An introductory course covering the foundational principles of biblical studies, including hermeneutics, canon formation, and the historical context of Scripture.',
    'Fall 2026', 'published', v_santos_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_bib101_id;

  -- Modules for BIB101
  INSERT INTO modules (id, course_id, title, description, position, published) VALUES
    (gen_random_uuid(), v_bib101_id, 'Introduction to Biblical Studies', 'Overview of biblical interpretation methods and the formation of the canon', 1, true) RETURNING id INTO v_mod1_id,
    (gen_random_uuid(), v_bib101_id, 'Old Testament Overview', 'Survey of the Old Testament books, themes, and historical context', 2, true) RETURNING id INTO v_mod2_id,
    (gen_random_uuid(), v_bib101_id, 'New Testament Foundations', 'Introduction to the Gospels, Acts, and the Epistles', 3, true) RETURNING id INTO v_mod3_id;

  -- Module Items for Module 1
  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod1_id, 'page', 'What is Biblical Hermeneutics?', '<h2>Introduction to Hermeneutics</h2><p>Biblical hermeneutics is the study of the principles of interpretation of the Bible. In this lesson, we explore the historical-grammatical method and its importance in faithful Scripture reading.</p><h3>Key Principles</h3><ul><li>Context is king</li><li>Genre matters</li><li>Scripture interprets Scripture</li></ul>', 1),
    (v_mod1_id, 'assignment', 'Hermeneutics Essay', 'Write a 500-word essay on the importance of context in biblical interpretation.', 2),
    (v_mod1_id, 'discussion', 'Share Your Approach', 'How do you currently approach reading and understanding the Bible? Share your method and discuss with classmates.', 3);

  -- Module Items for Module 2
  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod2_id, 'page', 'The Pentateuch', '<h2>The Five Books of Moses</h2><p>Genesis through Deuteronomy form the foundation of the Old Testament. These books establish the covenant relationship between God and His people.</p>', 1),
    (v_mod2_id, 'page', 'The Prophets', '<h2>Major and Minor Prophets</h2><p>The prophetic books reveal God''s heart for justice, mercy, and faithfulness.</p>', 2),
    (v_mod3_id, 'page', 'The Gospels', '<h2>Four Perspectives on Christ</h2><p>Matthew, Mark, Luke, and John each present a unique portrait of Jesus.</p>', 1),
    (v_mod3_id, 'page', 'Acts and the Early Church', '<h2>The Birth of the Church</h2><p>The Book of Acts chronicles the spread of the gospel from Jerusalem to Rome.</p>', 2);

  -- Discussions for BIB101
  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES
    (gen_random_uuid(), v_bib101_id, 'Old Testament Themes Discussion', 'What is the most significant theme you see running through the Old Testament? How does it connect to the New Testament?', 'threaded', v_santos_id)
  RETURNING id INTO v_disc_id;

  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc_id, v_santos_id, 'Welcome to our discussion! I''d like each of you to identify one major OT theme and explain its significance. Post your response and reply to at least one classmate.'),
    (v_disc_id, v_maria_id, 'I think the theme of covenant is the most significant. God establishes covenants with Noah, Abraham, Moses, and David, each building on the previous one. This culminates in the New Covenant through Christ.'),
    (v_disc_id, v_juan_id, 'Great point Maria! I would also add the theme of redemption. From the Exodus to the return from exile, God constantly redeems His people. It foreshadows the ultimate redemption through Jesus.'),
    (v_disc_id, v_ana_id, 'I see the theme of God''s faithfulness despite human failure. Even when Israel rebelled, God remained faithful to His promises. This gives me so much hope!');

  -- Assignments for BIB101
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_bib101_id, 'Hermeneutics Essay', 'Write a 500-word essay on the importance of context in biblical interpretation. Use at least 3 Scripture references.', '2026-10-15', 100, 'published', v_santos_id)
  RETURNING id INTO v_asgn1_id;

  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_bib101_id, 'OT Character Study', 'Choose one character from the Old Testament and write a 750-word analysis of their faith journey and what we can learn from them today.', '2026-11-20', 100, 'published', v_santos_id)
  RETURNING id INTO v_asgn2_id;

  -- Submissions for BIB101 assignments
  INSERT INTO submissions (id, assignment_id, student_id, content, submitted_at, grade, feedback, graded_by, graded_at, status) VALUES
    (gen_random_uuid(), v_asgn1_id, v_maria_id, 'Context is fundamental to biblical interpretation because...', now() - interval '5 days', 92, 'Excellent work! Well-researched and thoughtful analysis.', v_santos_id, now() - interval '3 days', 'graded') RETURNING id INTO v_sub1_id,
    (gen_random_uuid(), v_asgn1_id, v_juan_id, 'The importance of context in Scripture cannot be overstated...', now() - interval '4 days', 88, 'Good arguments. Could strengthen with more examples.', v_santos_id, now() - interval '2 days', 'graded') RETURNING id INTO v_sub2_id,
    (gen_random_uuid(), v_asgn1_id, v_ana_id, 'When we read the Bible without context, we risk misinterpretation...', now() - interval '3 days', 95, 'Outstanding essay! Your use of multiple Scripture references was excellent.', v_santos_id, now() - interval '1 day', 'graded') RETURNING id INTO v_sub3_id,
    (gen_random_uuid(), v_asgn1_id, v_pedro_id, 'In this essay I will discuss why context matters...', now() - interval '2 days', 82, 'Good effort. Work on developing your thesis more clearly.', v_santos_id, now() - interval '1 day', 'graded') RETURNING id INTO v_sub4_id,
    (gen_random_uuid(), v_asgn1_id, v_rosa_id, 'Biblical context involves historical, cultural, and literary dimensions...', now() - interval '1 day', 90, 'Well-structured and insightful. Great job!', v_santos_id, now(), 'graded') RETURNING id INTO v_sub5_id,
    (gen_random_uuid(), v_asgn2_id, v_maria_id, 'The faith journey of Abraham teaches us about trusting God''s promises even when circumstances seem impossible...', now(), 88, 'Solid analysis of Abraham''s faith journey.', v_santos_id, now(), 'graded') RETURNING id INTO v_sub6_id;

  -- Quiz 1 for BIB101: Old Testament Quiz
  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions)
  VALUES (gen_random_uuid(), v_bib101_id, 'Old Testament Quiz', 'Test your knowledge of the Old Testament books, themes, and key figures', 'graded', 30, 50, 2, true, true, '2026-11-01', 'published', 70,
    'Answer all questions. You have 30 minutes. You may attempt this quiz up to 2 times.')
  RETURNING id INTO v_quiz1_id;

  -- Questions for Quiz 1
  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position, explanation) VALUES
    (gen_random_uuid(), v_quiz1_id, 'How many books are in the Old Testament?', 'multiple_choice', 10, 1, 'The Protestant Old Testament contains 39 books.') RETURNING id INTO v_q1_id,
    (gen_random_uuid(), v_quiz1_id, 'The first five books of the Bible are called the Pentateuch.', 'true_false', 10, 2, 'The Pentateuch (Genesis through Deuteronomy) was traditionally attributed to Moses.') RETURNING id INTO v_q2_id,
    (gen_random_uuid(), v_quiz1_id, 'Which prophet was taken to Babylon in the exile?', 'multiple_choice', 10, 3, 'Daniel was among those taken to Babylon during the exile.') RETURNING id INTO v_q3_id,
    (gen_random_uuid(), v_quiz1_id, 'The Book of Psalms was written entirely by King David.', 'true_false', 10, 4, 'While David wrote many psalms, others were written by Asaph, the sons of Korah, Moses, Solomon, and Ethan.') RETURNING id INTO v_q4_id,
    (gen_random_uuid(), v_quiz1_id, 'Briefly explain the significance of the Abrahamic covenant.', 'short_answer', 10, 5, 'The Abrahamic covenant established God''s promise to make Abraham a great nation and bless all nations through him.') RETURNING id INTO v_q5_id;

  -- Answers for MC/TF questions
  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES
    (v_q1_id, '39', true, 1),
    (v_q1_id, '40', false, 2),
    (v_q1_id, '46', false, 3),
    (v_q1_id, '66', false, 4),
    (v_q2_id, 'True', true, 1),
    (v_q2_id, 'False', false, 2),
    (v_q3_id, 'Isaiah', false, 1),
    (v_q3_id, 'Jeremiah', false, 2),
    (v_q3_id, 'Daniel', true, 3),
    (v_q3_id, 'Ezekiel', false, 4),
    (v_q4_id, 'True', false, 1),
    (v_q4_id, 'False', true, 2);

  -- Quiz attempts for Quiz 1
  INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, started_at, submitted_at, score, time_spent, status)
  VALUES (gen_random_uuid(), v_quiz1_id, v_maria_id, 1, now() - interval '2 hours', now() - interval '1 hour 30 minutes', 40, 1800, 'graded')
  RETURNING id INTO v_attempt1_id;

  INSERT INTO quiz_attempts (id, quiz_id, student_id, attempt_number, started_at, submitted_at, score, time_spent, status)
  VALUES (gen_random_uuid(), v_quiz1_id, v_juan_id, 1, now() - interval '3 hours', now() - interval '2 hours 40 minutes', 35, 1200, 'graded')
  RETURNING id INTO v_attempt2_id;

  -- Quiz responses for Maria's attempt
  INSERT INTO quiz_responses (attempt_id, question_id, answer_id, points_earned, auto_graded) VALUES
    ((SELECT id FROM quiz_answers WHERE question_id = v_q1_id AND is_correct = true LIMIT 1), v_attempt1_id, v_q1_id, null, 10, true),
    ((SELECT id FROM quiz_answers WHERE question_id = v_q2_id AND is_correct = true LIMIT 1), v_attempt1_id, v_q2_id, null, 10, true),
    ((SELECT id FROM quiz_answers WHERE question_id = v_q3_id AND answer_text = 'Isaiah' LIMIT 1), v_attempt1_id, v_q3_id, null, 0, true),
    ((SELECT id FROM quiz_answers WHERE question_id = v_q4_id AND is_correct = true LIMIT 1), v_attempt1_id, v_q4_id, null, 10, true);

  -- Announcements for BIB101
  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_bib101_id, 'Welcome to Biblical Foundations I!', 'Welcome everyone! I''m excited to journey through the Bible together this semester. Please review the syllabus and introduce yourself in the discussion forum.', v_santos_id, true),
    (v_bib101_id, 'Midterm Study Guide Available', 'The midterm study guide is now available in Module 2. Please review it carefully. Office hours are available Thursday 2-4 PM if you have questions.', v_santos_id, false);

  -- Groups for BIB101
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES
    (gen_random_uuid(), v_bib101_id, 'Team Alpha', 'Study group Alpha - focused on OT research', 5) RETURNING id INTO v_grp1_id,
    (gen_random_uuid(), v_bib101_id, 'Team Beta', 'Study group Beta - focused on NT research', 5) RETURNING id INTO v_grp2_id;

  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp1_id, v_maria_id, 'leader'),
    (v_grp1_id, v_juan_id, 'member'),
    (v_grp1_id, v_ana_id, 'member'),
    (v_grp1_id, v_pedro_id, 'member'),
    (v_grp2_id, v_rosa_id, 'leader'),
    (v_grp2_id, v_luis_id, 'member'),
    (v_grp2_id, v_carmen_id, 'member'),
    (v_grp2_id, v_diego_id, 'member');

  -- Rubric for BIB101
  INSERT INTO rubrics (id, course_id, title, description, points_possible, created_by)
  VALUES (gen_random_uuid(), v_bib101_id, 'Essay Grading Rubric', 'Standard rubric for evaluating biblical studies essays', 100, v_santos_id)
  RETURNING id INTO v_rubric1_id;

  INSERT INTO rubric_criteria (rubric_id, description, points, position) VALUES
    (v_rubric1_id, 'Thesis clarity and argument strength', 30, 1),
    (v_rubric1_id, 'Use of Scripture references', 25, 2),
    (v_rubric1_id, 'Writing quality and grammar', 20, 3),
    (v_rubric1_id, 'Theological accuracy', 25, 4);

  -- Enrollments for BIB101
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

  v_course_count := 1;

  -- ============================================
  -- COURSE 2: Practical Ministry I (MIN201)
  -- ============================================

  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'MIN201', 'Practical Ministry I',
    'Hands-on training in pastoral care, preaching, and church administration. Includes field practice assignments.',
    'Fall 2026', 'published', v_reyes_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_min201_id;

  INSERT INTO modules (id, course_id, title, description, position, published) VALUES
    (gen_random_uuid(), v_min201_id, 'Foundations of Ministry', 'Core principles of effective ministry leadership', 1, true) RETURNING id INTO v_mod4_id,
    (gen_random_uuid(), v_min201_id, 'Field Practice', 'Practical application through church assignment', 2, true) RETURNING id INTO v_mod5_id;

  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod4_id, 'page', 'The Call to Ministry', '<h2>Understanding Your Calling</h2><p>Ministry is not just a profession—it is a calling from God. In this module, we explore what it means to be called and how to steward that calling faithfully.</p>', 1),
    (v_mod4_id, 'assignment', 'Ministry Philosophy Paper', 'Write a 1000-word paper articulating your personal philosophy of ministry.', 2),
    (v_mod5_id, 'page', 'Field Practice Guidelines', '<h2>Field Practice Expectations</h2><p>Each student will be assigned to a local church for practical ministry experience. Minimum 10 hours per week required.</p>', 1),
    (v_mod5_id, 'discussion', 'Field Practice Reflections', 'Share your weekly field practice experiences. What challenges and blessings did you encounter?', 2),
    (v_mod5_id, 'assignment', 'Field Practice Report', 'Submit a detailed report of your field practice activities, including hours served and lessons learned.', 3);

  -- Discussion for MIN201
  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES
    (gen_random_uuid(), v_min201_id, 'Field Practice Reflections', 'Share your weekly field practice experiences here. What challenges and blessings did you encounter this week?', 'threaded', v_reyes_id)
  RETURNING id INTO v_disc2_id;

  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc2_id, v_reyes_id, 'Week 1 reflections! Share your first week experiences at your church assignments.'),
    (v_disc2_id, v_rosa_id, 'My first week at South Bay was amazing! I helped lead worship and visited two families. The pastoral care aspect was challenging but rewarding.'),
    (v_disc2_id, v_luis_id, 'I was assigned to the youth ministry. It was intimidating at first, but the teens were receptive. I learned that authenticity matters more than eloquence.'),
    (v_disc2_id, v_carmen_id, 'Had a difficult experience visiting a hospital patient. It taught me that sometimes presence matters more than words.');

  -- Assignments for MIN201
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_min201_id, 'Ministry Philosophy Paper', 'Write a 1000-word paper articulating your personal philosophy of ministry. Include biblical foundations.', '2026-10-01', 100, 'published', v_reyes_id)
  RETURNING id INTO v_asgn3_id;

  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_min201_id, 'Field Practice Report', 'Submit a detailed report of your field practice activities including hours served and lessons learned.', '2026-12-01', 100, 'published', v_reyes_id)
  RETURNING id INTO v_asgn4_id;

  -- Submissions for MIN201
  INSERT INTO submissions (assignment_id, student_id, content, submitted_at, grade, feedback, graded_by, graded_at, status) VALUES
    (v_asgn3_id, v_rosa_id, 'My philosophy of ministry centers on servant leadership...', now() - interval '3 days', 90, 'Excellent integration of Scripture and personal reflection.', v_reyes_id, now() - interval '1 day', 'graded'),
    (v_asgn3_id, v_luis_id, 'I believe ministry should be grounded in love and authenticity...', now() - interval '2 days', 85, 'Good start! Consider expanding on your discipleship approach.', v_reyes_id, now() - interval '1 day', 'graded');

  -- Quiz for MIN201
  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions)
  VALUES (gen_random_uuid(), v_min201_id, 'Ministry Principles Quiz', 'Assess your understanding of core ministry principles', 'graded', 20, 40, 2, true, true, '2026-10-15', 'published', 60,
    'Complete all questions within 20 minutes.')
  RETURNING id INTO v_quiz2_id;

  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES
    (gen_random_uuid(), v_quiz2_id, 'What is the primary characteristic of servant leadership according to Mark 10:45?', 'multiple_choice', 10, 1) RETURNING id INTO v_q6_id,
    (gen_random_uuid(), v_quiz2_id, 'Pastoral care only involves preaching on Sundays.', 'true_false', 10, 2) RETURNING id INTO v_q7_id,
    (gen_random_uuid(), v_quiz2_id, 'Effective ministry requires both spiritual maturity and practical skills.', 'true_false', 10, 3) RETURNING id INTO v_q8_id,
    (gen_random_uuid(), v_quiz2_id, 'Name one essential quality of a minister mentioned in 1 Timothy 3.', 'short_answer', 10, 4) RETURNING id INTO v_q9_id;

  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES
    (v_q6_id, 'Seeking to serve rather than be served', true, 1),
    (v_q6_id, 'Having authority over others', false, 2),
    (v_q6_id, 'Attending seminary', false, 3),
    (v_q6_id, 'Preaching eloquently', false, 4),
    (v_q7_id, 'True', false, 1),
    (v_q7_id, 'False', true, 2),
    (v_q8_id, 'True', true, 1),
    (v_q8_id, 'False', false, 2);

  -- Announcements for MIN201
  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_min201_id, 'Field Practice Assignments Posted', 'Check Module 2 for your church field practice assignments. Contact me if you have any scheduling conflicts.', v_reyes_id, true),
    (v_min201_id, 'Guest Speaker Next Week', 'Next Tuesday we will have Pastor David Lim sharing about church planting. Prepare questions in advance!', v_reyes_id, false);

  -- Groups for MIN201
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES
    (gen_random_uuid(), v_min201_id, 'Ministry Team Grace', 'Pastoral care focus group', 5) RETURNING id INTO v_grp3_id,
    (gen_random_uuid(), v_min201_id, 'Ministry Team Hope', 'Youth ministry focus group', 5) RETURNING id INTO v_grp4_id;

  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp3_id, v_maria_id, 'leader'), (v_grp3_id, v_rosa_id, 'member'), (v_grp3_id, v_luis_id, 'member'), (v_grp3_id, v_carmen_id, 'member'),
    (v_grp4_id, v_juan_id, 'leader'), (v_grp4_id, v_ana_id, 'member'), (v_grp4_id, v_pedro_id, 'member'), (v_grp4_id, v_diego_id, 'member');

  -- Enrollments for MIN201
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

  v_course_count := 2;

  -- ============================================
  -- COURSE 3: Church History (HIS301)
  -- ============================================

  INSERT INTO courses (id, code, name, description, term, status, created_by, start_date, end_date)
  VALUES (gen_random_uuid(), 'HIS301', 'Church History',
    'A survey of church history from the apostolic age to the modern era, with emphasis on key movements, figures, and theological developments.',
    'Fall 2026', 'published', v_cruz_id, '2026-09-01', '2026-12-15')
  RETURNING id INTO v_his301_id;

  INSERT INTO modules (id, course_id, title, description, position, published) VALUES
    (gen_random_uuid(), v_his301_id, 'The Early Church', 'From Pentecost to Constantine', 1, true) RETURNING id INTO v_mod6_id;

  INSERT INTO module_items (module_id, type, title, content, position) VALUES
    (v_mod6_id, 'page', 'The Apostolic Age', '<h2>The Birth of the Church</h2><p>Following Pentecost, the early church grew rapidly despite persecution. The apostles established communities of faith across the Roman Empire.</p>', 1),
    (v_mod6_id, 'page', 'Persecution and Martyrdom', '<h2>The First 300 Years</h2><p>From Nero to Diocletian, the early church faced systematic persecution. Yet the faith continued to spread and grow.</p>', 2);

  -- Discussion for HIS301
  INSERT INTO discussions (id, course_id, title, description, type, created_by) VALUES
    (gen_random_uuid(), v_his301_id, 'Early Church Lessons', 'What lessons can the modern church learn from the early church fathers?', 'side_comment', v_cruz_id)
  RETURNING id INTO v_disc3_id;

  INSERT INTO discussion_posts (discussion_id, author_id, content) VALUES
    (v_disc3_id, v_cruz_id, 'Let''s discuss how the early church''s approach to community and discipleship can inform our modern practices.'),
    (v_disc3_id, v_pedro_id, 'I think their commitment to meeting daily and sharing everything in common is challenging for us today.'),
    (v_disc3_id, v_diego_id, 'The early church also modeled incredible perseverance through persecution. That kind of faith is inspiring.');

  -- Assignments for HIS301
  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_his301_id, 'Church Fathers Research Paper', 'Research one early church father (e.g., Augustine, Origen, Tertullian) and write a 1000-word paper on their theological contributions.', '2026-11-15', 100, 'published', v_cruz_id)
  RETURNING id INTO v_asgn5_id;

  INSERT INTO assignments (id, course_id, title, description, due_date, points_possible, status, created_by) VALUES
    (gen_random_uuid(), v_his301_id, 'Timeline Project', 'Create a visual timeline of the first 500 years of church history, marking key events, councils, and figures.', '2026-12-10', 100, 'published', v_cruz_id)
  RETURNING id INTO v_asgn6_id;

  -- Quiz for HIS301
  INSERT INTO quizzes (id, course_id, title, description, quiz_type, time_limit, points_possible, allowed_attempts, shuffle_answers, show_correct_answers, due_date, status, passing_score, instructions)
  VALUES (gen_random_uuid(), v_his301_id, 'Early Church Quiz', 'Test your knowledge of the first 300 years of church history', 'graded', 25, 50, 1, true, false, '2026-10-20', 'published', 70,
    'Answer all questions. You have one attempt and 25 minutes.')
  RETURNING id INTO v_quiz3_id;

  INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, position) VALUES
    (gen_random_uuid(), v_quiz3_id, 'In what year did Constantine issue the Edict of Milan?', 'multiple_choice', 10, 1) RETURNING id INTO v_q10_id;

  INSERT INTO quiz_answers (question_id, answer_text, is_correct, position) VALUES
    (v_q10_id, '313 AD', true, 1),
    (v_q10_id, '325 AD', false, 2),
    (v_q10_id, '380 AD', false, 3),
    (v_q10_id, '301 AD', false, 4);

  -- Announcements for HIS301
  INSERT INTO announcements (course_id, title, content, posted_by, pinned) VALUES
    (v_his301_id, 'Course Materials Available', 'All reading materials and lecture slides are now available. Check each module for downloads.', v_cruz_id, true),
    (v_his301_id, 'Library Resources', 'The seminary library has reserved key church history texts for our course. Visit the front desk.', v_cruz_id, false);

  -- Groups for HIS301
  INSERT INTO groups (id, course_id, name, description, max_members) VALUES
    (gen_random_uuid(), v_his301_id, 'History Scholars A', 'Research group for church history projects', 5) RETURNING id INTO v_grp5_id,
    (gen_random_uuid(), v_his301_id, 'History Scholars B', 'Research group for church history projects', 5) RETURNING id INTO v_grp6_id;

  INSERT INTO group_members (group_id, user_id, role) VALUES
    (v_grp5_id, v_ana_id, 'leader'), (v_grp5_id, v_pedro_id, 'member'), (v_grp5_id, v_luis_id, 'member'), (v_grp5_id, v_diego_id, 'member'),
    (v_grp6_id, v_maria_id, 'leader'), (v_grp6_id, v_juan_id, 'member'), (v_grp6_id, v_rosa_id, 'member'), (v_grp6_id, v_carmen_id, 'member');

  -- Enrollments for HIS301
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

  v_course_count := 3;

  -- ============================================
  -- QUESTION BANK (shared across courses)
  -- ============================================

  INSERT INTO question_banks (id, name, description, is_public, created_by)
  VALUES (gen_random_uuid(), 'MBSI General Bible Knowledge', 'Shared question bank for biblical studies', true, v_santos_id)
  RETURNING id INTO v_bank_id;

  INSERT INTO question_categories (id, question_bank_id, name, description)
  VALUES
    (gen_random_uuid(), v_bank_id, 'Old Testament', 'Questions about the Old Testament') RETURNING id INTO v_cat1_id,
    (gen_random_uuid(), v_bank_id, 'New Testament', 'Questions about the New Testament') RETURNING id INTO v_cat2_id;

  INSERT INTO question_bank_items (question_bank_id, category_id, question_text, question_type, difficulty_level, points, tags, created_by) VALUES
    (v_bank_id, v_cat1_id, 'Who wrote the Book of Psalms primarily?', 'multiple_choice', 'medium', 10, ARRAY['psalms','david','worship'], v_santos_id),
    (v_bank_id, v_cat1_id, 'What is the shortest book in the Old Testament?', 'multiple_choice', 'easy', 5, ARRAY['obadiah','minor_prophets'], v_santos_id),
    (v_bank_id, v_cat2_id, 'How many Gospel accounts are there in the New Testament?', 'multiple_choice', 'easy', 5, ARRAY['gospels','matthew','mark','luke','john'], v_santos_id),
    (v_bank_id, v_cat2_id, 'Which apostle wrote the most books in the New Testament?', 'multiple_choice', 'medium', 10, ARRAY['paul','epistles'], v_santos_id),
    (v_bank_id, v_cat1_id, 'Explain the significance of the Day of Atonement in Levitical worship.', 'essay', 'hard', 20, ARRAY['leviticus','atonement','sacrifice'], v_santos_id);

  -- ============================================
  -- RETURN SUMMARY
  -- ============================================

  RETURN jsonb_build_object(
    'users', v_user_count,
    'teachers', 3,
    'students', 8,
    'ta', 1,
    'courses', v_course_count,
    'modules', 6,
    'discussions', 3,
    'announcements', 6,
    'quizzes', 3,
    'questions', 10,
    'assignments', 6,
    'submissions', 6,
    'groups', 6,
    'rubrics', 1,
    'question_bank_items', 5,
    'password', 'Demo@1234',
    'status', 'seeded'
  );
END;
$$;
