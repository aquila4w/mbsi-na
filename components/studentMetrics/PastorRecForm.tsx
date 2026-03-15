'use client';

import { useState, useEffect } from 'react';
import { PastorRecommendation, YEAR_LEVELS } from '@/lib/studentMetrics/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PastorRecFormProps {
  studentId: string;
  studentName: string;
  recommendation?: PastorRecommendation | null;
  onSave: (data: Partial<PastorRecommendation>) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: Partial<PastorRecommendation> = {
  pastor_name: '',
  scope_of_evaluation: '',
  year_level: '',
  evaluation_date: new Date().toISOString().split('T')[0],
  character_description: '',
  offense_committed: '',
  disobedience_patterns: '',
  character_strengths: '',
  jobspec_rating: '',
  jobspec_description: '',
  additional_notes: '',
};

export function PastorRecForm({ studentId, studentName, recommendation, onSave, onCancel }: PastorRecFormProps) {
  const [form, setForm] = useState<Partial<PastorRecommendation>>({ ...EMPTY, student_id: studentId });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setForm({ ...recommendation });
    } else {
      setForm({ ...EMPTY, student_id: studentId });
    }
  }, [recommendation, studentId]);

  const set = (key: keyof PastorRecommendation, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, student_id: studentId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
        <p className="font-bold text-gray-900">{studentName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Pastor's Name *</Label>
          <Input value={form.pastor_name || ''} onChange={(e) => set('pastor_name', e.target.value)} placeholder="Full name of the pastor" />
        </div>
        <div className="space-y-1">
          <Label>Scope of Evaluation</Label>
          <Input value={form.scope_of_evaluation || ''} onChange={(e) => set('scope_of_evaluation', e.target.value)} placeholder="e.g. Probationary" />
        </div>
        <div className="space-y-1">
          <Label>Year Level</Label>
          <Select value={form.year_level || ''} onValueChange={(v) => set('year_level', v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {YEAR_LEVELS.map((yl) => <SelectItem key={yl} value={yl}>{yl}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Evaluation Date</Label>
          <Input type="date" value={form.evaluation_date || ''} onChange={(e) => set('evaluation_date', e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="font-semibold">Character Description</Label>
        <p className="text-xs text-gray-500 mb-1">Describe the student in terms of how they relate to you, fellow staff, and members.</p>
        <Textarea rows={5} value={form.character_description || ''} onChange={(e) => set('character_description', e.target.value)} placeholder="Describe the student's character and relationships..." />
      </div>

      <div className="space-y-1">
        <Label className="font-semibold">Any Offense Committed?</Label>
        <Textarea rows={3} value={form.offense_committed || ''} onChange={(e) => set('offense_committed', e.target.value)} placeholder="Describe any offense, or write 'None'..." />
      </div>

      <div className="space-y-1">
        <Label className="font-semibold">Any Pattern of Disobedience / Misconduct?</Label>
        <Textarea rows={3} value={form.disobedience_patterns || ''} onChange={(e) => set('disobedience_patterns', e.target.value)} placeholder="Describe patterns, or write 'None'..." />
      </div>

      <div className="space-y-1">
        <Label className="font-semibold">Character Strengths Observed</Label>
        <Textarea rows={4} value={form.character_strengths || ''} onChange={(e) => set('character_strengths', e.target.value)} placeholder="Describe notable character strengths..." />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-bold text-gray-800 mb-3">Job Spec</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Performance Rating</Label>
            <Input value={form.jobspec_rating || ''} onChange={(e) => set('jobspec_rating', e.target.value)} placeholder="e.g. 10/10, Excellent..." />
          </div>
          <div className="space-y-1">
            <Label>Job Spec Description</Label>
            <Textarea rows={4} value={form.jobspec_description || ''} onChange={(e) => set('jobspec_description', e.target.value)} placeholder="How do you rate the student on their job spec performance?" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="font-semibold">Additional Notes</Label>
        <Textarea rows={3} value={form.additional_notes || ''} onChange={(e) => set('additional_notes', e.target.value)} placeholder="Any additional observations or recommendations..." />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !form.pastor_name}>
          {saving ? 'Saving...' : recommendation ? 'Update Recommendation' : 'Save Recommendation'}
        </Button>
      </div>
    </div>
  );
}
