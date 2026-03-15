'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface GradeExportProps {
  courseId: string;
  courseName: string;
}

export function GradeExport({ courseId, courseName }: GradeExportProps) {
  const [loading, setLoading] = useState(false);

  const exportToCSV = async () => {
    setLoading(true);
    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          user_id,
          profiles(full_name, email)
        `)
        .eq('course_id', courseId)
        .eq('role', 'student');

      if (enrollError) throw enrollError;

      const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('id, title, points_possible')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

      if (assignError) throw assignError;

      const assignmentList = (assignments || []) as any[];
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('student_id, assignment_id, grade, status')
        .in('assignment_id', assignmentList.map((a: any) => a.id));

      if (subError) throw subError;

      const csvHeaders = [
        'Student Name',
        'Email',
        ...assignmentList.map((a: any) => `${a.title} (${a.points_possible} pts)`),
        'Total Points',
        'Percentage',
        'Letter Grade'
      ];

      const submissionList = (submissions || []) as any[];
      const rows = enrollments?.map(enrollment => {
        const student = enrollment as any;
        const studentGrades = assignmentList.map((assignment: any) => {
          const submission = submissionList.find(
            (s: any) => s.student_id === student.user_id && s.assignment_id === assignment.id
          );
          return submission?.grade ?? '';
        });

        const totalEarned = studentGrades.reduce((sum, grade) => {
          return sum + (typeof grade === 'number' ? grade : 0);
        }, 0);

        const totalPossible = assignmentList.reduce((sum: number, a: any) => sum + a.points_possible, 0);
        const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
        const letterGrade = getLetterGrade(percentage);

        return [
          student.profiles.full_name,
          student.profiles.email,
          ...studentGrades,
          totalEarned.toFixed(1),
          percentage.toFixed(1) + '%',
          letterGrade
        ];
      }) || [];

      const csvContent = [
        csvHeaders.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${courseName.replace(/\s+/g, '_')}_grades.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Grades exported successfully');
    } catch (error) {
      console.error('Error exporting grades:', error);
      toast.error('Failed to export grades');
    } finally {
      setLoading(false);
    }
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
      {loading ? 'Exporting...' : 'Export Grades'}
    </button>
  );
}
