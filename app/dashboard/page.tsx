'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import {
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { DashboardStatSkeleton, CourseCardSkeleton } from '@/components/ui/loading-skeleton';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { GradeAnalytics } from '@/components/analytics/GradeAnalytics';
import { UpcomingAssignments } from '@/components/dashboard/UpcomingAssignments';

interface DashboardStats {
  enrolledCourses: number;
  totalStudents?: number;
  totalCourses?: number;
  pendingAssignments?: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', profile.id)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      const coursesData = (enrollments as any)?.map((e: any) => e.courses) || [];
      setCourses(coursesData);

      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          id,
          submissions(id, status, user_id)
        `)
        .eq('status', 'published');

      let pendingCount = 0;
      if (profile.role === 'student') {
        assignments?.forEach((assignment: any) => {
          const userSubmission = assignment.submissions?.find(
            (s: any) => s.user_id === profile.id && s.status !== 'draft'
          );
          if (!userSubmission) {
            pendingCount++;
          }
        });
      }

      if (profile.role === 'admin' || profile.role === 'teacher') {
        const { count: totalCoursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', profile.id);

        const { count: totalStudentsCount } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        const { count: pendingSubmissions } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'submitted');

        setStats({
          enrolledCourses: enrollments?.length || 0,
          totalCourses: totalCoursesCount || 0,
          totalStudents: totalStudentsCount || 0,
          pendingAssignments: pendingSubmissions || 0,
        });
      } else {
        setStats({
          enrolledCourses: enrollments?.length || 0,
          pendingAssignments: pendingCount,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
  }: {
    title: string;
    value: number | string;
    icon: any;
  }) => (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">{title}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {getGreeting()}, {profile?.full_name.split(' ')[0]}
            </h1>
            <p className="text-gray-600">Here's your overview for today</p>
          </div>

          {loading ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
                <DashboardStatSkeleton />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CourseCardSkeleton />
                <CourseCardSkeleton />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Enrolled Courses"
                  value={stats.enrolledCourses}
                  icon={BookOpenIcon}
                />
                {(profile?.role === 'admin' || profile?.role === 'teacher') && (
                  <>
                    <StatCard
                      title="Total Courses"
                      value={stats.totalCourses || 0}
                      icon={AcademicCapIcon}
                    />
                    <StatCard
                      title="Total Students"
                      value={stats.totalStudents || 0}
                      icon={UserGroupIcon}
                    />
                  </>
                )}
                <StatCard
                  title="Pending Tasks"
                  value={stats.pendingAssignments || 0}
                  icon={ClockIcon}
                />
              </div>

              <div className="bg-white border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">My Courses</h2>
                      <p className="text-sm text-gray-600 mt-1">Active courses you're enrolled in</p>
                    </div>
                    {(profile?.role === 'teacher' || profile?.role === 'admin') && (
                      <Link
                        href="/courses/create"
                        className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Create Course
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {courses.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-gray-200">
                      <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {profile?.role === 'teacher' || profile?.role === 'admin'
                          ? 'Get started by creating your first course'
                          : 'Browse available courses to enroll'}
                      </p>
                      {profile?.role === 'teacher' || profile?.role === 'admin' ? (
                        <Link
                          href="/courses/create"
                          className="mt-6 inline-block px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Create Course
                        </Link>
                      ) : (
                        <Link
                          href="/courses"
                          className="mt-6 inline-block px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          Browse Courses
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {courses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.id}`}
                          className="block border-2 border-gray-200 p-6 hover:border-black transition-colors group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              {course.code}
                            </div>
                            <div
                              className={`px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${
                                course.status === 'published'
                                  ? 'bg-black text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {course.status}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold mb-2 group-hover:underline">{course.name}</h3>
                          <p className="text-sm text-gray-600">{course.term}</p>
                          <div className="mt-4 flex items-center text-sm font-medium group-hover:underline">
                            View Course
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {profile?.role === 'student' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GradeAnalytics />
                  <UpcomingAssignments />
                </div>
              )}

              <RecentActivityFeed />
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
