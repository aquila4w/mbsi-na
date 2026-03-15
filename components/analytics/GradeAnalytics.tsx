'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChartBarIcon,
  TrophyIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface GradeStats {
  averageGrade: number;
  totalPoints: number;
  earnedPoints: number;
  completedAssignments: number;
  totalAssignments: number;
  gradePercentage: number;
}

export function GradeAnalytics() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<GradeStats>({
    averageGrade: 0,
    totalPoints: 0,
    earnedPoints: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    gradePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchGradeStats();
    }
  }, [profile]);

  const fetchGradeStats = async () => {
    if (!profile) return;

    try {
      const { data: submissions } = await supabase
        .from('submissions')
        .select(`
          grade,
          status,
          assignments(points_possible, status)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'graded');

      const { data: allAssignments } = await supabase
        .from('assignments')
        .select('id, points_possible')
        .eq('status', 'published');

      let totalEarned = 0;
      let totalPossible = 0;
      let gradedCount = 0;

      submissions?.forEach((sub: any) => {
        if (sub.grade !== null && sub.assignments.points_possible) {
          totalEarned += sub.grade;
          totalPossible += sub.assignments.points_possible;
          gradedCount++;
        }
      });

      const gradePercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
      const averageGrade = gradedCount > 0 ? totalEarned / gradedCount : 0;

      setStats({
        averageGrade,
        totalPoints: totalPossible,
        earnedPoints: totalEarned,
        completedAssignments: gradedCount,
        totalAssignments: allAssignments?.length || 0,
        gradePercentage,
      });
    } catch (error) {
      console.error('Error fetching grade stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (profile?.role !== 'student') return null;

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Grade Overview</h2>
        <p className="text-sm text-gray-600 mt-1">Your academic performance summary</p>
      </div>

      {loading ? (
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
        </div>
      ) : stats.completedAssignments === 0 ? (
        <div className="p-8 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-bold">No grades yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Complete and submit assignments to see your grade analytics
          </p>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-black rounded-full">
                  <TrophyIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Overall Grade
                </p>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className={`text-4xl font-bold ${getGradeColor(stats.gradePercentage)}`}>
                  {getGradeLetter(stats.gradePercentage)}
                </p>
                <p className="text-xl font-medium text-gray-600">
                  {stats.gradePercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-black rounded-full">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Points Earned
                </p>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold">{stats.earnedPoints.toFixed(1)}</p>
                <p className="text-lg font-medium text-gray-600">
                  / {stats.totalPoints}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-black rounded-full">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Assignments Graded
                </p>
              </div>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold">{stats.completedAssignments}</p>
                <p className="text-lg font-medium text-gray-600">
                  / {stats.totalAssignments}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Grade Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {((stats.completedAssignments / stats.totalAssignments) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-3 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-500"
                    style={{
                      width: `${(stats.completedAssignments / stats.totalAssignments) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Performance</span>
                  <span className={`text-sm font-medium ${getGradeColor(stats.gradePercentage)}`}>
                    {stats.gradePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stats.gradePercentage >= 90
                        ? 'bg-green-600'
                        : stats.gradePercentage >= 80
                        ? 'bg-blue-600'
                        : stats.gradePercentage >= 70
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${stats.gradePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
