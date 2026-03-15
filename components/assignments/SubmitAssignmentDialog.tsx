'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SubmitAssignmentDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SubmitAssignmentDialog({
  assignmentId,
  assignmentTitle,
  isOpen,
  onClose,
  onSuccess,
}: SubmitAssignmentDialogProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { data: existingSubmission } = await (supabase
        .from('submissions') as any)
        .select('id')
        .eq('assignment_id', assignmentId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (existingSubmission) {
        const { error } = await (supabase.from('submissions') as any)
          .update({
            submission_text: submissionText,
            submitted_at: new Date().toISOString(),
            status: 'submitted',
          })
          .eq('id', existingSubmission.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase.from('submissions') as any).insert({
          assignment_id: assignmentId,
          user_id: profile.id,
          submission_text: submissionText,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
        });

        if (error) throw error;
      }

      toast.success('Assignment submitted successfully!');
      onSuccess();
      onClose();
      setSubmissionText('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold">Submit Assignment</h2>
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
              <p className="text-sm text-gray-600 mb-4">
                Submitting: <span className="font-medium text-black">{assignmentTitle}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Submission
                <span className="text-red-600 ml-1">*</span>
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                required
                disabled={loading}
                rows={10}
                className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Enter your submission text here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                You can resubmit this assignment before the due date
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
                disabled={loading || !submissionText.trim()}
                className="px-6 py-2.5 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
