'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';

interface SessionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { academic_year: string; session_date: string; title: string }) => void;
}

export default function SessionFormDialog({ open, onClose, onSubmit }: SessionFormDialogProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicYear) return;
    setSubmitting(true);
    try {
      await onSubmit({
        academic_year: academicYear,
        session_date: sessionDate,
        title: title || `Annual Deliberation ${academicYear}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Generate academic year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 5; y <= currentYear + 2; y++) {
    yearOptions.push(`${y}-${y + 1}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">New Deliberation Session</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year *</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-2 text-sm transition-colors"
              required
            >
              <option value="">Select academic year</option>
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-2 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Annual Deliberation ${academicYear || '...'}`}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-2 text-sm transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!academicYear || submitting}
              className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
