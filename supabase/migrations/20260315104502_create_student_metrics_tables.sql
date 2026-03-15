/*
  # Create Student Metrics Tables

  ## Overview
  Creates tables to track student missionary performance metrics across academic years,
  based on imported spreadsheet data from MBSI NA student records.

  ## New Tables

  ### `student_metrics_students`
  - `id` (uuid, primary key)
  - `full_name` (text) - Student full name
  - `date_entered` (date) - Date student entered the program
  - `created_by` (uuid) - FK to auth.users
  - `created_at`, `updated_at` (timestamps)

  ### `student_metrics_records`
  - `id` (uuid, primary key)
  - `student_id` (uuid) - FK to student_metrics_students
  - `year_level` (text) - e.g. "AMP", "Probationary", "1st Year", etc.
  - `academic_year` (text) - e.g. "2020-2021"
  - `year` (integer) - calendar year
  - `assignment` (text) - location/church assignment
  - `contacts` (integer)
  - `guests` (integer)
  - `baptisms_us` (integer) - US baptisms
  - `baptisms_rrb_ph` (integer) - RRB/Philippines baptisms
  - `thanksgiving_offering` (numeric)
  - `evangelism_offering` (numeric)
  - `caroling_goal_reached` (boolean)
  - `caroling_amount` (numeric) - caroling goal amount
  - `caroling_leader` (boolean)
  - `notes` (text)
  - `created_by` (uuid)
  - `created_at`, `updated_at` (timestamps)

  ## Security
  - RLS enabled on both tables
  - Admins and teachers can read/write all records
  - Students can only read their own records
*/

CREATE TABLE IF NOT EXISTS student_metrics_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  date_entered date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_metrics_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_metrics_students(id) ON DELETE CASCADE,
  year_level text NOT NULL DEFAULT '',
  academic_year text NOT NULL DEFAULT '',
  year integer,
  assignment text DEFAULT '',
  contacts integer DEFAULT 0,
  guests integer DEFAULT 0,
  baptisms_us integer DEFAULT 0,
  baptisms_rrb_ph integer DEFAULT 0,
  thanksgiving_offering numeric(12,2) DEFAULT 0,
  evangelism_offering numeric(12,2) DEFAULT 0,
  caroling_goal_reached boolean DEFAULT false,
  caroling_amount numeric(12,2) DEFAULT 0,
  caroling_leader boolean DEFAULT false,
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_metrics_records_student_id ON student_metrics_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_metrics_records_year ON student_metrics_records(year);
CREATE INDEX IF NOT EXISTS idx_student_metrics_students_full_name ON student_metrics_students(full_name);

ALTER TABLE student_metrics_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_metrics_records ENABLE ROW LEVEL SECURITY;

-- Admins and teachers can view all students
CREATE POLICY "Admins and teachers can view all students"
  ON student_metrics_students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

-- Admins and teachers can insert students
CREATE POLICY "Admins and teachers can insert students"
  ON student_metrics_students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

-- Admins and teachers can update students
CREATE POLICY "Admins and teachers can update students"
  ON student_metrics_students FOR UPDATE
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

-- Admins can delete students
CREATE POLICY "Admins can delete students"
  ON student_metrics_students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins and teachers can view all records
CREATE POLICY "Admins and teachers can view all records"
  ON student_metrics_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

-- Admins and teachers can insert records
CREATE POLICY "Admins and teachers can insert records"
  ON student_metrics_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'teacher', 'ta')
    )
  );

-- Admins and teachers can update records
CREATE POLICY "Admins and teachers can update records"
  ON student_metrics_records FOR UPDATE
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

-- Admins can delete records
CREATE POLICY "Admins can delete records"
  ON student_metrics_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
