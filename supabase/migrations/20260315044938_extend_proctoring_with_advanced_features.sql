/*
  # Extend Proctoring with Advanced Features

  1. Extend existing proctoring_sessions table with new columns
  2. Create new tables for environment checks, audio transcripts, and gaze tracking
  3. Add indexes and RLS policies
*/

-- Extend proctoring_sessions table with new columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'student_id') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN student_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'environment_check_passed') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN environment_check_passed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'room_scan_video_url') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN room_scan_video_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'device_count') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN device_count integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'screen_count') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN screen_count integer DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'webcam_enabled') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN webcam_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'microphone_enabled') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN microphone_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'face_detection_active') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN face_detection_active boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'audio_monitoring_active') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN audio_monitoring_active boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN started_at timestamptz DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'ended_at') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN ended_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'risk_score') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN risk_score numeric(5,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'ai_summary') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN ai_summary text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_sessions' AND column_name = 'flagged_for_review') THEN
    ALTER TABLE proctoring_sessions ADD COLUMN flagged_for_review boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_student ON proctoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_flagged ON proctoring_sessions(flagged_for_review) WHERE flagged_for_review = true;

-- Environment Checks Table
CREATE TABLE IF NOT EXISTS environment_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  
  room_scan_completed boolean DEFAULT false,
  room_scan_video_url text,
  
  mobile_phone_detected boolean DEFAULT false,
  second_monitor_detected boolean DEFAULT false,
  unauthorized_devices_count integer DEFAULT 0,
  
  id_verified boolean DEFAULT false,
  id_photo_url text,
  face_match_confidence numeric(5,2),
  
  desk_clear boolean DEFAULT false,
  desk_photo_url text,
  
  check_passed boolean DEFAULT false,
  check_failed_reason text,
  
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Audio Transcripts Table
CREATE TABLE IF NOT EXISTS audio_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proctoring_session_id uuid REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  
  transcript_text text NOT NULL,
  detected_language text DEFAULT 'en',
  
  contains_suspicious_keywords boolean DEFAULT false,
  flagged_keywords text[],
  speaker_count integer DEFAULT 1,
  
  audio_start_time timestamptz NOT NULL,
  audio_end_time timestamptz NOT NULL,
  duration_seconds integer,
  confidence_score numeric(5,2),
  
  created_at timestamptz DEFAULT now()
);

-- Gaze Tracking Logs Table
CREATE TABLE IF NOT EXISTS gaze_tracking_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proctoring_session_id uuid REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  
  gaze_x numeric(8,4),
  gaze_y numeric(8,4),
  
  head_yaw numeric(8,4),
  head_pitch numeric(8,4),
  head_roll numeric(8,4),
  
  face_detected boolean DEFAULT true,
  face_count integer DEFAULT 1,
  looking_at_screen boolean DEFAULT true,
  
  deviation_from_center numeric(8,4),
  sustained_look_away_seconds integer DEFAULT 0,
  
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_environment_checks_attempt ON environment_checks(attempt_id);
CREATE INDEX IF NOT EXISTS idx_environment_checks_student ON environment_checks(student_id);

CREATE INDEX IF NOT EXISTS idx_audio_transcripts_session ON audio_transcripts(proctoring_session_id);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_attempt ON audio_transcripts(attempt_id);
CREATE INDEX IF NOT EXISTS idx_audio_transcripts_suspicious ON audio_transcripts(contains_suspicious_keywords) WHERE contains_suspicious_keywords = true;

CREATE INDEX IF NOT EXISTS idx_gaze_tracking_session ON gaze_tracking_logs(proctoring_session_id);
CREATE INDEX IF NOT EXISTS idx_gaze_tracking_attempt ON gaze_tracking_logs(attempt_id);
CREATE INDEX IF NOT EXISTS idx_gaze_tracking_time ON gaze_tracking_logs(timestamp);

-- Enable RLS on new tables
ALTER TABLE environment_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaze_tracking_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for environment_checks
CREATE POLICY "Students can view own environment checks"
  ON environment_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = environment_checks.student_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view all environment checks"
  ON environment_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE qa.id = environment_checks.attempt_id
      AND e.user_id = auth.uid()
      AND e.role IN ('instructor', 'ta')
    )
  );

CREATE POLICY "Students can insert own environment checks"
  ON environment_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = environment_checks.student_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Students can update own environment checks"
  ON environment_checks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = environment_checks.student_id
      AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = environment_checks.student_id
      AND profiles.id = auth.uid()
    )
  );

-- RLS Policies for audio_transcripts
CREATE POLICY "Students can view own audio transcripts"
  ON audio_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      JOIN profiles p ON ps.student_id = p.id
      WHERE ps.id = audio_transcripts.proctoring_session_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view all audio transcripts"
  ON audio_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE qa.id = audio_transcripts.attempt_id
      AND e.user_id = auth.uid()
      AND e.role IN ('instructor', 'ta')
    )
  );

CREATE POLICY "Students can insert own audio transcripts"
  ON audio_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      JOIN profiles p ON ps.student_id = p.id
      WHERE ps.id = audio_transcripts.proctoring_session_id
      AND p.id = auth.uid()
    )
  );

-- RLS Policies for gaze_tracking_logs
CREATE POLICY "Students can view own gaze tracking logs"
  ON gaze_tracking_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      JOIN profiles p ON ps.student_id = p.id
      WHERE ps.id = gaze_tracking_logs.proctoring_session_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view all gaze tracking logs"
  ON gaze_tracking_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE qa.id = gaze_tracking_logs.attempt_id
      AND e.user_id = auth.uid()
      AND e.role IN ('instructor', 'ta')
    )
  );

CREATE POLICY "Students can insert own gaze tracking logs"
  ON gaze_tracking_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      JOIN profiles p ON ps.student_id = p.id
      WHERE ps.id = gaze_tracking_logs.proctoring_session_id
      AND p.id = auth.uid()
    )
  );