'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  PlusIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreateAssignmentDialog } from '@/components/assignments/CreateAssignmentDialog';
import { SubmitAssignmentDialog } from '@/components/assignments/SubmitAssignmentDialog';
import { GradeSubmissionDialog } from '@/components/assignments/GradeSubmissionDialog';
import { GradeExport } from '@/components/grades/GradeExport';
import { BulkEnrollDialog } from '@/components/courses/BulkEnrollDialog';

interface CourseDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  term: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  role: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
    role: string;
  };
}

export default function CourseDetailPage() {
  const { profile } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => {
    if (profile && courseId) {
      fetchCourseDetails();
      fetchAssignments();
    }
  }, [profile, courseId]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchCourseDetails = async () => {
    if (!profile) return;

    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*, profiles(*)')
        .eq('course_id', courseId);

      if (enrollmentError) throw enrollmentError;
      setEnrollments((enrollmentData as any) || []);

      const userEnrollment = (enrollmentData as any)?.find((e: any) => e.user_id === profile.id);
      if (userEnrollment) {
        setIsEnrolled(true);
        setUserRole(userEnrollment.role);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const handleEnroll = async () => {
    if (!profile) return;

    try {
      const { error } = await (supabase.from('enrollments') as any).insert({
        user_id: profile.id,
        course_id: courseId,
        role: 'student',
        status: 'active',
      });

      if (error) throw error;
      toast.success('Successfully enrolled in course!');
      fetchCourseDetails();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const handleUnenroll = async () => {
    if (!profile) return;

    try {
      const { error } = await (supabase
        .from('enrollments') as any)
        .delete()
        .eq('user_id', profile.id)
        .eq('course_id', courseId);

      if (error) throw error;
      router.push('/courses');
    } catch (error) {
      console.error('Error unenrolling from course:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-16 bg-white border border-gray-200">
            <h2 className="text-2xl font-bold">Course not found</h2>
            <Link href="/courses" className="text-black underline hover:no-underline mt-4 inline-block">
              Back to Courses
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
            <Link href="/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </div>

          <div className="bg-white border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-bold">{course.name}</h1>
                    <span
                      className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                        course.status === 'published'
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 mt-2">{course.code}</p>
                </div>
                {!isEnrolled && course.status === 'published' && (
                  <button
                    onClick={handleEnroll}
                    className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Enroll in Course
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Term</p>
                  </div>
                  <p className="text-xl font-bold">{course.term}</p>
                </div>
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Date</p>
                  </div>
                  <p className="text-xl font-bold">{formatDate(course.start_date)}</p>
                </div>
                <div className="p-6 bg-gray-50 border-l-4 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <UserGroupIcon className="w-5 h-5 text-gray-500" />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrolled</p>
                  </div>
                  <p className="text-xl font-bold">{enrollments.length}</p>
                </div>
              </div>
            </div>

            {course.description && (
              <div className="p-8">
                <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">About this course</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            )}

            {isEnrolled && (
              <div className="border-t border-gray-200">
                <div className="border-b border-gray-200 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 -mb-px">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'overview'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-600 hover:text-black'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('assignments')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'assignments'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-600 hover:text-black'
                        }`}
                      >
                        Assignments ({assignments.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('people')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === 'people'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-600 hover:text-black'
                        }`}
                      >
                        People ({enrollments.length})
                      </button>
                    </div>
                    {userRole && (
                      <span className="px-3 py-1 bg-black text-white text-xs font-medium uppercase tracking-wide">
                        Your role: {userRole}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href={`/courses/${courseId}/modules`}>
                          <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                            <div className="text-center">
                              <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">Modules</p>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/courses/${courseId}/discussions`}>
                          <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                            <div className="text-center">
                              <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">Discussions</p>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/courses/${courseId}/quizzes`}>
                          <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                            <div className="text-center">
                              <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">Quizzes</p>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/courses/${courseId}/announcements`}>
                          <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                            <div className="text-center">
                              <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">Announcements</p>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/courses/${courseId}/groups`}>
                          <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                            <div className="text-center">
                              <UserGroupIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">Groups</p>
                            </div>
                          </div>
                        </Link>
                        {(userRole === 'teacher' || userRole === 'admin') && (
                          <Link href={`/courses/${courseId}/gradebook`}>
                            <div className="p-6 border-2 border-gray-200 hover:border-black transition-colors cursor-pointer">
                              <div className="text-center">
                                <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                <p className="font-medium">Gradebook</p>
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      {(userRole === 'teacher' || userRole === 'admin') && (
                        <div className="flex justify-end mb-6">
                          <button
                            onClick={() => setShowCreateAssignment(true)}
                            className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Assignment
                          </button>
                        </div>
                      )}
                      {assignments.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200">
                          <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
                          <h3 className="mt-4 text-lg font-bold">No assignments yet</h3>
                          <p className="mt-2 text-sm text-gray-600">
                            {userRole === 'teacher' || userRole === 'admin'
                              ? 'Create your first assignment to get started'
                              : 'Check back later for assignments'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="p-6 border-2 border-gray-200 hover:border-black transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span
                                      className={`px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
                                        assignment.status === 'published'
                                          ? 'bg-black text-white'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {assignment.status}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {assignment.points_possible} points
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold mb-1">{assignment.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {assignment.description}
                                  </p>
                                  {assignment.due_date && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <ClockIcon className="w-4 h-4 mr-1.5" />
                                      Due {format(new Date(assignment.due_date), 'MMM d, yyyy h:mm a')}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-6 flex flex-col space-y-2">
                                  {userRole === 'student' && assignment.status === 'published' && (
                                    <button
                                      onClick={() => {
                                        setSelectedAssignment(assignment);
                                        setShowSubmitDialog(true);
                                      }}
                                      className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                                    >
                                      Submit Work
                                    </button>
                                  )}
                                  {(userRole === 'teacher' || userRole === 'admin') && (
                                    <button
                                      onClick={() => {
                                        setSelectedAssignment(assignment);
                                        setShowGradeDialog(true);
                                      }}
                                      className="px-4 py-2 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors whitespace-nowrap"
                                    >
                                      Grade Submissions
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'people' && (
                    <div className="space-y-6">
                      {(userRole === 'teacher' || userRole === 'admin') && (
                        <div className="flex justify-end gap-3">
                          <BulkEnrollDialog courseId={courseId} onSuccess={fetchCourseDetails} />
                          <GradeExport courseId={courseId} courseName={course.name} />
                        </div>
                      )}
                      <div className="space-y-2">
                        {enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center justify-between p-4 border-2 border-gray-200 hover:border-black transition-colors"
                        >
                          <div>
                            <p className="font-medium">{enrollment.profiles.full_name}</p>
                            <p className="text-sm text-gray-600">{enrollment.profiles.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium uppercase tracking-wide">
                              {enrollment.role}
                            </span>
                            <span
                              className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                                enrollment.status === 'active'
                                  ? 'bg-black text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {enrollment.status}
                            </span>
                          </div>
                        </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {isEnrolled && userRole === 'student' && (
            <div className="flex justify-end">
              <button
                onClick={handleUnenroll}
                className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Unenroll from Course
              </button>
            </div>
          )}
        </div>

        <CreateAssignmentDialog
          courseId={courseId}
          isOpen={showCreateAssignment}
          onClose={() => setShowCreateAssignment(false)}
          onSuccess={fetchAssignments}
        />

        {selectedAssignment && (
          <>
            <SubmitAssignmentDialog
              assignmentId={selectedAssignment.id}
              assignmentTitle={selectedAssignment.title}
              isOpen={showSubmitDialog}
              onClose={() => {
                setShowSubmitDialog(false);
                setSelectedAssignment(null);
              }}
              onSuccess={() => {
                fetchAssignments();
              }}
            />

            <GradeSubmissionDialog
              assignmentId={selectedAssignment.id}
              assignmentTitle={selectedAssignment.title}
              pointsPossible={selectedAssignment.points_possible}
              isOpen={showGradeDialog}
              onClose={() => {
                setShowGradeDialog(false);
                setSelectedAssignment(null);
              }}
              onSuccess={() => {
                fetchAssignments();
              }}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
