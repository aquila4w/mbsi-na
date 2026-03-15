import { supabase } from '@/lib/supabase';
import { StudentMetricsStudent, StudentMetricsRecord, StudentWithRecords, computeTotals } from './types';

export async function fetchAllStudentsWithRecords(): Promise<StudentWithRecords[]> {
  const [{ data: students }, { data: records }] = await Promise.all([
    supabase.from('student_metrics_students').select('*').order('full_name'),
    supabase.from('student_metrics_records').select('*').order('year', { ascending: true }),
  ]);

  if (!students) return [];

  return students.map((s: StudentMetricsStudent) => {
    const studentRecords = (records || []).filter((r: StudentMetricsRecord) => r.student_id === s.id);
    return { ...s, records: studentRecords, totals: computeTotals(studentRecords) };
  });
}

export async function fetchStudentWithRecords(studentId: string): Promise<StudentWithRecords | null> {
  const [{ data: student }, { data: records }] = await Promise.all([
    supabase.from('student_metrics_students').select('*').eq('id', studentId).maybeSingle(),
    supabase.from('student_metrics_records').select('*').eq('student_id', studentId).order('year', { ascending: true }),
  ]);

  if (!student) return null;
  const studentRecords = records || [];
  return { ...student, records: studentRecords, totals: computeTotals(studentRecords) };
}

export async function createStudent(data: Partial<StudentMetricsStudent>): Promise<StudentMetricsStudent | null> {
  const { data: result, error } = await supabase
    .from('student_metrics_students')
    .insert(data)
    .select()
    .maybeSingle();
  if (error) throw error;
  return result;
}

export async function updateStudent(id: string, data: Partial<StudentMetricsStudent>): Promise<void> {
  const { error } = await supabase
    .from('student_metrics_students')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('student_metrics_students').delete().eq('id', id);
  if (error) throw error;
}

export async function createRecord(data: Partial<StudentMetricsRecord>): Promise<StudentMetricsRecord | null> {
  const { data: result, error } = await supabase
    .from('student_metrics_records')
    .insert(data)
    .select()
    .maybeSingle();
  if (error) throw error;
  return result;
}

export async function updateRecord(id: string, data: Partial<StudentMetricsRecord>): Promise<void> {
  const { error } = await supabase
    .from('student_metrics_records')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase.from('student_metrics_records').delete().eq('id', id);
  if (error) throw error;
}
