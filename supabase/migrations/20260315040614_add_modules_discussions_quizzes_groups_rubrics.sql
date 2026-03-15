/*
  # Extended LMS Features - Phase 2
  
  ## Overview
  Adds comprehensive LMS features including modules, discussions, quizzes, 
  groups, rubrics, notifications, and file management.

  ## 1. New Tables
  
  ### `modules`
  Course content organization
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `title` (text) - Module title
  - `description` (text) - Module description
  - `position` (integer) - Order in course
  - `published` (boolean) - Visibility status
  - `unlock_at` (timestamptz) - When module becomes available
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `module_items`
  Individual items within modules
  - `id` (uuid) - Primary key
  - `module_id` (uuid, FK) - Parent module
  - `type` (text) - 'assignment', 'page', 'file', 'quiz', 'discussion', 'external_url'
  - `title` (text) - Item title
  - `content` (text) - Rich text content for pages
  - `content_id` (uuid) - Reference to actual content (assignment_id, etc)
  - `url` (text) - For external links or file URLs
  - `position` (integer) - Order in module
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `discussions`
  Course discussion forums
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `title` (text) - Discussion topic
  - `description` (text) - Topic description
  - `type` (text) - 'threaded', 'side_comment'
  - `pinned` (boolean) - Pin to top
  - `locked` (boolean) - Disable replies
  - `created_by` (uuid, FK) - Author
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `discussion_posts`
  Posts and replies in discussions
  - `id` (uuid) - Primary key
  - `discussion_id` (uuid, FK) - Parent discussion
  - `parent_post_id` (uuid, FK) - For threaded replies
  - `author_id` (uuid, FK) - Post author
  - `content` (text) - Post content
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `quizzes`
  Quiz/test management
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `title` (text) - Quiz title
  - `description` (text) - Quiz description
  - `quiz_type` (text) - 'practice', 'graded', 'survey'
  - `time_limit` (integer) - Minutes allowed
  - `points_possible` (integer) - Total points
  - `allowed_attempts` (integer) - Number of tries
  - `shuffle_answers` (boolean) - Randomize answer order
  - `show_correct_answers` (boolean) - Display after submission
  - `due_date` (timestamptz)
  - `status` (text) - 'draft', 'published', 'closed'
  - `created_by` (uuid, FK)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `quiz_questions`
  Questions in quizzes
  - `id` (uuid) - Primary key
  - `quiz_id` (uuid, FK) - Parent quiz
  - `question_text` (text) - The question
  - `question_type` (text) - 'multiple_choice', 'true_false', 'short_answer', 'essay'
  - `points` (integer) - Points for question
  - `position` (integer) - Order in quiz
  - `created_at` (timestamptz)

  ### `quiz_answers`
  Answer choices for questions
  - `id` (uuid) - Primary key
  - `question_id` (uuid, FK) - Parent question
  - `answer_text` (text) - Answer choice
  - `is_correct` (boolean) - Whether this is correct
  - `position` (integer) - Display order
  - `created_at` (timestamptz)

  ### `quiz_attempts`
  Student quiz submissions
  - `id` (uuid) - Primary key
  - `quiz_id` (uuid, FK) - Which quiz
  - `student_id` (uuid, FK) - Which student
  - `attempt_number` (integer) - Which attempt
  - `started_at` (timestamptz) - When started
  - `submitted_at` (timestamptz) - When submitted
  - `score` (numeric) - Points earned
  - `time_spent` (integer) - Seconds taken
  - `status` (text) - 'in_progress', 'submitted', 'graded'

  ### `quiz_responses`
  Individual question responses
  - `id` (uuid) - Primary key
  - `attempt_id` (uuid, FK) - Parent attempt
  - `question_id` (uuid, FK) - Which question
  - `answer_id` (uuid, FK) - Selected answer (for MC/TF)
  - `answer_text` (text) - Written response (for short answer/essay)
  - `points_earned` (numeric) - Points awarded
  - `feedback` (text) - Instructor feedback

  ### `groups`
  Student groups within courses
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `name` (text) - Group name
  - `description` (text) - Group description
  - `max_members` (integer) - Size limit
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `group_members`
  Members of groups
  - `id` (uuid) - Primary key
  - `group_id` (uuid, FK) - Parent group
  - `user_id` (uuid, FK) - Group member
  - `role` (text) - 'leader', 'member'
  - `joined_at` (timestamptz)

  ### `rubrics`
  Grading rubrics
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `title` (text) - Rubric name
  - `description` (text) - Rubric description
  - `points_possible` (integer) - Total points
  - `created_by` (uuid, FK)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `rubric_criteria`
  Criteria rows in rubrics
  - `id` (uuid) - Primary key
  - `rubric_id` (uuid, FK) - Parent rubric
  - `description` (text) - Criterion description
  - `points` (integer) - Points for criterion
  - `position` (integer) - Display order
  - `created_at` (timestamptz)

  ### `rubric_ratings`
  Rating levels for criteria
  - `id` (uuid) - Primary key
  - `criterion_id` (uuid, FK) - Parent criterion
  - `description` (text) - Rating description
  - `points` (integer) - Points for this level
  - `position` (integer) - Display order

  ### `assignment_rubrics`
  Link rubrics to assignments
  - `assignment_id` (uuid, FK) - Which assignment
  - `rubric_id` (uuid, FK) - Which rubric
  - `created_at` (timestamptz)

  ### `notifications`
  User notifications
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK) - Recipient
  - `type` (text) - 'assignment_created', 'grade_posted', 'discussion_reply', etc.
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `link` (text) - URL to related item
  - `read` (boolean) - Read status
  - `created_at` (timestamptz)

  ### `announcements`
  Course announcements
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `title` (text) - Announcement title
  - `content` (text) - Announcement content
  - `posted_by` (uuid, FK) - Author
  - `posted_at` (timestamptz) - When posted
  - `pinned` (boolean) - Pin to top

  ### `course_templates`
  Reusable course templates
  - `id` (uuid) - Primary key
  - `name` (text) - Template name
  - `description` (text) - Template description
  - `source_course_id` (uuid, FK) - Course to copy from
  - `created_by` (uuid, FK)
  - `created_at` (timestamptz)

  ### `assignment_groups`
  Grade category groups
  - `id` (uuid) - Primary key
  - `course_id` (uuid, FK) - Parent course
  - `name` (text) - Category name (e.g., "Homework", "Exams")
  - `weight` (numeric) - Percentage weight (0-100)
  - `position` (integer) - Display order
  - `drop_lowest` (integer) - Number of lowest scores to drop
  - `created_at` (timestamptz)

  ## 2. Security
  All tables have RLS enabled with appropriate policies based on roles and enrollment.
*/

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  published boolean DEFAULT false,
  unlock_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_position ON modules(course_id, position);

-- Module items table
CREATE TABLE IF NOT EXISTS module_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('assignment', 'page', 'file', 'quiz', 'discussion', 'external_url')),
  title text NOT NULL,
  content text DEFAULT '',
  content_id uuid,
  url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_module_items_module_id ON module_items(module_id);
CREATE INDEX IF NOT EXISTS idx_module_items_position ON module_items(module_id, position);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  type text DEFAULT 'threaded' CHECK (type IN ('threaded', 'side_comment')),
  pinned boolean DEFAULT false,
  locked boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);

-- Discussion posts table
CREATE TABLE IF NOT EXISTS discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES discussion_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discussion_posts_discussion_id ON discussion_posts(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_parent_id ON discussion_posts(parent_post_id);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  quiz_type text DEFAULT 'graded' CHECK (quiz_type IN ('practice', 'graded', 'survey')),
  time_limit integer,
  points_possible integer DEFAULT 100,
  allowed_attempts integer DEFAULT 1,
  shuffle_answers boolean DEFAULT false,
  show_correct_answers boolean DEFAULT true,
  due_date timestamptz,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  points integer DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Quiz answers table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_correct boolean DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  score numeric,
  time_spent integer DEFAULT 0,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded'))
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);

-- Quiz responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES quiz_answers(id) ON DELETE SET NULL,
  answer_text text,
  points_earned numeric DEFAULT 0,
  feedback text
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_attempt_id ON quiz_responses(attempt_id);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  max_members integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_groups_course_id ON groups(course_id);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

-- Rubrics table
CREATE TABLE IF NOT EXISTS rubrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  points_possible integer DEFAULT 100,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rubrics_course_id ON rubrics(course_id);

-- Rubric criteria table
CREATE TABLE IF NOT EXISTS rubric_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id uuid NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  description text NOT NULL,
  points integer NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric_id ON rubric_criteria(rubric_id);

-- Rubric ratings table
CREATE TABLE IF NOT EXISTS rubric_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id uuid NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  description text NOT NULL,
  points integer NOT NULL,
  position integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rubric_ratings_criterion_id ON rubric_ratings(criterion_id);

-- Assignment rubrics junction table
CREATE TABLE IF NOT EXISTS assignment_rubrics (
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  rubric_id uuid NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (assignment_id, rubric_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  posted_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  posted_at timestamptz DEFAULT now(),
  pinned boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);

-- Course templates table
CREATE TABLE IF NOT EXISTS course_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  source_course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Assignment groups table
CREATE TABLE IF NOT EXISTS assignment_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight numeric DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  position integer NOT NULL DEFAULT 0,
  drop_lowest integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignment_groups_course_id ON assignment_groups(course_id);

-- Add group_id to assignments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assignments' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE assignments ADD COLUMN group_id uuid REFERENCES assignment_groups(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_assignments_group_id ON assignments(group_id);
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubric_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_groups ENABLE ROW LEVEL SECURITY;

-- Modules policies
CREATE POLICY "Students can view published modules in enrolled courses"
  ON modules FOR SELECT
  TO authenticated
  USING (
    (published = true OR EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = modules.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )) AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = modules.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage modules in their courses"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = modules.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = modules.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Module items policies
CREATE POLICY "Students can view module items in enrolled courses"
  ON module_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN enrollments ON enrollments.course_id = modules.course_id
      WHERE modules.id = module_items.module_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage module items"
  ON module_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN enrollments ON enrollments.course_id = modules.course_id
      WHERE modules.id = module_items.module_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN enrollments ON enrollments.course_id = modules.course_id
      WHERE modules.id = module_items.module_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Discussions policies
CREATE POLICY "Students can view discussions in enrolled courses"
  ON discussions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = discussions.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage discussions"
  ON discussions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = discussions.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = discussions.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Discussion posts policies
CREATE POLICY "Students can view posts in enrolled course discussions"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussions
      JOIN enrollments ON enrollments.course_id = discussions.course_id
      WHERE discussions.id = discussion_posts.discussion_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Students can create posts if not locked"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM discussions
      JOIN enrollments ON enrollments.course_id = discussions.course_id
      WHERE discussions.id = discussion_posts.discussion_id
      AND discussions.locked = false
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Users can update own posts"
  ON discussion_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Quizzes policies (similar to assignments)
CREATE POLICY "Teachers can view quizzes in their courses"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can view published quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = quizzes.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Quiz questions policies
CREATE POLICY "Users can view questions for accessible quizzes"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
      AND (quizzes.status = 'published' OR enrollments.role IN ('teacher', 'ta', 'admin'))
    )
  );

CREATE POLICY "Teachers can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_questions.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Quiz answers policies
CREATE POLICY "Users can view answers for accessible questions"
  ON quiz_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = quiz_answers.question_id
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage quiz answers"
  ON quiz_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = quiz_answers.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_questions
      JOIN quizzes ON quizzes.id = quiz_questions.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_questions.id = quiz_answers.question_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Quiz attempts policies
CREATE POLICY "Students can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view all attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can create own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Quiz responses policies
CREATE POLICY "Students can view own responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view all responses"
  ON quiz_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
      JOIN enrollments ON enrollments.course_id = quizzes.course_id
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'ta', 'admin')
    )
  );

CREATE POLICY "Students can manage own responses"
  ON quiz_responses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = quiz_responses.attempt_id
      AND quiz_attempts.student_id = auth.uid()
    )
  );

-- Groups policies
CREATE POLICY "Students can view groups in enrolled courses"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage groups"
  ON groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Group members policies
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      JOIN enrollments ON enrollments.course_id = groups.course_id
      WHERE groups.id = group_members.group_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers and group leaders can manage members"
  ON group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      JOIN enrollments ON enrollments.course_id = groups.course_id
      WHERE groups.id = group_members.group_id
      AND (enrollments.user_id = auth.uid() AND enrollments.role IN ('teacher', 'admin')
        OR EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = group_members.group_id
          AND gm.user_id = auth.uid()
          AND gm.role = 'leader'
        ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      JOIN enrollments ON enrollments.course_id = groups.course_id
      WHERE groups.id = group_members.group_id
      AND (enrollments.user_id = auth.uid() AND enrollments.role IN ('teacher', 'admin')
        OR EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = group_members.group_id
          AND gm.user_id = auth.uid()
          AND gm.role = 'leader'
        ))
    )
  );

-- Rubrics policies
CREATE POLICY "Students can view rubrics in enrolled courses"
  ON rubrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = rubrics.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage rubrics"
  ON rubrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = rubrics.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = rubrics.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Rubric criteria policies
CREATE POLICY "Users can view criteria for accessible rubrics"
  ON rubric_criteria FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage criteria"
  ON rubric_criteria FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubrics
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubrics.id = rubric_criteria.rubric_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Rubric ratings policies
CREATE POLICY "Users can view ratings for accessible criteria"
  ON rubric_ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubric_criteria
      JOIN rubrics ON rubrics.id = rubric_criteria.rubric_id
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubric_criteria.id = rubric_ratings.criterion_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage ratings"
  ON rubric_ratings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rubric_criteria
      JOIN rubrics ON rubrics.id = rubric_criteria.rubric_id
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubric_criteria.id = rubric_ratings.criterion_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rubric_criteria
      JOIN rubrics ON rubrics.id = rubric_criteria.rubric_id
      JOIN enrollments ON enrollments.course_id = rubrics.course_id
      WHERE rubric_criteria.id = rubric_ratings.criterion_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Assignment rubrics policies
CREATE POLICY "Users can view assignment rubrics"
  ON assignment_rubrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = assignment_rubrics.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage assignment rubrics"
  ON assignment_rubrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = assignment_rubrics.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN enrollments ON enrollments.course_id = assignments.course_id
      WHERE assignments.id = assignment_rubrics.assignment_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Announcements policies
CREATE POLICY "Students can view announcements in enrolled courses"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = announcements.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = announcements.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = announcements.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Course templates policies
CREATE POLICY "Teachers can view all templates"
  ON course_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can manage own templates"
  ON course_templates FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Assignment groups policies
CREATE POLICY "Students can view assignment groups in enrolled courses"
  ON assignment_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignment_groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.status = 'active'
    )
  );

CREATE POLICY "Teachers can manage assignment groups"
  ON assignment_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignment_groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.course_id = assignment_groups.course_id
      AND enrollments.user_id = auth.uid()
      AND enrollments.role IN ('teacher', 'admin')
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_items_updated_at
  BEFORE UPDATE ON module_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_posts_updated_at
  BEFORE UPDATE ON discussion_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rubrics_updated_at
  BEFORE UPDATE ON rubrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();