/*
  # Add Assignments and Submissions

  1. New Tables
    - `assignments`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `points_possible` (integer)
      - `status` (text: draft, published, closed)
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `submissions`
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, foreign key to assignments)
      - `student_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `file_url` (text, optional)
      - `submitted_at` (timestamptz)
      - `grade` (numeric, optional)
      - `feedback` (text, optional)
      - `graded_at` (timestamptz, optional)
      - `graded_by` (uuid, foreign key to profiles, optional)
      - `status` (text: draft, submitted, graded)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Assignments:
      - Teachers can create, read, update, delete their course assignments
      - Students can read published assignments for enrolled courses
    - Submissions:
      - Students can create and read their own submissions
      - Teachers can read and grade submissions for their courses
*/

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  due_date timestamptz,
  points_possible integer DEFAULT 100,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text DEFAULT '',
  file_url text,
  submitted_at timestamptz,
  grade numeric,
  feedback text,
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'graded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Teachers can view assignments for their courses"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can view published assignments for enrolled courses"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can create assignments for their courses"
  ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update their course assignments"
  ON assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can delete their course assignments"
  ON assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignments.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Submissions policies
CREATE POLICY "Students can view their own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their course assignments"
  ON submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = submissions.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can create their own submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own submissions"
  ON submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can update submissions for grading"
  ON submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = submissions.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = submissions.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );
