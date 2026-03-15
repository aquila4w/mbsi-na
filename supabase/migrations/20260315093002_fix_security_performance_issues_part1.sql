/*
  # Fix Database Security and Performance Issues - Part 1

  ## Changes Overview
  
  ### 1. Foreign Key Indexes
  - Add missing indexes for all foreign key columns to improve query performance
  - Covers 22 tables with unindexed foreign keys
  
  ### 2. Quiz Question Pool RLS
  - Add missing RLS policies for quiz_question_pool table
  
  ### 3. Function Search Path
  - Fix update_updated_at_column function to use immutable search path
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

-- announcements
CREATE INDEX IF NOT EXISTS idx_announcements_posted_by ON announcements(posted_by);

-- assignment_rubrics
CREATE INDEX IF NOT EXISTS idx_assignment_rubrics_rubric_id ON assignment_rubrics(rubric_id);

-- course_templates
CREATE INDEX IF NOT EXISTS idx_course_templates_created_by ON course_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_course_templates_source_course_id ON course_templates(source_course_id);

-- custom_role_permissions
CREATE INDEX IF NOT EXISTS idx_custom_role_permissions_permission_id ON custom_role_permissions(permission_id);

-- custom_roles
CREATE INDEX IF NOT EXISTS idx_custom_roles_created_by ON custom_roles(created_by);

-- discussion_posts
CREATE INDEX IF NOT EXISTS idx_discussion_posts_author_id ON discussion_posts(author_id);

-- discussions
CREATE INDEX IF NOT EXISTS idx_discussions_created_by ON discussions(created_by);

-- issued_certificates
CREATE INDEX IF NOT EXISTS idx_issued_certificates_template_id ON issued_certificates(template_id);

-- organization_members
CREATE INDEX IF NOT EXISTS idx_organization_members_invited_by ON organization_members(invited_by);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_primary_organization_id ON profiles(primary_organization_id);

-- question_bank_items
CREATE INDEX IF NOT EXISTS idx_question_bank_items_created_by ON question_bank_items(created_by);

-- quiz_question_pool
CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_category_id ON quiz_question_pool(category_id);

-- quiz_responses
CREATE INDEX IF NOT EXISTS idx_quiz_responses_answer_id ON quiz_responses(answer_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_graded_by ON quiz_responses(graded_by);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);

-- quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

-- rubrics
CREATE INDEX IF NOT EXISTS idx_rubrics_created_by ON rubrics(created_by);

-- submissions
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by ON submissions(graded_by);

-- teams
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- user_custom_role_assignments
CREATE INDEX IF NOT EXISTS idx_user_custom_role_assignments_assigned_by ON user_custom_role_assignments(assigned_by);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON user_roles(granted_by);

-- =============================================================================
-- 2. ADD MISSING RLS POLICIES FOR quiz_question_pool
-- =============================================================================

CREATE POLICY "Teachers can view quiz question pools"
  ON quiz_question_pool FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_question_pool.quiz_id AND c.created_by = (select auth.uid())
    )
  );

CREATE POLICY "Teachers can manage quiz question pools"
  ON quiz_question_pool FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_question_pool.quiz_id AND c.created_by = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = quiz_question_pool.quiz_id AND c.created_by = (select auth.uid())
    )
  );

-- =============================================================================
-- 3. FIX FUNCTION SEARCH PATH
-- =============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate all triggers that were dropped
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_items_updated_at BEFORE UPDATE ON module_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_posts_updated_at BEFORE UPDATE ON discussion_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rubrics_updated_at BEFORE UPDATE ON rubrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_banks_updated_at BEFORE UPDATE ON question_banks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_bank_items_updated_at BEFORE UPDATE ON question_bank_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proctoring_settings_updated_at BEFORE UPDATE ON proctoring_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proctoring_sessions_updated_at BEFORE UPDATE ON proctoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_access_rules_updated_at BEFORE UPDATE ON quiz_access_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificate_templates_updated_at BEFORE UPDATE ON certificate_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_roles_updated_at BEFORE UPDATE ON custom_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
