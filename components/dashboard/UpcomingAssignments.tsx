'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ClockIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

interface UpcomingAssignment {
  id: string;
  title: string;
  due_date: string;
  points_possible: number;
  course_id: string;
  courses: {
    code: string;
    name: string;
  };
  submissions: Array<{
    id: string;
    status: string;
  }>;
}

export function UpcomingAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchUpcomingAssignments();
    }
  }, [profile]);

  const fetchUpcomingAssignments = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          points_possible,
          course_id,
          courses(code, name),
          submissions(id, status, user_id)
        `)
        .eq('status', 'published')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10);

      const upcoming = (data || [])
        .filter((assignment: any) => {
          const hasSubmission = assignment.submissions?.some(
            (s: any) => s.user_id === profile.id && s.status !== 'draft'
          );
          return !hasSubmission;
        })
        .map((assignment: any) => ({
          ...assignment,
          courses: Array.isArray(assignment.courses) ? assignment.courses[0] : assignment.courses
        }))
        .slice(0, 5);

      setAssignments(upcoming as UpcomingAssignment[]);
    } catch (error) {
      console.error('Error fetching upcoming assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date)) return 'Overdue';
    if (isToday(date)) return 'Due Today';
    if (isTomorrow(date)) return 'Due Tomorrow';
    return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const getDueDateColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const hoursUntilDue = (date.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (isPast(date)) return 'text-red-600 bg-red-50 border-red-200';
    if (hoursUntilDue <= 24) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (hoursUntilDue <= 72) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  if (profile?.role !== 'student') return null;

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Upcoming Assignments</h2>
            <p className="text-sm text-gray-600 mt-1">Assignments that need your attention</p>
          </div>
          <Link
            href="/assignments"
            className="text-sm font-medium hover:underline inline-flex items-center"
          >
            View All
            <ArrowRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border-2 border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-bold">All caught up!</h3>
            <p className="mt-2 text-sm text-gray-600">
              No upcoming assignments at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const isOverdue = isPast(new Date(assignment.due_date));

              return (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="block p-4 border-2 border-gray-200 hover:border-black transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {assignment.courses.code}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {assignment.points_possible} points
                        </span>
                      </div>
                      <h3 className="text-base font-bold mb-1 group-hover:underline truncate">
                        {assignment.title}
                      </h3>
                      <div
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border-2 ${getDueDateColor(
                          assignment.due_date
                        )}`}
                      >
                        {isOverdue ? (
                          <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                        ) : (
                          <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {getDueDateLabel(assignment.due_date)}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-500 text-right">
                        {format(new Date(assignment.due_date), 'MMM d')}
                      </p>
                      <p className="text-xs text-gray-500 text-right">
                        {format(new Date(assignment.due_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
