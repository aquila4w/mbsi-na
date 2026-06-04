'use client';

import { useState, useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { fetchLevels } from '@/lib/advancement/service';
import { MbsiLevel } from '@/lib/advancement/types';
import { sortLevels } from '@/lib/advancement/constants';

interface EnrollmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    level_id: string;
    academic_year: string;
    enrolled_at: string;
    admin_notes: string;
  }) => void;
  isReEntry?: boolean;
}

export default function EnrollmentFormDialog({ open, onClose, onSubmit, isReEntry }: EnrollmentFormDialogProps) {
  const [levels, setLevels] = useState<MbsiLevel[]>([]);
  const [levelId, setLevelId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [enrolledAt, setEnrolledAt] = useState(new Date().toISOString().split('T')[0]);
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLevels().then((lvs) => setLevels(sortLevels(lvs.filter((l) => !l.is_terminal))));
    }
  }, [open]);

  if (!open) return null;

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 10; y <= currentYear + 2; y++) {
    yearOptions.push(`${y}-${y + 1}`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelId || !academicYear) return;
    setSubmitting(true);
    try {
      await onSubmit({ level_id: levelId, academic_year: academicYear, enrolled_at: enrolledAt, admin_notes: adminNotes });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{isReEntry ? 'Re-enroll Student' : 'Enroll Student'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {isReEntry && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-700">
              This student previously left the program. Select the appropriate level for re-entry — admin discretion applies.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Level *</label>
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
              required
            >
              <option value="">Select level</option>
              <optgroup label="AMP Internship">
                {levels.filter((l) => l.tier === 'amp_internship').map((l) => (
                  <option key={l.id} value={l.id}>{l.display_name}</option>
                ))}
              </optgroup>
              <optgroup label="Probationary">
                {levels.filter((l) => l.tier === 'probationary').map((l) => (
                  <option key={l.id} value={l.id}>{l.display_name}</option>
                ))}
              </optgroup>
              <optgroup label="MBSI">
                {levels.filter((l) => l.tier === 'mbsi').map((l) => (
                  <option key={l.id} value={l.id}>{l.display_name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Academic Year *</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
              required
            >
              <option value="">Select academic year</option>
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Enrollment Date</label>
            <input
              type="date"
              value={enrolledAt}
              onChange={(e) => setEnrolledAt(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-2 text-sm transition-colors"
              placeholder="Notes about enrollment, exceptions, etc."
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
              disabled={!levelId || !academicYear || submitting}
              className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : isReEntry ? 'Re-enroll' : 'Enroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
