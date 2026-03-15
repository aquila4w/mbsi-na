/*
  # Advanced Quiz/Exam Platform Enhancement

  This migration adds comprehensive TestPortal-inspired features to the quiz module.

  ## 1. New Tables

  ### Question Bank System
  - `question_banks` - Reusable question repositories with categorization
  - `question_bank_items` - Individual questions in the bank
  - `question_categories` - Hierarchical categorization for organizing questions
  - `quiz_question_pool` - Links question banks to quizzes for random drawing

  ### Advanced Question Types
  - Extends `quiz_questions` to support: drag-drop, hotspot, file upload, matching
  - `question_attachments` - Store media files (images, audio, video, documents)
  - `hotspot_regions` - Define clickable regions for hotspot questions
  - `matching_pairs` - Store matching question pairs

  ### Proctoring & Security
  - `proctoring_settings` - Configure proctoring methods per quiz
  - `proctoring_sessions` - Track proctoring data during test taking
  - `proctoring_alerts` - Log suspicious activities detected
  - `browser_lockdown_logs` - Track tab switches and navigation attempts

  ### Certificates & Achievements
  - `certificate_templates` - Customizable certificate designs
  - `issued_certificates` - Track certificates issued to students
  
  ### Analytics & Reporting
  - `quiz_analytics` - Aggregate statistics per quiz
  - `question_analytics` - Question difficulty and discrimination metrics
  - `test_taker_analytics` - Individual performance tracking

  ### Access Control
  - `quiz_access_rules` - Time-based and IP-based access restrictions
  - `quiz_reviewers` - Assign graders for manual question review

  ## 2. Enhanced Columns
  - Add AI generation tracking to questions
  - Add partial points, negative points, bonus points
  - Add randomization settings
  - Add accessibility options
  - Add branding customization

  ## 3. Security
  - Enable RLS on all new tables
  - Policies for role-based access (teachers, students, reviewers, proctors)
  - Protect sensitive proctoring data
*/

-- ============================================
-- QUESTION BANK SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS question_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  is_public boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_banks_created_by ON question_banks(created_by);
CREATE INDEX IF NOT EXISTS idx_question_banks_organization ON question_banks(organization_id);

CREATE TABLE IF NOT EXISTS question_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bank_id uuid REFERENCES question_banks(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_category_id uuid REFERENCES question_categories(id) ON DELETE CASCADE,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_categories_bank ON question_categories(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_question_categories_parent ON question_categories(parent_category_id);

CREATE TABLE IF NOT EXISTS question_bank_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_bank_id uuid NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN (
    'multiple_choice', 'true_false', 'short_answer', 'essay', 
    'file_upload', 'drag_drop', 'hotspot', 'matching'
  )),
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  points integer DEFAULT 1,
  ai_generated boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_items_bank ON question_bank_items(question_bank_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_items_category ON question_bank_items(category_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_items_type ON question_bank_items(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_items_tags ON question_bank_items USING gin(tags);

-- ============================================
-- ENHANCED QUIZ CONFIGURATION
-- ============================================

-- Add new columns to existing quizzes table
DO $$
BEGIN
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS access_code text;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS randomize_questions boolean DEFAULT false;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS questions_per_page integer DEFAULT 1;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS allow_backtrack boolean DEFAULT true;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS show_results_immediately boolean DEFAULT true;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passing_score numeric;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS certificate_template_id uuid;
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS instructions text DEFAULT '';
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS custom_branding jsonb DEFAULT '{}';
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS accessibility_options jsonb DEFAULT '{}';
  ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS ai_proctoring_enabled boolean DEFAULT false;
END $$;

-- Quiz question pool for random question drawing
CREATE TABLE IF NOT EXISTS quiz_question_pool (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_bank_id uuid REFERENCES question_banks(id) ON DELETE CASCADE,
  category_id uuid REFERENCES question_categories(id) ON DELETE SET NULL,
  questions_to_draw integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_quiz ON quiz_question_pool(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_pool_bank ON quiz_question_pool(question_bank_id);

-- ============================================
-- ENHANCED QUESTION TYPES
-- ============================================

-- Add new columns to quiz_questions
DO $$
BEGIN
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS partial_credit_allowed boolean DEFAULT false;
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS negative_points numeric DEFAULT 0;
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS bonus_points numeric DEFAULT 0;
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS explanation text;
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;
  ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
END $$;

-- Update question type constraint to include new types
DO $$
BEGIN
  ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_question_type_check;
  ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_question_type_check 
    CHECK (question_type IN (
      'multiple_choice', 'true_false', 'short_answer', 'essay',
      'file_upload', 'drag_drop', 'hotspot', 'matching'
    ));
END $$;

-- Question attachments (images, audio, video, documents)
CREATE TABLE IF NOT EXISTS question_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  question_bank_item_id uuid REFERENCES question_bank_items(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT question_attachment_source CHECK (
    (question_id IS NOT NULL AND question_bank_item_id IS NULL) OR
    (question_id IS NULL AND question_bank_item_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_question_attachments_question ON question_attachments(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attachments_bank_item ON question_attachments(question_bank_item_id);

-- Hotspot regions for image-based questions
CREATE TABLE IF NOT EXISTS hotspot_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  question_bank_item_id uuid REFERENCES question_bank_items(id) ON DELETE CASCADE,
  region_type text NOT NULL CHECK (region_type IN ('rectangle', 'circle', 'polygon')),
  coordinates jsonb NOT NULL,
  is_correct boolean DEFAULT false,
  feedback text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT hotspot_region_source CHECK (
    (question_id IS NOT NULL AND question_bank_item_id IS NULL) OR
    (question_id IS NULL AND question_bank_item_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_hotspot_regions_question ON hotspot_regions(question_id);
CREATE INDEX IF NOT EXISTS idx_hotspot_regions_bank_item ON hotspot_regions(question_bank_item_id);

-- Matching pairs for matching questions
CREATE TABLE IF NOT EXISTS matching_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES quiz_questions(id) ON DELETE CASCADE,
  question_bank_item_id uuid REFERENCES question_bank_items(id) ON DELETE CASCADE,
  left_item text NOT NULL,
  right_item text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT matching_pair_source CHECK (
    (question_id IS NOT NULL AND question_bank_item_id IS NULL) OR
    (question_id IS NULL AND question_bank_item_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_matching_pairs_question ON matching_pairs(question_id);
CREATE INDEX IF NOT EXISTS idx_matching_pairs_bank_item ON matching_pairs(question_bank_item_id);

-- ============================================
-- PROCTORING & SECURITY
-- ============================================

CREATE TABLE IF NOT EXISTS proctoring_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  browser_lockdown boolean DEFAULT false,
  webcam_required boolean DEFAULT false,
  screen_recording boolean DEFAULT false,
  detect_screen_sharing boolean DEFAULT false,
  detect_multiple_monitors boolean DEFAULT false,
  face_recognition boolean DEFAULT false,
  anomaly_detection boolean DEFAULT false,
  max_tab_switches integer DEFAULT 3,
  max_warnings integer DEFAULT 5,
  auto_submit_on_violation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proctoring_settings_quiz ON proctoring_settings(quiz_id);

CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  webcam_snapshot_urls text[] DEFAULT '{}',
  screen_recording_url text,
  violations_count integer DEFAULT 0,
  warnings_issued integer DEFAULT 0,
  session_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_attempt ON proctoring_sessions(attempt_id);

CREATE TABLE IF NOT EXISTS proctoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN (
    'tab_switch', 'face_not_detected', 'multiple_faces', 
    'screen_sharing', 'suspicious_behavior', 'extended_inactivity',
    'rapid_answering', 'browser_navigation'
  )),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description text,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_proctoring_alerts_session ON proctoring_alerts(session_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_alerts_type ON proctoring_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_proctoring_alerts_severity ON proctoring_alerts(severity);

-- ============================================
-- ACCESS CONTROL & RESTRICTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_access_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  available_from timestamptz,
  available_until timestamptz,
  ip_whitelist text[] DEFAULT '{}',
  require_access_code boolean DEFAULT false,
  specific_users uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_access_rules_quiz ON quiz_access_rules(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_reviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_grade boolean DEFAULT true,
  can_view_all_attempts boolean DEFAULT true,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_reviewers_quiz ON quiz_reviewers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_reviewers_reviewer ON quiz_reviewers(reviewer_id);

-- ============================================
-- CERTIFICATES
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  template_html text NOT NULL,
  custom_fields jsonb DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_templates_created_by ON certificate_templates(created_by);

CREATE TABLE IF NOT EXISTS issued_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  template_id uuid REFERENCES certificate_templates(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  certificate_url text,
  issued_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_issued_certificates_student ON issued_certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_quiz ON issued_certificates(quiz_id);
CREATE INDEX IF NOT EXISTS idx_issued_certificates_attempt ON issued_certificates(attempt_id);

-- ============================================
-- ANALYTICS & REPORTING
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  total_attempts integer DEFAULT 0,
  completed_attempts integer DEFAULT 0,
  average_score numeric,
  median_score numeric,
  highest_score numeric,
  lowest_score numeric,
  average_time_spent integer,
  pass_rate numeric,
  last_calculated timestamptz DEFAULT now(),
  UNIQUE(quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_analytics_quiz ON quiz_analytics(quiz_id);

CREATE TABLE IF NOT EXISTS question_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  times_answered integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  times_incorrect integer DEFAULT 0,
  difficulty_index numeric,
  discrimination_index numeric,
  average_time_spent integer,
  last_calculated timestamptz DEFAULT now(),
  UNIQUE(question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_analytics_question ON question_analytics(question_id);

CREATE TABLE IF NOT EXISTS test_taker_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  attempts_count integer DEFAULT 0,
  best_score numeric,
  average_score numeric,
  total_time_spent integer DEFAULT 0,
  completion_rate numeric,
  last_attempt_at timestamptz,
  UNIQUE(student_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_test_taker_analytics_student ON test_taker_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_test_taker_analytics_quiz ON test_taker_analytics(quiz_id);

-- ============================================
-- ENHANCED QUIZ RESPONSES
-- ============================================

-- Add columns for file uploads and advanced response types
DO $$
BEGIN
  ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS file_upload_url text;
  ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS response_metadata jsonb DEFAULT '{}';
  ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS auto_graded boolean DEFAULT false;
  ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
  ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS graded_at timestamptz;
END $$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Question Banks
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public question banks"
  ON question_banks FOR SELECT
  TO authenticated
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage own question banks"
  ON question_banks FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view categories in accessible banks"
  ON question_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM question_banks
      WHERE question_banks.id = question_categories.question_bank_id
      AND (question_banks.is_public = true OR question_banks.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage categories in own banks"
  ON question_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM question_banks
      WHERE question_banks.id = question_categories.question_bank_id
      AND question_banks.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM question_banks
      WHERE question_banks.id = question_categories.question_bank_id
      AND question_banks.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view items in accessible banks"
  ON question_bank_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM question_banks
      WHERE question_banks.id = question_bank_items.question_bank_id
      AND (question_banks.is_public = true OR question_banks.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can manage items in own banks"
  ON question_bank_items FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Question Attachments
ALTER TABLE question_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for accessible questions"
  ON question_attachments FOR SELECT
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_attachments.question_id
      AND enrollments.user_id = auth.uid()
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      JOIN question_banks ON question_banks.id = question_bank_items.question_bank_id
      WHERE question_bank_items.id = question_attachments.question_bank_item_id
      AND (question_banks.is_public = true OR question_banks.created_by = auth.uid())
    ))
  );

CREATE POLICY "Teachers can manage attachments"
  ON question_attachments FOR ALL
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_attachments.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = question_attachments.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  )
  WITH CHECK (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_attachments.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = question_attachments.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  );

-- Hotspot Regions and Matching Pairs
ALTER TABLE hotspot_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hotspot regions for accessible questions"
  ON hotspot_regions FOR SELECT
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = hotspot_regions.question_id
      AND enrollments.user_id = auth.uid()
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      JOIN question_banks ON question_banks.id = question_bank_items.question_bank_id
      WHERE question_bank_items.id = hotspot_regions.question_bank_item_id
      AND (question_banks.is_public = true OR question_banks.created_by = auth.uid())
    ))
  );

CREATE POLICY "Teachers can manage hotspot regions"
  ON hotspot_regions FOR ALL
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = hotspot_regions.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = hotspot_regions.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  )
  WITH CHECK (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = hotspot_regions.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = hotspot_regions.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  );

CREATE POLICY "Users can view matching pairs for accessible questions"
  ON matching_pairs FOR SELECT
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = matching_pairs.question_id
      AND enrollments.user_id = auth.uid()
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      JOIN question_banks ON question_banks.id = question_bank_items.question_bank_id
      WHERE question_bank_items.id = matching_pairs.question_bank_item_id
      AND (question_banks.is_public = true OR question_banks.created_by = auth.uid())
    ))
  );

CREATE POLICY "Teachers can manage matching pairs"
  ON matching_pairs FOR ALL
  TO authenticated
  USING (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = matching_pairs.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = matching_pairs.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  )
  WITH CHECK (
    (question_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = matching_pairs.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    ))
    OR
    (question_bank_item_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM question_bank_items
      WHERE question_bank_items.id = matching_pairs.question_bank_item_id
      AND question_bank_items.created_by = auth.uid()
    ))
  );

-- Proctoring Settings
ALTER TABLE proctoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage proctoring settings"
  ON proctoring_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = proctoring_settings.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = proctoring_settings.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can view own proctoring sessions"
  ON proctoring_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = proctoring_sessions.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view all proctoring sessions"
  ON proctoring_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_attempts.id = proctoring_sessions.attempt_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can create and update proctoring sessions"
  ON proctoring_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = proctoring_sessions.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = proctoring_sessions.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view proctoring alerts"
  ON proctoring_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions
      JOIN quiz_attempts ON quiz_attempts.id = proctoring_sessions.attempt_id
      JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE proctoring_sessions.id = proctoring_alerts.session_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can create proctoring alerts"
  ON proctoring_alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proctoring_sessions
      JOIN quiz_attempts ON quiz_attempts.id = proctoring_sessions.attempt_id
      WHERE proctoring_sessions.id = proctoring_alerts.session_id
      AND quiz_attempts.student_id = auth.uid()
    )
  );

-- Quiz Access Rules
ALTER TABLE quiz_access_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage quiz access rules"
  ON quiz_access_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_access_rules.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_access_rules.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

-- Quiz Reviewers
ALTER TABLE quiz_reviewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can view their assignments"
  ON quiz_reviewers FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Teachers can manage reviewers"
  ON quiz_reviewers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_reviewers.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_reviewers.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Certificates
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issued_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificate templates"
  ON certificate_templates FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage own certificate templates"
  ON certificate_templates FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Students can view own certificates"
  ON issued_certificates FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view course certificates"
  ON issued_certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = issued_certificates.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can issue certificates"
  ON issued_certificates FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Analytics
ALTER TABLE quiz_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_taker_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view quiz analytics"
  ON quiz_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can update quiz analytics"
  ON quiz_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Teachers can view question analytics"
  ON question_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_analytics.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can update question analytics"
  ON question_analytics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_analytics.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = question_analytics.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can view own test taker analytics"
  ON test_taker_analytics FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all test taker analytics"
  ON test_taker_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = test_taker_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "System can update test taker analytics"
  ON test_taker_analytics FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = test_taker_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    student_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = test_taker_analytics.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_question_banks_updated_at
  BEFORE UPDATE ON question_banks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_bank_items_updated_at
  BEFORE UPDATE ON question_bank_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proctoring_settings_updated_at
  BEFORE UPDATE ON proctoring_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proctoring_sessions_updated_at
  BEFORE UPDATE ON proctoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_access_rules_updated_at
  BEFORE UPDATE ON quiz_access_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();