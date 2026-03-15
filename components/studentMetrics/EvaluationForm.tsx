'use client';

import { useState, useEffect } from 'react';
import { StudentEvaluation, YEAR_LEVELS, RATING_LABELS } from '@/lib/studentMetrics/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EvaluationFormProps {
  studentId: string;
  studentName: string;
  evaluation?: StudentEvaluation | null;
  onSave: (data: Partial<StudentEvaluation>) => Promise<void>;
  onCancel: () => void;
}

const EMPTY_EVAL: Partial<StudentEvaluation> = {
  evaluation_date: new Date().toISOString().split('T')[0],
  evaluator_name: '',
  church_assignment: '',
  scope_of_evaluation: '',
  year_level: '',

  char_loyal_respectful: null,
  char_adaptable_resilient: null,
  char_creative_resourceful: null,
  char_empathic_compassionate: null,
  char_neat_proper: null,
  char_comments: '',

  spirit_biblical_proficiency: null,
  spirit_doctrinal_competency: null,
  spirit_depth_in_prayer: null,
  spirit_soul_winning: null,
  spirit_financial_stewardship: null,
  spirit_guests: 0,
  spirit_baptisms: 0,
  spirit_converts_retention: 0,
  spirit_thanksgiving_amount: 0,
  spirit_caroling_amount: 0,
  spirit_evangelism_offering: 0,
  spirit_missionary_offering: 0,
  spirit_comments: '',

  work_accountable_responsible: null,
  work_productivity_excellence: null,
  work_initiative: null,
  work_cooperative: null,
  work_timely: null,
  work_comments: '',

  skill_leadership: null,
  skill_interpersonal: null,
  skill_communication: null,
  skill_organizational: null,
  skill_technical: null,
  skill_comments: '',

  health_physical: null,
  health_emotional: null,
  health_mental: null,
  health_relational: null,
  health_comments: '',

  misconduct_gross_negligence: false,
  misconduct_romantic_relationship: false,
  misconduct_laziness: false,
  misconduct_tampering_records: false,
  misconduct_mishandling_money: false,
  misconduct_defiance: false,
  misconduct_others: '',
  misconduct_description: '',
};

function RatingSelector({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-gray-800 mb-0.5">{label}</p>
      <p className="text-xs text-gray-500 mb-2 leading-relaxed">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 text-sm font-medium border transition-all ${
              value === n
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
            }`}
          >
            <span className="block text-base font-bold">{n}</span>
            <span className="block text-[10px] leading-tight mt-0.5">{RATING_LABELS[n]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ letter, title }: { letter: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
      <div className="w-8 h-8 bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
        {letter}
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
    </div>
  );
}

export function EvaluationForm({ studentId, studentName, evaluation, onSave, onCancel }: EvaluationFormProps) {
  const [form, setForm] = useState<Partial<StudentEvaluation>>({ ...EMPTY_EVAL, student_id: studentId });
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sections = ['Header', 'Character', 'Spiritual', 'Work', 'Skills', 'Health', 'Misconduct'];

  useEffect(() => {
    if (evaluation) {
      setForm({ ...evaluation });
    } else {
      setForm({ ...EMPTY_EVAL, student_id: studentId });
    }
    setActiveSection(0);
  }, [evaluation, studentId]);

  const set = (key: keyof StudentEvaluation, value: any) =>
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
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 shrink-0">
        {sections.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSection(i)}
            className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border transition-all shrink-0 ${
              activeSection === i
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeSection === 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 px-4 py-3 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
              <p className="font-bold text-gray-900">{studentName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Evaluation Date *</Label>
                <Input type="date" value={form.evaluation_date || ''} onChange={(e) => set('evaluation_date', e.target.value)} />
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
              <div className="col-span-2 space-y-1">
                <Label>Evaluator Name (Minister / Area Leader) *</Label>
                <Input value={form.evaluator_name || ''} onChange={(e) => set('evaluator_name', e.target.value)} placeholder="Name of evaluator" />
              </div>
              <div className="space-y-1">
                <Label>Church Assignment</Label>
                <Input value={form.church_assignment || ''} onChange={(e) => set('church_assignment', e.target.value)} placeholder="e.g. South Bay, CA" />
              </div>
              <div className="space-y-1">
                <Label>Scope of Evaluation</Label>
                <Input value={form.scope_of_evaluation || ''} onChange={(e) => set('scope_of_evaluation', e.target.value)} placeholder="e.g. Probationary, Annual" />
              </div>
            </div>
          </div>
        )}

        {activeSection === 1 && (
          <div>
            <SectionHeader letter="A" title="Character Development" />
            <p className="text-xs text-gray-400 mb-4">Scale: 1 = Very Poor, 2 = Poor, 3 = Good, 4 = Very Good, 5 = Excellent</p>
            <RatingSelector label="1. Loyal and Respectful" description="Demonstrates loyalty to the Goodman of the House, Church leaders, Church organization and Bible School institution." value={form.char_loyal_respectful ?? null} onChange={(v) => set('char_loyal_respectful', v)} />
            <RatingSelector label="2. Adaptable and Resilient" description="Accepts changes and challenges in a situation, even when under pressure." value={form.char_adaptable_resilient ?? null} onChange={(v) => set('char_adaptable_resilient', v)} />
            <RatingSelector label="3. Creative and Resourceful" description="Creates methods outside the box, innovates systems for church growth." value={form.char_creative_resourceful ?? null} onChange={(v) => set('char_creative_resourceful', v)} />
            <RatingSelector label="4. Empathic and Compassionate" description="Displays care to others (leaders, students, members) leading to edification and redemptive relationships." value={form.char_empathic_compassionate ?? null} onChange={(v) => set('char_empathic_compassionate', v)} />
            <RatingSelector label="5. Neat and Proper" description="Maintains clean hygiene, appropriate attire, orderly workspace and not excessive in belongings." value={form.char_neat_proper ?? null} onChange={(v) => set('char_neat_proper', v)} />
            <div className="space-y-1 mt-4">
              <Label>Comments</Label>
              <Textarea rows={3} value={form.char_comments || ''} onChange={(e) => set('char_comments', e.target.value)} placeholder="Additional comments on character development..." />
            </div>
          </div>
        )}

        {activeSection === 2 && (
          <div>
            <SectionHeader letter="B" title="Spiritual Development" />
            <p className="text-xs text-gray-400 mb-4">Scale: 1 = Very Poor, 2 = Poor, 3 = Good, 4 = Very Good, 5 = Excellent</p>
            <RatingSelector label="1. Biblical Proficiency" description="Completes bible reading assignment daily and utilizes apostolic teachings in ministry and pastoral care; in good academic standing." value={form.spirit_biblical_proficiency ?? null} onChange={(v) => set('spirit_biblical_proficiency', v)} />
            <RatingSelector label="2. Doctrinal Competency" description="Articulates essential and distinctive doctrines in a mastery level; in good academic standing." value={form.spirit_doctrinal_competency ?? null} onChange={(v) => set('spirit_doctrinal_competency', v)} />
            <RatingSelector label="3. Depth in Prayer" description="Attends all devotion services; develops intense and long prayers." value={form.spirit_depth_in_prayer ?? null} onChange={(v) => set('spirit_depth_in_prayer', v)} />
            <RatingSelector label="4. Soul Winning" description="Engages in evangelism daily, gets contacts daily, brings guests for worship weekly and gets someone baptized weekly." value={form.spirit_soul_winning ?? null} onChange={(v) => set('spirit_soul_winning', v)} />

            <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-200 p-3 mb-4">
              {[
                { label: 'Guests', key: 'spirit_guests' as keyof StudentEvaluation },
                { label: 'Baptisms', key: 'spirit_baptisms' as keyof StudentEvaluation },
                { label: 'Converts / Retention', key: 'spirit_converts_retention' as keyof StudentEvaluation },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input type="number" min={0} value={(form[key] as number) ?? 0} onChange={(e) => set(key, parseInt(e.target.value) || 0)} />
                </div>
              ))}
            </div>

            <RatingSelector label="5. Financial Stewardship" description="Demonstrates increasing amount in giving; generates income through evangelism, solicitation, or fundraising." value={form.spirit_financial_stewardship ?? null} onChange={(v) => set('spirit_financial_stewardship', v)} />

            <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-200 p-3 mb-4">
              {[
                { label: 'Thanksgiving Amount ($)', key: 'spirit_thanksgiving_amount' as keyof StudentEvaluation },
                { label: 'Caroling Amount ($)', key: 'spirit_caroling_amount' as keyof StudentEvaluation },
                { label: 'Evangelism Offering ($)', key: 'spirit_evangelism_offering' as keyof StudentEvaluation },
                { label: 'Missionary Offering ($)', key: 'spirit_missionary_offering' as keyof StudentEvaluation },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input type="number" min={0} step="0.01" value={(form[key] as number) ?? 0} onChange={(e) => set(key, parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label>Comments</Label>
              <Textarea rows={3} value={form.spirit_comments || ''} onChange={(e) => set('spirit_comments', e.target.value)} placeholder="Additional comments on spiritual development..." />
            </div>
          </div>
        )}

        {activeSection === 3 && (
          <div>
            <SectionHeader letter="C" title="Work Performance" />
            <p className="text-xs text-gray-400 mb-4">Scale: 1 = Very Poor, 2 = Poor, 3 = Good, 4 = Very Good, 5 = Excellent</p>
            <RatingSelector label="1. Accountable and Responsible" description="Obeys directives of Church leaders, implements duties, and makes sound judgements." value={form.work_accountable_responsible ?? null} onChange={(v) => set('work_accountable_responsible', v)} />
            <RatingSelector label="2. Productivity and Excellence" description="Executes plans with excellence; proves not to be negligent in tasks given." value={form.work_productivity_excellence ?? null} onChange={(v) => set('work_productivity_excellence', v)} />
            <RatingSelector label="3. Initiative" description="Initiates duties independently and efficiently." value={form.work_initiative ?? null} onChange={(v) => set('work_initiative', v)} />
            <RatingSelector label="4. Cooperative" description="Acts as a team player; acts as an asset and contributes in building up the team." value={form.work_cooperative ?? null} onChange={(v) => set('work_cooperative', v)} />
            <RatingSelector label="5. Timely" description="Manages time in attendance, submission of assignments and job specs." value={form.work_timely ?? null} onChange={(v) => set('work_timely', v)} />
            <div className="space-y-1 mt-4">
              <Label>Comments</Label>
              <Textarea rows={3} value={form.work_comments || ''} onChange={(e) => set('work_comments', e.target.value)} placeholder="Additional comments on work performance..." />
            </div>
          </div>
        )}

        {activeSection === 4 && (
          <div>
            <SectionHeader letter="D" title="Skill Development" />
            <p className="text-xs text-gray-400 mb-4">Scale: 1 = Very Poor, 2 = Poor, 3 = Good, 4 = Very Good, 5 = Excellent</p>
            <RatingSelector label="1. Leadership Skill" description="Follows leadership of the Apostle in expanding church mission; possesses qualities of a leader in directing, planning and managing." value={form.skill_leadership ?? null} onChange={(v) => set('skill_leadership', v)} />
            <RatingSelector label="2. Interpersonal Skill" description="Interacts in a diverse community without social biases; influences others to a 4th Watch lifestyle." value={form.skill_interpersonal ?? null} onChange={(v) => set('skill_interpersonal', v)} />
            <RatingSelector label="3. Communication Skill" description="Gives messages clearly, responds to other's messages promptly and appropriately whether verbal, non-verbal, or virtual." value={form.skill_communication ?? null} onChange={(v) => set('skill_communication', v)} />
            <RatingSelector label="4. Organizational Skill" description="Performs orderly management and strategies." value={form.skill_organizational ?? null} onChange={(v) => set('skill_organizational', v)} />
            <RatingSelector label="5. Technical Skill" description="Proficient in technological advances, church equipments, and tools relevant to ministry." value={form.skill_technical ?? null} onChange={(v) => set('skill_technical', v)} />
            <div className="space-y-1 mt-4">
              <Label>Comments</Label>
              <Textarea rows={3} value={form.skill_comments || ''} onChange={(e) => set('skill_comments', e.target.value)} placeholder="Additional comments on skill development..." />
            </div>
          </div>
        )}

        {activeSection === 5 && (
          <div>
            <SectionHeader letter="E" title="Healthy Behaviors" />
            <p className="text-xs text-gray-400 mb-4">Scale: 1 = Very Poor, 2 = Poor, 3 = Good, 4 = Very Good, 5 = Excellent</p>
            <RatingSelector label="A. Physical Wellness" description="Engages in physical activity or exercise, maintains healthy diet, and keeping routine health exams." value={form.health_physical ?? null} onChange={(v) => set('health_physical', v)} />
            <RatingSelector label="B. Emotional Wellness" description="Handles stress/pressure effectively in problematic situations and recovers with positive outcomes; acknowledges help if needed." value={form.health_emotional ?? null} onChange={(v) => set('health_emotional', v)} />
            <RatingSelector label="C. Mental Wellness" description="Focus-minded, goal-oriented and not distracted." value={form.health_mental ?? null} onChange={(v) => set('health_mental', v)} />
            <RatingSelector label="D. Relational Wellness" description="Shows deference to leaders and gives respect to peers; relates well with others." value={form.health_relational ?? null} onChange={(v) => set('health_relational', v)} />
            <div className="space-y-1 mt-4">
              <Label>Comments</Label>
              <Textarea rows={3} value={form.health_comments || ''} onChange={(e) => set('health_comments', e.target.value)} placeholder="Additional comments on healthy behaviors..." />
            </div>
          </div>
        )}

        {activeSection === 6 && (
          <div>
            <SectionHeader letter="F" title="Non-compliance / Misconduct" />
            <p className="text-sm text-gray-600 mb-4">Non-compliance to code of conduct of MBSI will be investigated:</p>
            <div className="space-y-2 mb-5">
              {[
                { key: 'misconduct_gross_negligence' as keyof StudentEvaluation, label: 'Gross Negligence' },
                { key: 'misconduct_romantic_relationship' as keyof StudentEvaluation, label: 'Romantic Relationship' },
                { key: 'misconduct_laziness' as keyof StudentEvaluation, label: 'Laziness' },
                { key: 'misconduct_tampering_records' as keyof StudentEvaluation, label: 'Tampering of Records' },
                { key: 'misconduct_mishandling_money' as keyof StudentEvaluation, label: 'Mishandling of Money' },
                { key: 'misconduct_defiance' as keyof StudentEvaluation, label: 'Defiance' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-black"
                    checked={!!(form[key] as boolean)}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-1 mb-4">
              <Label>Others</Label>
              <Input value={form.misconduct_others || ''} onChange={(e) => set('misconduct_others', e.target.value)} placeholder="Specify other misconduct..." />
            </div>
            <div className="space-y-1">
              <Label>Describe Incident(s)</Label>
              <Textarea rows={5} value={form.misconduct_description || ''} onChange={(e) => set('misconduct_description', e.target.value)} placeholder="Describe the incident(s) in detail..." />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 shrink-0">
        <div className="flex gap-2">
          {activeSection > 0 && (
            <Button variant="outline" onClick={() => setActiveSection((s) => s - 1)} size="sm">Back</Button>
          )}
          {activeSection < sections.length - 1 && (
            <Button onClick={() => setActiveSection((s) => s + 1)} size="sm">Next</Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.evaluator_name}>
            {saving ? 'Saving...' : evaluation ? 'Update Evaluation' : 'Save Evaluation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
