/*
  # Fix RLS Performance Issues - Part 3: Modules, Discussions, Quizzes

  ## Changes
  
  Optimize RLS policies using `(select auth.uid())` pattern for:
  - modules
  - module_items
  - discussions
  - discussion_posts
  - quizzes
  - quiz_questions
  - quiz_answers
  - quiz_attempts
  
  This prevents re-evaluation of auth functions for each row.
*/

-- =============================================================================
-- MODULES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view published modules in enrolled courses" ON modules;
DROP POLICY IF EXISTS "Teachers can manage modules in their courses" ON modules;

CREATE POLICY "Students can view published modules in enrolled courses"
  ON modules FOR SELECT
  TO authenticated
  USING (
    published = true AND
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = modules.course_id AND enrollments.user_id = (select auth.uid()))
  );

CREATE POLICY "Teachers can manage modules in their courses"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.created_by = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.created_by = (select auth.uid()))
  );

-- =============================================================================
-- MODULE_ITEMS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view module items in enrolled courses" ON module_items;
DROP POLICY IF EXISTS "Teachers can manage module items" ON module_items;

CREATE POLICY "Students can view module items in enrolled courses"
  ON module_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON m.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE m.id = module_items.module_id 
      AND e.user_id = (select auth.uid())
      AND m.published = true
    )
  );

CREATE POLICY "Teachers can manage module items"
  ON module_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = module_items.module_id AND c.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = module_items.module_id AND c.created_by = (select auth.uid())
    )
  );

-- =============================================================================
-- DISCUSSIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view discussions in enrolled courses" ON discussions;
DROP POLICY IF EXISTS "Teachers can manage discussions" ON discussions;

CREATE POLICY "Students can view discussions in enrolled courses"
  ON discussions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = discussions.course_id AND enrollments.user_id = (select auth.uid()))
  );

CREATE POLICY "Teachers can manage discussions"
  ON discussions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = discussions.course_id AND courses.created_by = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = discussions.course_id AND courses.created_by = (select auth.uid()))
  );

-- =============================================================================
-- DISCUSSION_POSTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view posts in enrolled course discussions" ON discussion_posts;
DROP POLICY IF EXISTS "Students can create posts if not locked" ON discussion_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON discussion_posts;

CREATE POLICY "Students can view posts in enrolled course discussions"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN enrollments e ON e.course_id = d.course_id
      WHERE d.id = discussion_posts.discussion_id AND e.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Students can create posts if not locked"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM discussions d
      JOIN enrollments e ON e.course_id = d.course_id
      WHERE d.id = discussion_posts.discussion_id 
      AND e.user_id = (select auth.uid())
      AND d.locked = false
    )
  );

CREATE POLICY "Users can update own posts"
  ON discussion_posts FOR UPDATE
  TO authenticated
  USING (author_id = (select auth.uid()))
  WITH CHECK (author_id = (select auth.uid()));

CREATE POLICY "Users can delete own posts"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (author_id = (select auth.uid()));

-- =============================================================================
-- QUIZZES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Teachers can view quizzes in their courses" ON quizzes;
DROP POLICY IF EXISTS "Students can view published quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers can manage quizzes" ON quizzes;

CREATE POLICY "Teachers can view quizzes in their courses"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = quizzes.course_id AND courses.created_by = (select auth.uid()))
  );

CREATE POLICY "Students can view published quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = quizzes.course_id AND enrollments.user_id = (select auth.uid()))
  );

CREATE POLICY "Teachers can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = quizzes.course_id AND courses.created_by = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = quizzes.course_id AND courses.created_by = (select auth.uid()))
  );

-- =============================================================================
-- QUIZ_QUESTIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can view questions for accessible quizzes" ON quiz_questions;
DROP POLICY IF EXISTS "Teachers can manage quiz questions" ON quiz_questions;

CREATE POLICY "Users can view questions for accessible quizzes"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id 
      AND e.user_id = (select auth.uid())
      AND q.status = 'published'
    )
  );

CREATE POLICY "Teachers can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id AND c.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_questions.quiz_id AND c.created_by = (select auth.uid())
    )
  );

-- =============================================================================
-- QUIZ_ANSWERS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can view answers for accessible questions" ON quiz_answers;
DROP POLICY IF EXISTS "Teachers can manage quiz answers" ON quiz_answers;

CREATE POLICY "Users can view answers for accessible questions"
  ON quiz_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE qq.id = quiz_answers.question_id 
      AND e.user_id = (select auth.uid())
      AND q.status = 'published'
    )
  );

CREATE POLICY "Teachers can manage quiz answers"
  ON quiz_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qq.id = quiz_answers.question_id AND c.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qq.id = quiz_answers.question_id AND c.created_by = (select auth.uid())
    )
  );

-- =============================================================================
-- QUIZ_ATTEMPTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Teachers can view all attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can create own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Students can update own attempts" ON quiz_attempts;

CREATE POLICY "Students can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (student_id = (select auth.uid()));

CREATE POLICY "Teachers can view all attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_attempts.quiz_id AND c.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Students can create own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (student_id = (select auth.uid()));

CREATE POLICY "Students can update own attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (student_id = (select auth.uid()))
  WITH CHECK (student_id = (select auth.uid()));
