'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function CreateCoursePage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    term: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!profile) throw new Error('Not authenticated');

      const { data: course, error: courseError } = await (supabase
        .from('courses') as any)
        .insert({
          ...formData,
          created_by: profile.id,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      const { error: enrollmentError } = await (supabase.from('enrollments') as any).insert({
        user_id: profile.id,
        course_id: course.id,
        role: 'teacher',
        status: 'active',
      });

      if (enrollmentError) throw enrollmentError;

      toast.success('Course created successfully!');
      router.push(`/courses/${course.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      toast.error(err.message || 'Failed to create course');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'admin']}>
      <DashboardLayout>
        <div className="max-w-3xl">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="bg-white border border-gray-200">
            <div className="p-8 border-b border-gray-200">
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="text-gray-600 mt-2">Fill in the details to create a new course</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="code" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Course Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                    placeholder="e.g., CS101"
                  />
                </div>

                <div>
                  <label htmlFor="term" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Term <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="term"
                    name="term"
                    type="text"
                    required
                    value={formData.term}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                    placeholder="e.g., Fall 2024"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Course Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm resize-none"
                  placeholder="Enter course description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Start Date
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    End Date
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-black focus:outline-none transition-colors text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <p className="text-sm text-gray-600 mt-3">
                  Draft courses are only visible to you. Published courses are visible to enrolled students.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
