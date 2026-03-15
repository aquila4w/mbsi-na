'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import {
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  points_possible: number;
  status: string;
  course_id: string;
  courses: {
    code: string;
    name: string;
  };
  submissions?: Array<{
    id: string;
    status: string;
    grade: number | null;
    submitted_at: string | null;
  }>;
}

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  useEffect(() => {
    if (profile) {
      fetchAssignments();
    }
  }, [profile]);

  const fetchAssignments = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          courses(code, name),
          submissions(id, status, grade, submitted_at)
        `)
        .eq('status', 'published')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return 'not_submitted';
    }
    const submission = assignment.submissions[0];
    return submission.status;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const status = getSubmissionStatus(assignment);
    if (filter === 'pending') return status === 'not_submitted' || status === 'draft';
    if (filter === 'submitted') return status === 'submitted';
    if (filter === 'graded') return status === 'graded';
    return true;
  });

  const getStatusBadge = (assignment: Assignment) => {
    const status = getSubmissionStatus(assignment);
    const overdue = isOverdue(assignment.due_date);

    if (status === 'graded') {
      const grade = assignment.submissions?.[0]?.grade;
      return (
        <div className="flex items-center text-sm">
          <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-600" />
          <span className="text-green-600 font-medium">Graded: {grade}/{assignment.points_possible}</span>
        </div>
      );
    }

    if (status === 'submitted') {
      return (
        <div className="flex items-center text-sm">
          <CheckCircleIcon className="w-4 h-4 mr-1.5 text-blue-600" />
          <span className="text-blue-600 font-medium">Submitted</span>
        </div>
      );
    }

    if (overdue) {
      return (
        <div className="flex items-center text-sm">
          <ExclamationCircleIcon className="w-4 h-4 mr-1.5 text-red-600" />
          <span className="text-red-600 font-medium">Overdue</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-sm">
        <ClockIcon className="w-4 h-4 mr-1.5 text-gray-600" />
        <span className="text-gray-600 font-medium">Pending</span>
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'teacher', 'ta', 'admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">Assignments</h1>
              <p className="text-gray-600 mt-2">View and manage your assignments</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      filter === 'pending'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('submitted')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      filter === 'submitted'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Submitted
                  </button>
                  <button
                    onClick={() => setFilter('graded')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      filter === 'graded'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Graded
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-16 text-center">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-bold">No assignments found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {filter === 'all'
                    ? 'No assignments available yet'
                    : `No ${filter} assignments`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {assignment.courses.code}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {assignment.points_possible} points
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {assignment.due_date && (
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1.5" />
                              Due {format(new Date(assignment.due_date), 'MMM d, yyyy h:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 flex flex-col items-end space-y-3">
                        {getStatusBadge(assignment)}
                        <Link
                          href={`/assignments/${assignment.id}`}
                          className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
