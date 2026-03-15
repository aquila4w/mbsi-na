'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BulkEnrollDialogProps {
  courseId: string;
  onSuccess: () => void;
}

export function BulkEnrollDialog({ courseId, onSuccess }: BulkEnrollDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);

  const handleBulkEnroll = async () => {
    const emailList = emails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emailList.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const email of emailList) {
        try {
          const { data: user } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (!user) {
            errorCount++;
            continue;
          }

          const userRecord = user as any;

          const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userRecord.id)
            .maybeSingle();

          if (existing) {
            errorCount++;
            continue;
          }

          const result: any = await (supabase as any)
            .from('enrollments')
            .insert([{
              course_id: courseId,
              user_id: userRecord.id,
              role: role,
              status: 'active',
            }]);

          if (result.error) {
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} user${successCount !== 1 ? 's' : ''} enrolled successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} enrollment${errorCount !== 1 ? 's' : ''} failed`);
      }

      if (successCount > 0) {
        setEmails('');
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error('Error during bulk enrollment:', error);
      toast.error('Failed to process bulk enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border-2 border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
      >
        <UserPlusIcon className="w-4 h-4 mr-2" />
        Bulk Enroll
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-2xl border-2 border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Bulk Enrollment</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add multiple users to this course at once
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                  className="w-full px-4 py-2 border-2 border-gray-200 focus:border-black focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Addresses
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Enter one email per line, or separate with commas
                </p>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none font-mono text-sm"
                />
              </div>

              <div className="p-4 bg-gray-50 border-l-4 border-black">
                <h4 className="text-sm font-medium mb-2">Important Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Users must already have accounts in the system</li>
                  <li>Duplicate enrollments will be skipped</li>
                  <li>Invalid email addresses will be ignored</li>
                  <li>Each user will be enrolled with the selected role</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-6 py-2 border-2 border-gray-200 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkEnroll}
                disabled={loading || !emails.trim()}
                className="px-6 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Enroll Users'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
