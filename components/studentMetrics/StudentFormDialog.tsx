'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StudentMetricsStudent } from '@/lib/studentMetrics/types';

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<StudentMetricsStudent>) => Promise<void>;
  student?: StudentMetricsStudent | null;
}

export function StudentFormDialog({ open, onClose, onSave, student }: StudentFormDialogProps) {
  const [fullName, setFullName] = useState('');
  const [dateEntered, setDateEntered] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setFullName(student.full_name);
      setDateEntered(student.date_entered ? student.date_entered.split('T')[0] : '');
    } else {
      setFullName('');
      setDateEntered('');
    }
  }, [student, open]);

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await onSave({
        full_name: fullName.trim(),
        date_entered: dateEntered || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Juan dela Cruz"
            />
          </div>
          <div className="space-y-1">
            <Label>Date Entered Program</Label>
            <Input
              type="date"
              value={dateEntered}
              onChange={(e) => setDateEntered(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !fullName.trim()}>
            {saving ? 'Saving...' : student ? 'Save Changes' : 'Add Student'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
