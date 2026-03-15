'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface AssignmentStatsProps {
  assignmentId: string;
  pointsPossible: number;
}

interface Stats {
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  submissionRate: number;
  totalStudents: number;
}

export function AssignmentStats({ assignmentId, pointsPossible }: AssignmentStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalSubmissions: 0,
    gradedSubmissions: 0,
    pendingSubmissions: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0,
    submissionRate: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [assignmentId]);

  const fetchStats = async () => {
    try {
      const { data: assignment } = await supabase
        .from('assignments')
        .select('course_id')
        .eq('id', assignmentId)
        .maybeSingle();

      if (!assignment) return;

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('course_id', (assignment as any).course_id)
        .eq('role', 'student');

      const totalStudents = enrollments?.length || 0;

      const { data: submissions } = await supabase
        .from('submissions')
        .select('status, grade')
        .eq('assignment_id', assignmentId);

      const submissionList = (submissions || []) as any[];
      const totalSubmissions = submissionList.length;
      const gradedSubmissions = submissionList.filter((s: any) => s.status === 'graded').length;
      const pendingSubmissions = submissionList.filter((s: any) => s.status === 'submitted').length;

      const grades = submissionList.filter((s: any) => s.grade !== null).map((s: any) => s.grade!);
      const averageGrade = grades.length > 0
        ? grades.reduce((sum, g) => sum + g, 0) / grades.length
        : 0;
      const highestGrade = grades.length > 0 ? Math.max(...grades) : 0;
      const lowestGrade = grades.length > 0 ? Math.min(...grades) : 0;
      const submissionRate = totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0;

      setStats({
        totalSubmissions,
        gradedSubmissions,
        pendingSubmissions,
        averageGrade,
        highestGrade,
        lowestGrade,
        submissionRate,
        totalStudents,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-gray-50 border-l-4 border-black">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="w-5 h-5 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Total Submissions
            </p>
          </div>
          <p className="text-3xl font-bold">
            {stats.totalSubmissions}/{stats.totalStudents}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {stats.submissionRate.toFixed(0)}% submitted
          </p>
        </div>

        <div className="p-6 bg-gray-50 border-l-4 border-black">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Graded
            </p>
          </div>
          <p className="text-3xl font-bold">{stats.gradedSubmissions}</p>
          <p className="text-sm text-gray-600 mt-1">
            {stats.pendingSubmissions} pending
          </p>
        </div>

        <div className="p-6 bg-gray-50 border-l-4 border-black">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="w-5 h-5 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Average Grade
            </p>
          </div>
          <p className="text-3xl font-bold">
            {stats.averageGrade.toFixed(1)}/{pointsPossible}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {pointsPossible > 0 ? ((stats.averageGrade / pointsPossible) * 100).toFixed(0) : 0}%
          </p>
        </div>

        <div className="p-6 bg-gray-50 border-l-4 border-black">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Grade Range
            </p>
          </div>
          <p className="text-xl font-bold">
            {stats.lowestGrade.toFixed(0)} - {stats.highestGrade.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">out of {pointsPossible}</p>
        </div>
      </div>

      <div className="p-6 bg-white border-2 border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Distribution
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Graded</span>
            <div className="flex items-center gap-3 flex-1 ml-6">
              <div className="flex-1 bg-gray-200 h-2">
                <div
                  className="bg-black h-2 transition-all"
                  style={{
                    width: `${stats.totalSubmissions > 0 ? (stats.gradedSubmissions / stats.totalSubmissions) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {stats.gradedSubmissions}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Pending</span>
            <div className="flex items-center gap-3 flex-1 ml-6">
              <div className="flex-1 bg-gray-200 h-2">
                <div
                  className="bg-gray-500 h-2 transition-all"
                  style={{
                    width: `${stats.totalSubmissions > 0 ? (stats.pendingSubmissions / stats.totalSubmissions) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {stats.pendingSubmissions}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Not Submitted</span>
            <div className="flex items-center gap-3 flex-1 ml-6">
              <div className="flex-1 bg-gray-200 h-2">
                <div
                  className="bg-red-600 h-2 transition-all"
                  style={{
                    width: `${stats.totalStudents > 0 ? ((stats.totalStudents - stats.totalSubmissions) / stats.totalStudents) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm font-medium w-12 text-right">
                {stats.totalStudents - stats.totalSubmissions}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
