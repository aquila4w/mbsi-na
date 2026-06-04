export interface MbsiLevel {
  id: string;
  code: string;
  display_name: string;
  tier: 'amp_internship' | 'probationary' | 'mbsi' | 'terminal';
  tier_order: number;
  level_order: number;
  next_level_id: string | null;
  is_terminal: boolean;
  created_at: string;
}

export type EnrollmentStatus =
  | 'enrolled'
  | 'active'
  | 'on_leave'
  | 'quit'
  | 'graduated'
  | 'expelled'
  | 'honorable_discharge'
  | 'minister_promoted';

export interface StudentEnrollment {
  id: string;
  student_id: string;
  level_id: string;
  academic_year: string;
  enrolled_at: string | null;
  status: EnrollmentStatus;
  exited_at: string | null;
  exit_reason: string;
  re_entry_of: string | null;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  // Joined
  level?: MbsiLevel;
}

export interface StudentPlaceAssignment {
  id: string;
  student_id: string;
  enrollment_id: string | null;
  location: string;
  ministry_role: string;
  supervisor_name: string;
  notes: string;
  assigned_from: string;
  assigned_until: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentYearProfile {
  id: string;
  student_id: string;
  enrollment_id: string | null;
  level_id: string | null;
  academic_year: string;
  academics: string;
  spirituality: string;
  jobspec_ministries: string;
  ministerial_proficiency: string;
  character_summary: string;
  achievements_ranking: string;
  faculty_recommendation: string;
  faculty_remarks: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  level?: MbsiLevel;
}

export type AdvancementOutcome =
  | 'advanced'
  | 'conditional_1'
  | 'conditional_2'
  | 'retained'
  | 'suspended'
  | 'expelled'
  | 'honorable_discharge'
  | 'graduated';

export type SessionStatus = 'draft' | 'in_review' | 'finalized' | 'applied';

export interface AdvancementSession {
  id: string;
  academic_year: string;
  session_date: string;
  status: SessionStatus;
  title: string;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvancementDecision {
  id: string;
  session_id: string;
  student_id: string;
  enrollment_id: string | null;
  current_level_id: string | null;
  current_level_code: string;
  outcome: AdvancementOutcome;
  target_level_id: string | null;
  conditions: string;
  remarks: string;
  metrics_snapshot: Record<string, any>;
  is_finalized: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  student_name?: string;
  current_level?: MbsiLevel;
  target_level?: MbsiLevel;
}

export interface StudentTimelineData {
  student: {
    id: string;
    full_name: string;
    date_entered: string | null;
    current_status: string;
  };
  enrollments: (StudentEnrollment & { level?: MbsiLevel })[];
  assignments: StudentPlaceAssignment[];
  yearProfiles: (StudentYearProfile & { level?: MbsiLevel })[];
  decisions: (AdvancementDecision & { session?: AdvancementSession })[];
}
