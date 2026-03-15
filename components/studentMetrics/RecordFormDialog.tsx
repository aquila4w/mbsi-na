'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentMetricsRecord, YEAR_LEVELS } from '@/lib/studentMetrics/types';

interface RecordFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<StudentMetricsRecord>) => Promise<void>;
  record?: StudentMetricsRecord | null;
  studentId: string;
}

const EMPTY: Partial<StudentMetricsRecord> = {
  year_level: '',
  academic_year: '',
  year: new Date().getFullYear(),
  assignment: '',
  contacts: 0,
  guests: 0,
  baptisms_us: 0,
  baptisms_rrb_ph: 0,
  thanksgiving_offering: 0,
  evangelism_offering: 0,
  caroling_goal_reached: false,
  caroling_amount: 0,
  caroling_leader: false,
  notes: '',
};

export function RecordFormDialog({ open, onClose, onSave, record, studentId }: RecordFormDialogProps) {
  const [form, setForm] = useState<Partial<StudentMetricsRecord>>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({ ...record });
    } else {
      setForm({ ...EMPTY, student_id: studentId });
    }
  }, [record, studentId, open]);

  const set = (key: keyof StudentMetricsRecord, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, student_id: studentId });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Record' : 'Add New Record'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <Label>Year Level</Label>
            <Select value={form.year_level || ''} onValueChange={(v) => set('year_level', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {YEAR_LEVELS.map((yl) => (
                  <SelectItem key={yl} value={yl}>{yl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Academic Year</Label>
            <Input
              value={form.academic_year || ''}
              onChange={(e) => set('academic_year', e.target.value)}
              placeholder="e.g. 2024-2025"
            />
          </div>

          <div className="space-y-1">
            <Label>Calendar Year</Label>
            <Input
              type="number"
              value={form.year || ''}
              onChange={(e) => set('year', parseInt(e.target.value) || null)}
            />
          </div>

          <div className="space-y-1">
            <Label>Assignment / Location</Label>
            <Input
              value={form.assignment || ''}
              onChange={(e) => set('assignment', e.target.value)}
              placeholder="e.g. South Bay, CA"
            />
          </div>

          <div className="space-y-1">
            <Label>Contacts</Label>
            <Input
              type="number"
              min={0}
              value={form.contacts ?? 0}
              onChange={(e) => set('contacts', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Guests</Label>
            <Input
              type="number"
              min={0}
              value={form.guests ?? 0}
              onChange={(e) => set('guests', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Baptisms (US)</Label>
            <Input
              type="number"
              min={0}
              value={form.baptisms_us ?? 0}
              onChange={(e) => set('baptisms_us', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Baptisms (RRB/PH)</Label>
            <Input
              type="number"
              min={0}
              value={form.baptisms_rrb_ph ?? 0}
              onChange={(e) => set('baptisms_rrb_ph', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Thanksgiving Offering ($)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.thanksgiving_offering ?? 0}
              onChange={(e) => set('thanksgiving_offering', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Evangelism Offering ($)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.evangelism_offering ?? 0}
              onChange={(e) => set('evangelism_offering', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Caroling Goal Amount ($)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.caroling_amount ?? 0}
              onChange={(e) => set('caroling_amount', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Input
              value={form.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-black"
                checked={!!form.caroling_goal_reached}
                onChange={(e) => set('caroling_goal_reached', e.target.checked)}
              />
              <span className="text-sm font-medium">Caroling Goal Reached</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-black"
                checked={!!form.caroling_leader}
                onChange={(e) => set('caroling_leader', e.target.checked)}
              />
              <span className="text-sm font-medium">Caroling Leader</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.year_level}>
            {saving ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
