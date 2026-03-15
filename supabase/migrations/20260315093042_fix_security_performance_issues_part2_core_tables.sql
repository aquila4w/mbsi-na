/*
  # Fix RLS Performance Issues - Part 2: Core Tables

  ## Changes
  
  Optimize RLS policies using `(select auth.uid())` pattern for:
  - profiles
  - courses
  - enrollments
  - assignments
  - submissions
  - observer_links
  - notifications
  - quiz_responses
  
  This prevents re-evaluation of auth functions for each row and improves performance at scale.
*/

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- =============================================================================
-- COURSES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
DROP POLICY IF EXISTS "Teachers and admins can create courses" ON courses;
DROP POLICY IF EXISTS "Course creators and admins can update courses" ON courses;
DROP POLICY IF EXISTS "Course creators and admins can delete courses" ON courses;

CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (status = 'published' OR created_by = (select auth.uid()) OR 
         EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role IN ('admin', 'teacher')));

CREATE POLICY "Teachers and admins can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role IN ('admin', 'teacher'))
  );

CREATE POLICY "Course creators and admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    created_by = (select auth.uid()) OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  )
  WITH CHECK (
    created_by = (select auth.uid()) OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

CREATE POLICY "Course creators and admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    created_by = (select auth.uid()) OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

-- =============================================================================
-- ENROLLMENTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Teachers can create enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollment" ON enrollments;
DROP POLICY IF EXISTS "Teachers and admins can delete enrollments" ON enrollments;

CREATE POLICY "Users can view enrollments for their courses"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.created_by = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role IN ('admin', 'teacher'))
  );

CREATE POLICY "Teachers can create enrollments for their courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.created_by = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

CREATE POLICY "Users can update own enrollment"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Teachers and admins can delete enrollments"
  ON enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = enrollments.course_id AND courses.created_by = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

-- =============================================================================
-- ASSIGNMENTS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Teachers can view assignments for their courses" ON assignments;
DROP POLICY IF EXISTS "Students can view published assignments for enrolled courses" ON assignments;
DROP POLICY IF EXISTS "Teachers can create assignments for their courses" ON assignments;
DROP POLICY IF EXISTS "Teachers can update their course assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can delete their course assignments" ON assignments;

CREATE POLICY "Teachers can view assignments for their courses"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.created_by = (select auth.uid()))
  );

CREATE POLICY "Students can view published assignments for enrolled courses"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.course_id = assignments.course_id AND enrollments.user_id = (select auth.uid()))
  );

CREATE POLICY "Teachers can create assignments for their courses"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.created_by = (select auth.uid()))
  );

CREATE POLICY "Teachers can update their course assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.created_by = (select auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.created_by = (select auth.uid()))
  );

CREATE POLICY "Teachers can delete their course assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.created_by = (select auth.uid()))
  );

-- =============================================================================
-- SUBMISSIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can view their own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their course assignments" ON submissions;
DROP POLICY IF EXISTS "Students can create their own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can update their own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can update submissions for grading" ON submissions;

CREATE POLICY "Students can view their own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = (select auth.uid()));

CREATE POLICY "Teachers can view submissions for their course assignments"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      JOIN courses c ON a.course_id = c.id 
      WHERE a.id = submissions.assignment_id AND c.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Students can create their own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = (select auth.uid()));

CREATE POLICY "Students can update their own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (student_id = (select auth.uid()) AND status = 'draft')
  WITH CHECK (student_id = (select auth.uid()));

CREATE POLICY "Teachers can update submissions for grading"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      JOIN courses c ON a.course_id = c.id 
      WHERE a.id = submissions.assignment_id AND c.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments a 
      JOIN courses c ON a.course_id = c.id 
      WHERE a.id = submissions.assignment_id AND c.created_by = (select auth.uid())
    )
  );

-- =============================================================================
-- OBSERVER_LINKS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Observers can view own links" ON observer_links;
DROP POLICY IF EXISTS "Admins and observers can create links" ON observer_links;
DROP POLICY IF EXISTS "Admins and observers can delete links" ON observer_links;

CREATE POLICY "Observers can view own links"
  ON observer_links FOR SELECT
  TO authenticated
  USING (observer_id = (select auth.uid()) OR student_id = (select auth.uid()));

CREATE POLICY "Admins and observers can create links"
  ON observer_links FOR INSERT
  TO authenticated
  WITH CHECK (
    observer_id = (select auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

CREATE POLICY "Admins and observers can delete links"
  ON observer_links FOR DELETE
  TO authenticated
  USING (
    observer_id = (select auth.uid()) OR
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND platform_role = 'admin')
  );

-- =============================================================================
-- NOTIFICATIONS TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix overly permissive policy - only allow creating notifications for authenticated user
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- =============================================================================
-- QUIZ_RESPONSES TABLE
-- =============================================================================

DROP POLICY IF EXISTS "Students can manage own responses" ON quiz_responses;
DROP POLICY IF EXISTS "Students can view own responses" ON quiz_responses;
DROP POLICY IF EXISTS "Teachers can view all responses" ON quiz_responses;

CREATE POLICY "Students can manage own responses"
  ON quiz_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts 
      WHERE quiz_attempts.id = quiz_responses.attempt_id 
      AND quiz_attempts.student_id = (select auth.uid())
    )
  );

CREATE POLICY "Students can view own responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts 
      WHERE quiz_attempts.id = quiz_responses.attempt_id 
      AND quiz_attempts.student_id = (select auth.uid())
    )
  );

CREATE POLICY "Teachers can view all responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qa.id = quiz_responses.attempt_id AND c.created_by = (select auth.uid())
    )
  );
