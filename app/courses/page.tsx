'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import { BookOpenIcon, MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { CourseCardSkeleton } from '@/components/ui/loading-skeleton';
import { toast } from 'sonner';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  term: string;
  status: string;
  created_at: string;
}

export default function CoursesPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');

  useEffect(() => {
    if (profile) {
      fetchCourses();
    }
  }, [profile, filter]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.term.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      if (filter === 'enrolled') {
        const { data: enrollments, error } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', profile.id)
          .eq('status', 'active');

        if (error) throw error;
        const coursesData = enrollments?.map((e: any) => e.courses) || [];
        setCourses(coursesData);
      } else if (filter === 'available') {
        const { data: allCourses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('status', 'published');

        if (coursesError) throw coursesError;

        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', profile.id);

        if (enrollmentsError) throw enrollmentsError;

        const enrolledIds = (enrollments as any)?.map((e: any) => e.course_id) || [];
        const available = (allCourses as any)?.filter((c: any) => !enrolledIds.includes(c.id)) || [];
        setCourses(available);
      } else {
        const { data, error } = await supabase.from('courses').select('*').eq('status', 'published');

        if (error) throw error;
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
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
      fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Courses</h1>
              <p className="text-gray-600 mt-2">Browse and manage your courses</p>
            </div>
            {(profile?.role === 'teacher' || profile?.role === 'admin') && (
              <Link
                href="/courses/create"
                className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Create Course
              </Link>
            )}
          </div>

          <div className="bg-white border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setFilter('enrolled')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === 'enrolled'
                      ? 'bg-black text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  Enrolled
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filter === 'available'
                      ? 'bg-black text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                  }`}
                >
                  Available
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 p-16">
              <div className="text-center">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-bold">No courses found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : filter === 'enrolled'
                    ? 'You are not enrolled in any courses yet'
                    : 'No courses available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white border-2 border-gray-200 group hover:border-black transition-colors">
                  <div className="p-6">
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
                    <h3 className="text-lg font-bold mb-2">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.term}</p>
                    {course.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {filter === 'available' ? (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Enroll Now
                      </button>
                    ) : (
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-center w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        View Course
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
