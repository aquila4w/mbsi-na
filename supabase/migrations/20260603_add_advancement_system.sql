/*
  # Add Student Advancement & Deliberation System

  ## Overview
  Creates the complete advancement system for MBSI NA, including:
  - Level hierarchy (AMP Internship → Probationary → MBSI)
  - Student enrollment lifecycle (enroll, quit, re-enter, graduate)
  - Place assignments (one-to-many, with from/to dates)
  - Year-level profiles (academics, spirituality, etc. per year)
  - Annual deliberation sessions and decisions
  - Graduate-to-minister promotion tracking

  ## New Tables

  ### `mbsi_levels`
  Canonical level hierarchy and progression rules.

  ### `student_enrollments`
  Full student lifecycle tracking. Supports re-entry with linked prior enrollment.

  ### `student_place_assignments`
  One-to-many place/church assignments per student with date ranges.

  ### `student_year_profiles`
  Per-year attributes (academics, spirituality, etc.) replacing flat fields on student_metrics_students.

  ### `advancement_sessions`
  One row per academic-year deliberation batch. Status: draft → in_review → finalized → applied.

  ### `advancement_decisions`
  One row per student per session, capturing deliberation outcome and conditions.

  ## Modified Tables
  - `student_metrics_students`: Add current_level_id, current_status, graduated_at
  - `student_metrics_records`: Add level_code
  - `profiles`: Add 'minister' to role CHECK constraint

  ## Security
  - RLS enabled on all new tables
  - Admins and teachers/ta can read/write
  - Admins can delete
*/

-- ============================================
-- 1. MBSI LEVELS
-- ============================================

CREATE TABLE IF NOT EXISTS mbsi_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  display_name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('amp_internship', 'probationary', 'mbsi', 'terminal')),
  tier_order int NOT NULL,
  level_order int NOT NULL,
  next_level_id uuid REFERENCES mbsi_levels(id),
  is_terminal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seed levels (insert in dependency order)
INSERT INTO mbsi_levels (code, display_name, tier, tier_order, level_order, is_terminal) VALUES
  ('amp_1', '1st Year AMP Intern', 'amp_internship', 0, 0, false),
  ('amp_2', '2nd Year AMP Intern', 'amp_internship', 0, 1, false),
  ('prob_1', '1st Year Probationary', 'probationary', 1, 0, false),
  ('prob_2', '2nd Year Probationary', 'probationary', 1, 1, false),
  ('bible_1', '1st Year Bible Student', 'mbsi', 2, 0, false),
  ('bible_2', '2nd Year Bible Student', 'mbsi', 2, 1, false),
  ('prac_1', '1st Year Practicum', 'mbsi', 2, 2, false),
  ('prac_2', '2nd Year Practicum', 'mbsi', 2, 3, false),
  ('graduated', 'Graduate / Minister', 'terminal', 3, 0, true),
  ('honorable_discharge', 'Honorable Discharge', 'terminal', 3, 1, true)
ON CONFLICT (code) DO NOTHING;

-- Set next_level_id references
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'amp_2') WHERE code = 'amp_1';
UPDATE mbsi_levels SET next_level_id = NULL WHERE code = 'amp_2';  -- choose path: MBSI or discharge
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prob_2') WHERE code = 'prob_1';
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_1') WHERE code = 'prob_2';
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'bible_2') WHERE code = 'bible_1';
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prac_1') WHERE code = 'bible_2';
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'prac_2') WHERE code = 'prac_1';
UPDATE mbsi_levels SET next_level_id = (SELECT id FROM mbsi_levels WHERE code = 'graduated') WHERE code = 'prac_2';

-- ============================================
-- 2. STUDENT ENROLLMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES mbsi_levels(id),
  academic_year text NOT NULL DEFAULT '',
  enrolled_at date,
  status text NOT NULL DEFAULT 'enrolled'
    CHECK (status IN ('enrolled', 'active', 'on_leave', 'quit', 'graduated', 'expelled', 'honorable_discharge', 'minister_promoted')),
  exited_at date,
  exit_reason text DEFAULT '',
  re_entry_of uuid REFERENCES student_enrollments(id) ON DELETE SET NULL,
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON student_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_level ON student_enrollments(level_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_academic_year ON student_enrollments(academic_year);

-- ============================================
-- 3. STUDENT PLACE ASSIGNMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS student_place_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES student_enrollments(id) ON DELETE SET NULL,
  location text NOT NULL DEFAULT '',
  ministry_role text DEFAULT '',
  supervisor_name text DEFAULT '',
  notes text DEFAULT '',
  assigned_from date NOT NULL DEFAULT CURRENT_DATE,
  assigned_until date,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_assignments_student ON student_place_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_place_assignments_enrollment ON student_place_assignments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_place_assignments_current ON student_place_assignments(is_current);

-- ============================================
-- 4. STUDENT YEAR PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS student_year_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES student_enrollments(id) ON DELETE SET NULL,
  level_id uuid REFERENCES mbsi_levels(id),
  academic_year text NOT NULL DEFAULT '',
  academics text DEFAULT '',
  spirituality text DEFAULT '',
  jobspec_ministries text DEFAULT '',
  ministerial_proficiency text DEFAULT '',
  character_summary text DEFAULT '',
  achievements_ranking text DEFAULT '',
  faculty_recommendation text DEFAULT '',
  faculty_remarks text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_year_profiles_student ON student_year_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_year_profiles_level ON student_year_profiles(level_id);

-- ============================================
-- 5. ADVANCEMENT SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS advancement_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year text NOT NULL UNIQUE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'finalized', 'applied')),
  title text DEFAULT '',
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adv_sessions_year ON advancement_sessions(academic_year);
CREATE INDEX IF NOT EXISTS idx_adv_sessions_status ON advancement_sessions(status);

-- ============================================
-- 6. ADVANCEMENT DECISIONS
-- ============================================

CREATE TABLE IF NOT EXISTS advancement_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES advancement_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES student_enrollments(id) ON DELETE SET NULL,
  current_level_id uuid REFERENCES mbsi_levels(id),
  current_level_code text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT 'advanced'
    CHECK (outcome IN ('advanced', 'conditional_1', 'conditional_2', 'retained', 'suspended', 'expelled', 'honorable_discharge', 'graduated')),
  target_level_id uuid REFERENCES mbsi_levels(id),
  conditions text DEFAULT '',
  remarks text DEFAULT '',
  metrics_snapshot jsonb DEFAULT '{}',
  is_finalized boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_adv_decisions_session ON advancement_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_adv_decisions_student ON advancement_decisions(student_id);
CREATE INDEX IF NOT EXISTS idx_adv_decisions_outcome ON advancement_decisions(outcome);

-- ============================================
-- 7. COLUMN ADDITIONS TO EXISTING TABLES
-- ============================================

-- Add level and status tracking to student_metrics_students
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'current_level_id') THEN
    ALTER TABLE student_metrics_students ADD COLUMN current_level_id uuid REFERENCES mbsi_levels(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'current_status') THEN
    ALTER TABLE student_metrics_students ADD COLUMN current_status text DEFAULT 'active';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'graduated_at') THEN
    ALTER TABLE student_metrics_students ADD COLUMN graduated_at timestamptz;
  END IF;
END $$;

-- Add level_code to student_metrics_records for level-based queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_records' AND column_name = 'level_code') THEN
    ALTER TABLE student_metrics_records ADD COLUMN level_code text DEFAULT '';
  END IF;
END $$;

-- Add 'minister' to profiles role CHECK constraint
DO $$
BEGIN
  -- Drop and recreate the constraint to include 'minister'
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'teacher', 'student', 'ta', 'designer', 'observer', 'minister'));
END $$;

-- ============================================
-- 8. ROW LEVEL SECURITY
-- ============================================

-- student_enrollments
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view enrollments"
  ON student_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert enrollments"
  ON student_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update enrollments"
  ON student_enrollments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins can delete enrollments"
  ON student_enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- student_place_assignments
ALTER TABLE student_place_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view place assignments"
  ON student_place_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert place assignments"
  ON student_place_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update place assignments"
  ON student_place_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins can delete place assignments"
  ON student_place_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- student_year_profiles
ALTER TABLE student_year_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view year profiles"
  ON student_year_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert year profiles"
  ON student_year_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update year profiles"
  ON student_year_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins can delete year profiles"
  ON student_year_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- advancement_sessions
ALTER TABLE advancement_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view advancement sessions"
  ON advancement_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert advancement sessions"
  ON advancement_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update advancement sessions"
  ON advancement_sessions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins can delete advancement sessions"
  ON advancement_sessions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- advancement_decisions
ALTER TABLE advancement_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view advancement decisions"
  ON advancement_decisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert advancement decisions"
  ON advancement_decisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update advancement decisions"
  ON advancement_decisions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins can delete advancement decisions"
  ON advancement_decisions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- mbsi_levels (read-only for authenticated users)
ALTER TABLE mbsi_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view levels"
  ON mbsi_levels FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 9. INDEXES FOR NEW COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_student_metrics_students_level ON student_metrics_students(current_level_id);
CREATE INDEX IF NOT EXISTS idx_student_metrics_students_status ON student_metrics_students(current_status);

-- ============================================
-- 10. TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_place_assignments_updated_at
  BEFORE UPDATE ON student_place_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_year_profiles_updated_at
  BEFORE UPDATE ON student_year_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advancement_sessions_updated_at
  BEFORE UPDATE ON advancement_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advancement_decisions_updated_at
  BEFORE UPDATE ON advancement_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
