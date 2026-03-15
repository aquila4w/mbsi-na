/*
  # Canvas LMS Foundation Schema - Phase 1
  
  ## Overview
  Creates the foundational database schema for a Canvas-like LMS platform supporting
  one institution with role-based access control, course management, and enrollment system.

  ## 1. New Tables
  
  ### `profiles`
  Extends Supabase auth.users with additional user information
  - `id` (uuid, FK to auth.users) - Primary key, references authenticated user
  - `email` (text) - User email (denormalized for quick access)
  - `full_name` (text) - User's full name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `role` (text) - Base role: 'admin', 'teacher', 'student', 'ta', 'designer', 'observer'
  - `bio` (text, nullable) - User biography
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### `courses`
  Core course information
  - `id` (uuid) - Primary key
  - `code` (text) - Course code (e.g., "CS101")
  - `name` (text) - Course name
  - `description` (text, nullable) - Course description
  - `term` (text) - Academic term (e.g., "Fall 2024")
  - `status` (text) - 'draft', 'published', 'archived'
  - `created_by` (uuid, FK to profiles) - Teacher who created the course
  - `created_at` (timestamptz) - Course creation timestamp
  - `updated_at` (timestamptz) - Last course update timestamp
  - `start_date` (date, nullable) - Course start date
  - `end_date` (date, nullable) - Course end date

  ### `enrollments`
  Links users to courses with specific roles
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - Enrolled user
  - `course_id` (uuid, FK to courses) - Course
  - `role` (text) - Course-specific role: 'teacher', 'student', 'ta', 'designer', 'observer'
  - `status` (text) - 'active', 'completed', 'dropped'
  - `enrolled_at` (timestamptz) - Enrollment timestamp
  - `completed_at` (timestamptz, nullable) - Course completion timestamp

  ### `observer_links`
  Links observers (parents/mentors) to students they can monitor
  - `id` (uuid) - Primary key
  - `observer_id` (uuid, FK to profiles) - Observer user
  - `student_id` (uuid, FK to profiles) - Student being observed
  - `created_at` (timestamptz) - Link creation timestamp

  ## 2. Security (Row Level Security)
  
  All tables have RLS enabled with restrictive policies:
  
  ### Profiles
  - Users can view all profiles (for course rosters)
  - Users can only update their own profile
  - Admins can manage all profiles via service role
  
  ### Courses
  - Published courses visible to all authenticated users
  - Draft courses visible only to creator and admins
  - Only course creator, enrolled teachers, and admins can update
  - Only creator and admins can delete
  
  ### Enrollments
  - Users can view enrollments for courses they're enrolled in
  - Teachers can create enrollments for their courses
  - Users can update their own enrollment status (drop courses)
  - Teachers and admins can manage enrollments
  
  ### Observer Links
  - Observers can view their own links
  - Students can view who observes them
  - Only admins and the observer can create links
  
  ## 3. Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for join optimization
  
  ## 4. Important Notes
  - Uses Supabase Auth for authentication (auth.users table)
  - All timestamps in UTC
  - Cascading deletes configured for data integrity
  - Role validation via CHECK constraints
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'ta', 'designer', 'observer')),
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  term text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  start_date date,
  end_date date
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('teacher', 'student', 'ta', 'designer', 'observer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, course_id)
);

-- Create observer_links table
CREATE TABLE IF NOT EXISTS observer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(observer_id, student_id),
  CHECK (observer_id != student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_term ON courses(term);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_observer_links_observer_id ON observer_links(observer_id);
CREATE INDEX IF NOT EXISTS idx_observer_links_student_id ON observer_links(student_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE observer_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers and admins can create courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Course creators and admins can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE course_id = courses.id 
      AND user_id = auth.uid() 
      AND role = 'teacher'
    )
  )
  WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE course_id = courses.id 
      AND user_id = auth.uid() 
      AND role = 'teacher'
    )
  );

CREATE POLICY "Course creators and admins can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view enrollments for their courses"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM enrollments e2
      WHERE e2.course_id = enrollments.course_id
      AND e2.user_id = auth.uid()
      AND e2.role IN ('teacher', 'ta')
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can create enrollments for their courses"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = enrollments.course_id
      AND e.user_id = auth.uid()
      AND e.role = 'teacher'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own enrollment"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = enrollments.course_id
      AND e.user_id = auth.uid()
      AND e.role = 'teacher'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = enrollments.course_id
      AND e.user_id = auth.uid()
      AND e.role = 'teacher'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers and admins can delete enrollments"
  ON enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.course_id = enrollments.course_id
      AND e.user_id = auth.uid()
      AND e.role = 'teacher'
    ) OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Observer links policies
CREATE POLICY "Observers can view own links"
  ON observer_links FOR SELECT
  TO authenticated
  USING (
    observer_id = auth.uid() OR
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins and observers can create links"
  ON observer_links FOR INSERT
  TO authenticated
  WITH CHECK (
    observer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins and observers can delete links"
  ON observer_links FOR DELETE
  TO authenticated
  USING (
    observer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();