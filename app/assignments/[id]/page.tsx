'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';
import { AssignmentStats } from '@/components/analytics/AssignmentStats';

interface AssignmentDetail {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  points_possible: number;
  status: string;
  created_at: string;
  course_id: string;
  courses: {
    code: string;
    name: string;
  };
}

interface Submission {
  id: string;
  submission_text: string;
  submitted_at: string | null;
  graded_at: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
}

export default function AssignmentDetailPage() {
  const { profile } = useAuth();
  const params = useParams();
  const assignmentId = params?.id as string;
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    if (profile && assignmentId) {
      fetchAssignmentDetails();
    }
  }, [profile, assignmentId]);

  const fetchAssignmentDetails = async () => {
    if (!profile) return;

    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select(`
          *,
          courses(code, name)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      if (profile.role === 'student') {
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('user_id', profile.id)
          .maybeSingle();

        setSubmission(submissionData);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      toast.error('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = assignment?.due_date && new Date(assignment.due_date) < new Date();
  const canSubmit = assignment?.status === 'published' && !isOverdue;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!assignment) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-16">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-bold">Assignment not found</h3>
            <Link
              href="/assignments"
              className="mt-4 inline-block px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Assignments
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <Link
              href="/assignments"
              className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Assignments
            </Link>
          </div>

          <div className="bg-white border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-sm font-medium uppercase tracking-wide text-gray-500">
                      {assignment.courses.code}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
                        assignment.status === 'published'
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2">{assignment.title}</h1>
                  <p className="text-lg text-gray-600">{assignment.courses.name}</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <AcademicCapIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Points Possible
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{assignment.points_possible}</p>
                </div>
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Due Date
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {assignment.due_date
                      ? format(new Date(assignment.due_date), 'MMM d, yyyy')
                      : 'No due date'}
                  </p>
                  {assignment.due_date && (
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(assignment.due_date), 'h:mm a')}
                    </p>
                  )}
                </div>
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Submission Status
                    </p>
                  </div>
                  <p className="text-lg font-bold">
                    {submission?.status === 'graded'
                      ? 'Graded'
                      : submission?.status === 'submitted'
                      ? 'Submitted'
                      : 'Not Submitted'}
                  </p>
                  {submission?.grade !== null && submission?.grade !== undefined && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {submission.grade}/{assignment.points_possible} points
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                Assignment Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {assignment.description}
                </p>
              </div>
            </div>

            {profile?.role === 'student' && (
              <>
                {canSubmit && (
                  <div className="p-8 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setShowSubmitDialog(true)}
                      className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                    >
                      {submission ? 'Resubmit Assignment' : 'Submit Assignment'}
                    </button>
                  </div>
                )}

                {isOverdue && !submission && (
                  <div className="p-8 border-t border-gray-200 bg-red-50">
                    <div className="flex items-center text-red-600">
                      <ClockIcon className="w-5 h-5 mr-2" />
                      <p className="font-medium">
                        This assignment is overdue and can no longer be submitted
                      </p>
                    </div>
                  </div>
                )}

                {submission && (
                  <div className="p-8 border-t border-gray-200">
                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                      Your Submission
                    </h2>
                    <div className="bg-gray-50 border-2 border-gray-200 p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">
                            Submitted{' '}
                            {submission.submitted_at &&
                              format(new Date(submission.submitted_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {submission.submission_text}
                      </p>
                    </div>

                    {submission.status === 'graded' && submission.feedback && (
                      <div>
                        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                          Instructor Feedback
                        </h2>
                        <div className="bg-blue-50 border-2 border-blue-200 p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-blue-900">
                              Grade: {submission.grade}/{assignment.points_possible} points
                            </span>
                            <span className="text-xs text-blue-600">
                              Graded{' '}
                              {submission.graded_at &&
                                format(new Date(submission.graded_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {submission.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <div className="p-8 border-t border-gray-200">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-6">
                  Assignment Statistics
                </h2>
                <AssignmentStats
                  assignmentId={assignmentId}
                  pointsPossible={assignment.points_possible}
                />
              </div>
            )}
          </div>
        </div>

        <SubmitAssignmentDialog
          assignmentId={assignmentId}
          assignmentTitle={assignment.title}
          isOpen={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          onSuccess={() => {
            fetchAssignmentDetails();
          }}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
