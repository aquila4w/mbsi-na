'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateAssignmentDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAssignmentDialog({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: CreateAssignmentDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    points_possible: '100',
    status: 'draft' as 'draft' | 'published' | 'closed',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await (supabase.from('assignments') as any).insert({
        course_id: courseId,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date || null,
        points_possible: parseInt(formData.points_possible),
        status: formData.status,
        created_by: profile.id,
      });

      if (error) throw error;

      toast.success('Assignment created successfully!');
      onSuccess();
      onClose();
      setFormData({
        title: '',
        description: '',
        due_date: '',
        points_possible: '100',
        status: 'draft',
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white w-full max-w-2xl border-2 border-black shadow-xl">
          <div className="flex items-center justify-between p-6 border-b-2 border-black">
            <h2 className="text-2xl font-bold">Create Assignment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Assignment title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Assignment description and instructions"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Points Possible
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="points_possible"
                  value={formData.points_possible}
                  onChange={handleChange}
                  required
                  min="0"
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
                <span className="text-red-600 ml-1">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only published assignments are visible to students
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
