'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';

interface PlaceAssignmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    location: string;
    ministry_role: string;
    supervisor_name: string;
    notes: string;
    assigned_from: string;
    assigned_until: string;
    is_current: boolean;
  }) => void;
  initialData?: {
    location?: string;
    ministry_role?: string;
    supervisor_name?: string;
    notes?: string;
    assigned_from?: string;
    assigned_until?: string;
    is_current?: boolean;
  };
  title?: string;
}

export default function PlaceAssignmentFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Place Assignment',
}: PlaceAssignmentFormDialogProps) {
  const [location, setLocation] = useState(initialData?.location || '');
  const [ministryRole, setMinistryRole] = useState(initialData?.ministry_role || '');
  const [supervisorName, setSupervisorName] = useState(initialData?.supervisor_name || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [assignedFrom, setAssignedFrom] = useState(initialData?.assigned_from || new Date().toISOString().split('T')[0]);
  const [assignedUntil, setAssignedUntil] = useState(initialData?.assigned_until || '');
  const [isCurrent, setIsCurrent] = useState(initialData?.is_current ?? true);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    setSubmitting(true);
    try {
      await onSubmit({
        location,
        ministry_role: ministryRole,
        supervisor_name: supervisorName,
        notes,
        assigned_from: assignedFrom,
        assigned_until: isCurrent ? '' : assignedUntil,
        is_current: isCurrent,
      });
      // Reset form
      setLocation('');
      setMinistryRole('');
      setSupervisorName('');
      setNotes('');
      setAssignedFrom(new Date().toISOString().split('T')[0]);
      setAssignedUntil('');
      setIsCurrent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location / Church *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. South Bay, Tampa FL, San Diego"
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ministry Role</label>
            <input
              type="text"
              value={ministryRole}
              onChange={(e) => setMinistryRole(e.target.value)}
              placeholder="e.g. Catering, Praise & Worship, Directing"
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supervisor / Pastor</label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="Name of overseeing pastor/leader"
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">From *</label>
              <input
                type="month"
                value={assignedFrom ? assignedFrom.substring(0, 7) : ''}
                onChange={(e) => setAssignedFrom(e.target.value ? `${e.target.value}-01` : '')}
                className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Until</label>
              <input
                type="month"
                value={assignedUntil ? assignedUntil.substring(0, 7) : ''}
                onChange={(e) => setAssignedUntil(e.target.value ? `${e.target.value}-01` : '')}
                disabled={isCurrent}
                className="w-full border-2 border-gray-200 focus:border-black px-3 py-3 text-sm transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="is_current" className="text-sm">This is the current assignment</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border-2 border-gray-200 focus:border-black px-3 py-2 text-sm transition-colors"
              placeholder="Additional notes about this assignment"
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
              disabled={!location || submitting}
              className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
