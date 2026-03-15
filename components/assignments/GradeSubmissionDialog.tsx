'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Submission {
  id: string;
  submission_text: string;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface GradeSubmissionDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  pointsPossible: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GradeSubmissionDialog({
  assignmentId,
  assignmentTitle,
  pointsPossible,
  isOpen,
  onClose,
  onSuccess,
}: GradeSubmissionDialogProps) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('assignment_id', assignmentId)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || '');
    setFeedback(submission.feedback || '');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    const gradeNumber = parseFloat(grade);
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > pointsPossible) {
      toast.error(`Grade must be between 0 and ${pointsPossible}`);
      return;
    }

    setSaving(true);
    try {
      const { error } = await (supabase.from('submissions') as any)
        .update({
          grade: gradeNumber,
          feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast.success('Grade saved successfully!');
      fetchSubmissions();
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      onSuccess();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
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

        <div className="relative bg-white w-full max-w-6xl border-2 border-black shadow-xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b-2 border-black">
            <div>
              <h2 className="text-2xl font-bold">Grade Submissions</h2>
              <p className="text-sm text-gray-600 mt-1">{assignmentTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex">
            <div className="w-1/3 border-r-2 border-gray-200 overflow-y-auto">
              <div className="p-4 bg-gray-50 border-b-2 border-gray-200">
                <h3 className="text-sm font-medium uppercase tracking-wide text-gray-600">
                  Submissions ({submissions.length})
                </h3>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No submissions yet
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <button
                      key={submission.id}
                      onClick={() => handleSelectSubmission(submission)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedSubmission?.id === submission.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="font-medium text-sm">{submission.profiles.full_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {submission.submitted_at &&
                          new Date(submission.submitted_at).toLocaleString()}
                      </div>
                      {submission.grade !== null && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Graded: {submission.grade}/{pointsPossible}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedSubmission ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Student
                    </h3>
                    <p className="font-medium">{selectedSubmission.profiles.full_name}</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.profiles.email}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Submission
                    </h3>
                    <div className="bg-gray-50 border-2 border-gray-200 p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedSubmission.submission_text}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Grade (out of {pointsPossible})
                      <span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max={pointsPossible}
                      step="0.5"
                      disabled={saving}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter grade"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={saving}
                      rows={6}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                      placeholder="Enter feedback for the student..."
                    />
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t-2 border-gray-200">
                    <button
                      onClick={handleSaveGrade}
                      disabled={saving || !grade}
                      className="px-6 py-2.5 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Grade'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Select a submission to grade</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
