/*
  # Add Student Evaluations and Extended Profile Fields

  ## Overview
  Adds periodic student evaluation tables based on the MBSI evaluation form,
  plus additional profile fields per student for academic summary data.

  ## New Tables

  ### `student_evaluations`
  Stores each periodic evaluation of a student by a minister/area leader.
  - Header: date, evaluator name, church assignment, scope, year level
  - Section A: Character Development (5 items, 1-5 scale + comments)
  - Section B: Spiritual Development (5 items, 1-5 scale + data fields + comments)
  - Section C: Work Performance (5 items, 1-5 scale + comments)
  - Section D: Skill Development (5 items, 1-5 scale + comments)
  - Section E: Healthy Behaviors (4 items, 1-5 scale + comments)
  - Section F: Non-compliance / Misconduct (checkboxes + description)

  ### `student_pastor_recommendations`
  Stores the Pastor's Evaluation and Recommendation form.
  - Character narrative, offense, disobedience pattern, strengths
  - Job spec narrative
  - Pastor name, scope, year level

  ## Modified Tables

  ### `student_metrics_students`
  Added extended profile columns:
  - `academics` (text) - academic standing notes
  - `spirituality` (text) - spirituality notes
  - `jobspec_ministries` (text) - job spec / ministries description
  - `ministerial_proficiency` (text) - ministerial proficiency / pastoral care notes
  - `character_summary` (text) - character summary
  - `achievements_ranking` (text) - achievements and ranking
  - `faculty_recommendation` (text) - faculty recommendation
  - `faculty_remarks` (text) - faculty remarks

  ## Security
  - RLS enabled on all new tables
  - Admins and teachers can read/write all evaluations
  - Admins can delete
*/

-- Extended profile fields on students table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'academics') THEN
    ALTER TABLE student_metrics_students ADD COLUMN academics text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'spirituality') THEN
    ALTER TABLE student_metrics_students ADD COLUMN spirituality text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'jobspec_ministries') THEN
    ALTER TABLE student_metrics_students ADD COLUMN jobspec_ministries text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'ministerial_proficiency') THEN
    ALTER TABLE student_metrics_students ADD COLUMN ministerial_proficiency text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'character_summary') THEN
    ALTER TABLE student_metrics_students ADD COLUMN character_summary text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'achievements_ranking') THEN
    ALTER TABLE student_metrics_students ADD COLUMN achievements_ranking text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'faculty_recommendation') THEN
    ALTER TABLE student_metrics_students ADD COLUMN faculty_recommendation text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_metrics_students' AND column_name = 'faculty_remarks') THEN
    ALTER TABLE student_metrics_students ADD COLUMN faculty_remarks text DEFAULT '';
  END IF;
END $$;

-- Student evaluations table
CREATE TABLE IF NOT EXISTS student_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,

  -- Header
  evaluation_date date NOT NULL DEFAULT CURRENT_DATE,
  evaluator_name text NOT NULL DEFAULT '',
  church_assignment text DEFAULT '',
  scope_of_evaluation text DEFAULT '',
  year_level text DEFAULT '',

  -- A. Character Development (1-5)
  char_loyal_respectful integer CHECK (char_loyal_respectful BETWEEN 1 AND 5),
  char_adaptable_resilient integer CHECK (char_adaptable_resilient BETWEEN 1 AND 5),
  char_creative_resourceful integer CHECK (char_creative_resourceful BETWEEN 1 AND 5),
  char_empathic_compassionate integer CHECK (char_empathic_compassionate BETWEEN 1 AND 5),
  char_neat_proper integer CHECK (char_neat_proper BETWEEN 1 AND 5),
  char_comments text DEFAULT '',

  -- B. Spiritual Development (1-5)
  spirit_biblical_proficiency integer CHECK (spirit_biblical_proficiency BETWEEN 1 AND 5),
  spirit_doctrinal_competency integer CHECK (spirit_doctrinal_competency BETWEEN 1 AND 5),
  spirit_depth_in_prayer integer CHECK (spirit_depth_in_prayer BETWEEN 1 AND 5),
  spirit_soul_winning integer CHECK (spirit_soul_winning BETWEEN 1 AND 5),
  spirit_financial_stewardship integer CHECK (spirit_financial_stewardship BETWEEN 1 AND 5),
  spirit_guests integer DEFAULT 0,
  spirit_baptisms integer DEFAULT 0,
  spirit_converts_retention integer DEFAULT 0,
  spirit_thanksgiving_amount numeric(12,2) DEFAULT 0,
  spirit_caroling_amount numeric(12,2) DEFAULT 0,
  spirit_evangelism_offering numeric(12,2) DEFAULT 0,
  spirit_missionary_offering numeric(12,2) DEFAULT 0,
  spirit_comments text DEFAULT '',

  -- C. Work Performance (1-5)
  work_accountable_responsible integer CHECK (work_accountable_responsible BETWEEN 1 AND 5),
  work_productivity_excellence integer CHECK (work_productivity_excellence BETWEEN 1 AND 5),
  work_initiative integer CHECK (work_initiative BETWEEN 1 AND 5),
  work_cooperative integer CHECK (work_cooperative BETWEEN 1 AND 5),
  work_timely integer CHECK (work_timely BETWEEN 1 AND 5),
  work_comments text DEFAULT '',

  -- D. Skill Development (1-5)
  skill_leadership integer CHECK (skill_leadership BETWEEN 1 AND 5),
  skill_interpersonal integer CHECK (skill_interpersonal BETWEEN 1 AND 5),
  skill_communication integer CHECK (skill_communication BETWEEN 1 AND 5),
  skill_organizational integer CHECK (skill_organizational BETWEEN 1 AND 5),
  skill_technical integer CHECK (skill_technical BETWEEN 1 AND 5),
  skill_comments text DEFAULT '',

  -- E. Healthy Behaviors (1-5)
  health_physical integer CHECK (health_physical BETWEEN 1 AND 5),
  health_emotional integer CHECK (health_emotional BETWEEN 1 AND 5),
  health_mental integer CHECK (health_mental BETWEEN 1 AND 5),
  health_relational integer CHECK (health_relational BETWEEN 1 AND 5),
  health_comments text DEFAULT '',

  -- F. Non-compliance / Misconduct
  misconduct_gross_negligence boolean DEFAULT false,
  misconduct_romantic_relationship boolean DEFAULT false,
  misconduct_laziness boolean DEFAULT false,
  misconduct_tampering_records boolean DEFAULT false,
  misconduct_mishandling_money boolean DEFAULT false,
  misconduct_defiance boolean DEFAULT false,
  misconduct_others text DEFAULT '',
  misconduct_description text DEFAULT '',

  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_evaluations_student_id ON student_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_evaluations_date ON student_evaluations(evaluation_date);

-- Pastor recommendations table
CREATE TABLE IF NOT EXISTS student_pastor_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,

  pastor_name text NOT NULL DEFAULT '',
  scope_of_evaluation text DEFAULT '',
  year_level text DEFAULT '',
  evaluation_date date DEFAULT CURRENT_DATE,

  character_description text DEFAULT '',
  offense_committed text DEFAULT '',
  disobedience_patterns text DEFAULT '',
  character_strengths text DEFAULT '',
  jobspec_rating text DEFAULT '',
  jobspec_description text DEFAULT '',
  additional_notes text DEFAULT '',

  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_pastor_recs_student_id ON student_pastor_recommendations(student_id);

-- RLS for student_evaluations
ALTER TABLE student_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view evaluations"
  ON student_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert evaluations"
  ON student_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update evaluations"
  ON student_evaluations FOR UPDATE
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

CREATE POLICY "Admins can delete evaluations"
  ON student_evaluations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS for student_pastor_recommendations
ALTER TABLE student_pastor_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and teachers can view pastor recs"
  ON student_pastor_recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can insert pastor recs"
  ON student_pastor_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

CREATE POLICY "Admins and teachers can update pastor recs"
  ON student_pastor_recommendations FOR UPDATE
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

CREATE POLICY "Admins can delete pastor recs"
  ON student_pastor_recommendations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
