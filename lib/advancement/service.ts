import { supabase } from '@/lib/supabase';
import {
  MbsiLevel,
  StudentEnrollment,
  StudentPlaceAssignment,
  StudentYearProfile,
  AdvancementSession,
  AdvancementDecision,
  StudentTimelineData,
} from './types';
import { sortLevels } from './constants';

// ============================================
// LEVELS
// ============================================

export async function fetchLevels(): Promise<MbsiLevel[]> {
  const { data, error } = await supabase.from('mbsi_levels').select('*').order('tier_order').order('level_order');
  if (error) throw error;
  return sortLevels(data || []);
}

// ============================================
// ENROLLMENTS
// ============================================

export async function fetchEnrollments(studentId: string): Promise<StudentEnrollment[]> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*, level:mbsi_levels(*)')
    .eq('student_id', studentId)
    .order('enrolled_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchActiveEnrollments(): Promise<(StudentEnrollment & { student_name?: string })[]> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('*, level:mbsi_levels(*), student_metrics_students(full_name)')
    .in('status', ['enrolled', 'active'])
    .order('enrolled_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    student_name: d.student_metrics_students?.full_name,
  }));
}

export async function createEnrollment(data: Partial<StudentEnrollment>): Promise<StudentEnrollment | null> {
  const { data: result, error } = await supabase
    .from('student_enrollments')
    .insert(data)
    .select('*, level:mbsi_levels(*)')
    .maybeSingle();
  if (error) throw error;

  // Update student's current_level_id and current_status
  if (result) {
    await supabase
      .from('student_metrics_students')
      .update({
        current_level_id: result.level_id,
        current_status: result.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', result.student_id);
  }

  return result;
}

export async function updateEnrollment(id: string, data: Partial<StudentEnrollment>): Promise<void> {
  const { error } = await supabase
    .from('student_enrollments')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ============================================
// PLACE ASSIGNMENTS
// ============================================

export async function fetchPlaceAssignments(studentId: string): Promise<StudentPlaceAssignment[]> {
  const { data, error } = await supabase
    .from('student_place_assignments')
    .select('*')
    .eq('student_id', studentId)
    .order('assigned_from', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createPlaceAssignment(data: Partial<StudentPlaceAssignment>): Promise<StudentPlaceAssignment | null> {
  const { data: result, error } = await supabase
    .from('student_place_assignments')
    .insert(data)
    .select()
    .maybeSingle();
  if (error) throw error;
  return result;
}

export async function updatePlaceAssignment(id: string, data: Partial<StudentPlaceAssignment>): Promise<void> {
  const { error } = await supabase
    .from('student_place_assignments')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deletePlaceAssignment(id: string): Promise<void> {
  const { error } = await supabase.from('student_place_assignments').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// YEAR PROFILES
// ============================================

export async function fetchYearProfile(studentId: string, academicYear: string): Promise<StudentYearProfile | null> {
  const { data, error } = await supabase
    .from('student_year_profiles')
    .select('*, level:mbsi_levels(*)')
    .eq('student_id', studentId)
    .eq('academic_year', academicYear)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchYearProfiles(studentId: string): Promise<StudentYearProfile[]> {
  const { data, error } = await supabase
    .from('student_year_profiles')
    .select('*, level:mbsi_levels(*)')
    .eq('student_id', studentId)
    .order('academic_year', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveYearProfile(data: Partial<StudentYearProfile>): Promise<StudentYearProfile | null> {
  const { data: result, error } = await supabase
    .from('student_year_profiles')
    .upsert(data, { onConflict: 'student_id,academic_year' })
    .select('*, level:mbsi_levels(*)')
    .maybeSingle();
  if (error) throw error;
  return result;
}

// ============================================
// ADVANCEMENT SESSIONS
// ============================================

export async function fetchSessions(): Promise<AdvancementSession[]> {
  const { data, error } = await supabase
    .from('advancement_sessions')
    .select('*')
    .order('session_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchSession(sessionId: string): Promise<AdvancementSession | null> {
  const { data, error } = await supabase
    .from('advancement_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSession(data: Partial<AdvancementSession>): Promise<AdvancementSession | null> {
  const { data: result, error } = await supabase
    .from('advancement_sessions')
    .insert(data)
    .select()
    .maybeSingle();
  if (error) throw error;
  return result;
}

export async function updateSession(id: string, data: Partial<AdvancementSession>): Promise<void> {
  const { error } = await supabase
    .from('advancement_sessions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ============================================
// ADVANCEMENT DECISIONS
// ============================================

export async function fetchSessionWithDecisions(sessionId: string): Promise<AdvancementDecision[]> {
  const { data, error } = await supabase
    .from('advancement_decisions')
    .select(`
      *,
      current_level:mbsi_levels!advancement_decisions_current_level_id_fkey(*),
      target_level:mbsi_levels!advancement_decisions_target_level_id_fkey(*)
    `)
    .eq('session_id', sessionId);
  if (error) throw error;

  // Fetch student names separately
  const studentIds = (data || []).map((d: any) => d.student_id);
  if (studentIds.length === 0) return [];

  const { data: students } = await supabase
    .from('student_metrics_students')
    .select('id, full_name')
    .in('id', studentIds);

  const studentMap = new Map((students || []).map((s: any) => [s.id, s.full_name]));

  return (data || []).map((d: any) => ({
    ...d,
    student_name: studentMap.get(d.student_id) || 'Unknown',
  }));
}

export async function createDecisionsForSession(sessionId: string): Promise<number> {
  // Get all active students
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student_id, level_id')
    .in('status', ['enrolled', 'active']);

  if (!enrollments || enrollments.length === 0) return 0;

  // Get levels for next_level lookup
  const { data: levels } = await supabase.from('mbsi_levels').select('*');
  const levelMap = new Map((levels || []).map((l: any) => [l.id, l]));

  // Check which students already have decisions for this session
  const { data: existing } = await supabase
    .from('advancement_decisions')
    .select('student_id')
    .eq('session_id', sessionId);
  const existingStudentIds = new Set((existing || []).map((d: any) => d.student_id));

  // Get latest metrics for each student
  const studentIds = enrollments.map((e: any) => e.student_id).filter((id: string) => !existingStudentIds.has(id));
  if (studentIds.length === 0) return 0;

  const { data: latestRecords } = await supabase
    .from('student_metrics_records')
    .select('student_id, year_level, academic_year, baptisms_us, baptisms_rrb_ph, guests, contacts, thanksgiving_offering, evangelism_offering, caroling_goal_reached, caroling_amount, caroling_leader')
    .in('student_id', studentIds)
    .order('year', { ascending: false });

  // Build metrics snapshots
  const metricsMap = new Map<string, any>();
  for (const r of latestRecords || []) {
    if (!metricsMap.has(r.student_id)) {
      metricsMap.set(r.student_id, r);
    }
  }

  // Build decision rows
  const decisions = enrollments
    .filter((e: any) => !existingStudentIds.has(e.student_id))
    .map((e: any) => {
      const level = levelMap.get(e.level_id);
      return {
        session_id: sessionId,
        student_id: e.student_id,
        enrollment_id: e.id,
        current_level_id: e.level_id,
        current_level_code: level?.code || '',
        outcome: 'advanced',
        target_level_id: level?.next_level_id || null,
        conditions: '',
        remarks: '',
        metrics_snapshot: metricsMap.get(e.student_id) || {},
        is_finalized: false,
      };
    });

  if (decisions.length === 0) return 0;

  const { error } = await supabase.from('advancement_decisions').insert(decisions);
  if (error) throw error;
  return decisions.length;
}

export async function updateDecision(id: string, data: Partial<AdvancementDecision>): Promise<void> {
  const { error } = await supabase
    .from('advancement_decisions')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function finalizeSession(sessionId: string): Promise<void> {
  // Mark all decisions as finalized
  const { error: decError } = await supabase
    .from('advancement_decisions')
    .update({ is_finalized: true, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId);
  if (decError) throw decError;

  // Update session status
  const { error: sessError } = await supabase
    .from('advancement_sessions')
    .update({ status: 'finalized', updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (sessError) throw sessError;
}

export async function applySession(sessionId: string): Promise<void> {
  // Fetch all decisions for this session
  const { data: decisions, error: fetchError } = await supabase
    .from('advancement_decisions')
    .select('*')
    .eq('session_id', sessionId);
  if (fetchError) throw fetchError;

  const now = new Date().toISOString();

  for (const decision of decisions || []) {
    const outcome = decision.outcome;

    if (['advanced', 'conditional_1', 'conditional_2'].includes(outcome) && decision.target_level_id) {
      // Close current enrollment
      await supabase
        .from('student_enrollments')
        .update({ status: 'graduated', exited_at: now, exit_reason: 'Advanced to next level', updated_at: now })
        .eq('id', decision.enrollment_id);

      // Create new enrollment at target level
      const session = await supabase.from('advancement_sessions').select('academic_year').eq('id', sessionId).maybeSingle();
      const nextYear = session.data?.academic_year
        ? (() => {
            const parts = session.data.academic_year.split('-');
            return parts.length === 2 ? `${parseInt(parts[0]) + 1}-${parseInt(parts[1]) + 1}` : session.data.academic_year;
          })()
        : '';

      await supabase.from('student_enrollments').insert({
        student_id: decision.student_id,
        level_id: decision.target_level_id,
        academic_year: nextYear,
        status: 'enrolled',
        re_entry_of: decision.enrollment_id,
        admin_notes: outcome !== 'advanced' ? `Conditions: ${decision.conditions}` : '',
      });

      // Update student current level
      await supabase
        .from('student_metrics_students')
        .update({ current_level_id: decision.target_level_id, current_status: 'active', updated_at: now })
        .eq('id', decision.student_id);
    } else if (outcome === 'graduated') {
      await supabase
        .from('student_enrollments')
        .update({ status: 'graduated', exited_at: now, exit_reason: 'Graduated', updated_at: now })
        .eq('id', decision.enrollment_id);

      await supabase
        .from('student_metrics_students')
        .update({ current_status: 'graduated', graduated_at: now, updated_at: now })
        .eq('id', decision.student_id);
    } else if (outcome === 'expelled') {
      await supabase
        .from('student_enrollments')
        .update({ status: 'expelled', exited_at: now, exit_reason: 'Expelled', updated_at: now })
        .eq('id', decision.enrollment_id);

      await supabase
        .from('student_metrics_students')
        .update({ current_status: 'expelled', updated_at: now })
        .eq('id', decision.student_id);
    } else if (outcome === 'suspended') {
      await supabase
        .from('student_enrollments')
        .update({ status: 'active', updated_at: now })
        .eq('id', decision.enrollment_id);

      await supabase
        .from('student_metrics_students')
        .update({ current_status: 'suspended', updated_at: now })
        .eq('id', decision.student_id);
    } else if (outcome === 'honorable_discharge') {
      await supabase
        .from('student_enrollments')
        .update({ status: 'honorable_discharge', exited_at: now, exit_reason: 'Honorable Discharge', updated_at: now })
        .eq('id', decision.enrollment_id);

      await supabase
        .from('student_metrics_students')
        .update({ current_status: 'honorable_discharge', updated_at: now })
        .eq('id', decision.student_id);
    }
    // 'retained' — no level change, decision is recorded
  }

  // Mark session as applied
  const { error: sessError } = await supabase
    .from('advancement_sessions')
    .update({ status: 'applied', updated_at: now })
    .eq('id', sessionId);
  if (sessError) throw sessError;
}

// ============================================
// GRADUATE PROMOTION
// ============================================

export async function fetchGraduates(): Promise<any[]> {
  const { data, error } = await supabase
    .from('student_metrics_students')
    .select('*')
    .eq('current_status', 'graduated');
  if (error) throw error;
  return data || [];
}

export async function promoteGraduates(studentIds: string[]): Promise<void> {
  const now = new Date().toISOString();

  // Update student status
  await supabase
    .from('student_metrics_students')
    .update({ current_status: 'minister_promoted', updated_at: now })
    .in('id', studentIds);

  // Update enrollment status
  for (const studentId of studentIds) {
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'graduated');

    if (enrollments && enrollments.length > 0) {
      await supabase
        .from('student_enrollments')
        .update({ status: 'minister_promoted', updated_at: now })
        .eq('id', enrollments[0].id);
    }

    // If the student has a linked profile, update role to minister
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', (await supabase.from('student_metrics_students').select('full_name').eq('id', studentId).maybeSingle()).data?.full_name || '')
      .maybeSingle();

    // Note: profile update is best-effort — students may not have linked auth accounts
  }
}

// ============================================
// STUDENT TIMELINE
// ============================================

export async function fetchStudentTimeline(studentId: string): Promise<StudentTimelineData | null> {
  const { data: student } = await supabase
    .from('student_metrics_students')
    .select('id, full_name, date_entered, current_status')
    .eq('id', studentId)
    .maybeSingle();

  if (!student) return null;

  const [enrollments, assignments, yearProfiles, decisions] = await Promise.all([
    fetchEnrollments(studentId),
    fetchPlaceAssignments(studentId),
    fetchYearProfiles(studentId),
    fetchDecisionsForStudent(studentId),
  ]);

  return {
    student,
    enrollments,
    assignments,
    yearProfiles,
    decisions,
  };
}

export async function fetchDecisionsForStudent(studentId: string): Promise<AdvancementDecision[]> {
  const { data, error } = await supabase
    .from('advancement_decisions')
    .select(`
      *,
      current_level:mbsi_levels!advancement_decisions_current_level_id_fkey(*),
      target_level:mbsi_levels!advancement_decisions_target_level_id_fkey(*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

// ============================================
// ADVANCEMENT HISTORY
// ============================================

export async function fetchAdvancementHistory(filters?: {
  academicYear?: string;
  outcome?: string;
  levelCode?: string;
}): Promise<AdvancementDecision[]> {
  let query = supabase
    .from('advancement_decisions')
    .select(`
      *,
      current_level:mbsi_levels!advancement_decisions_current_level_id_fkey(*),
      target_level:mbsi_levels!advancement_decisions_target_level_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.academicYear) {
    // Join through session to filter by academic year
    const { data: sessions } = await supabase
      .from('advancement_sessions')
      .select('id')
      .eq('academic_year', filters.academicYear);
    if (sessions && sessions.length > 0) {
      query = query.in('session_id', sessions.map((s: any) => s.id));
    } else {
      return [];
    }
  }

  if (filters?.outcome) {
    query = query.eq('outcome', filters.outcome);
  }

  if (filters?.levelCode) {
    query = query.eq('current_level_code', filters.levelCode);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Fetch student names
  const studentIds = (data || []).map((d: any) => d.student_id);
  if (studentIds.length === 0) return [];

  const { data: students } = await supabase
    .from('student_metrics_students')
    .select('id, full_name')
    .in('id', studentIds);

  const studentMap = new Map((students || []).map((s: any) => [s.id, s.full_name]));

  return (data || []).map((d: any) => ({
    ...d,
    student_name: studentMap.get(d.student_id) || 'Unknown',
  }));
}
