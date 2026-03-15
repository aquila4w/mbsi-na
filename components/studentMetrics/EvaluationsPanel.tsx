'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentEvaluation, PastorRecommendation, computeEvalScore, RATING_LABELS } from '@/lib/studentMetrics/types';
import {
  fetchEvaluations, createEvaluation, updateEvaluation, deleteEvaluation,
  fetchPastorRecommendations, createPastorRecommendation, updatePastorRecommendation, deletePastorRecommendation,
} from '@/lib/studentMetrics/service';
import { EvaluationForm } from './EvaluationForm';
import { PastorRecForm } from './PastorRecForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface EvaluationsPanelProps {
  studentId: string;
  studentName: string;
  canEdit: boolean;
}

function ScoreBadge({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-blue-100 text-blue-800' : pct >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 ${color}`}>
      {score}/{max} ({pct}%)
    </span>
  );
}

function EvalCard({ ev, onEdit, onDelete, canEdit }: { ev: StudentEvaluation; onEdit: () => void; onDelete: () => void; canEdit: boolean }) {
  const { total, max, pct, sectionScores } = computeEvalScore(ev);
  const hasMisconduct = ev.misconduct_gross_negligence || ev.misconduct_romantic_relationship ||
    ev.misconduct_laziness || ev.misconduct_tampering_records || ev.misconduct_mishandling_money || ev.misconduct_defiance || ev.misconduct_others;

  const radarData = Object.entries(sectionScores).map(([name, value]) => ({
    subject: name.split(' ')[0],
    fullName: name,
    score: Math.round(value * 20),
  }));

  return (
    <div className="border border-gray-200 bg-white hover:border-gray-300 transition-colors">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900">
              {new Date(ev.evaluation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              By <span className="font-medium text-gray-700">{ev.evaluator_name}</span>
              {ev.year_level && <> &middot; {ev.year_level}</>}
              {ev.church_assignment && <> &middot; {ev.church_assignment}</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ScoreBadge score={total} max={max} />
            {canEdit && (
              <div className="flex gap-1">
                <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
                  <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Delete">
                  <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Object.entries(sectionScores).map(([name, score]) => (
            <div key={name} className="bg-gray-50 p-2 text-center">
              <p className="text-xs text-gray-500 mb-1 leading-tight">{name.split(' ')[0]}</p>
              <div className="flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className={`w-1.5 h-4 ${n <= Math.round(score) ? 'bg-gray-800' : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs font-bold mt-1">{score.toFixed(1)}</p>
            </div>
          ))}
        </div>

        {max > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-100 h-2">
              <div className="bg-gray-900 h-2 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 shrink-0">{pct}% overall</span>
          </div>
        )}

        {hasMisconduct && (
          <div className="bg-red-50 border border-red-200 px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Misconduct Flagged</p>
            <div className="flex flex-wrap gap-1">
              {ev.misconduct_gross_negligence && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Gross Negligence</span>}
              {ev.misconduct_romantic_relationship && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Romantic Relationship</span>}
              {ev.misconduct_laziness && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Laziness</span>}
              {ev.misconduct_tampering_records && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Tampering of Records</span>}
              {ev.misconduct_mishandling_money && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Mishandling of Money</span>}
              {ev.misconduct_defiance && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">Defiance</span>}
              {ev.misconduct_others && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5">{ev.misconduct_others}</span>}
            </div>
            {ev.misconduct_description && <p className="text-xs text-red-600 mt-1">{ev.misconduct_description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function PastorRecCard({ rec, onEdit, onDelete, canEdit }: { rec: PastorRecommendation; onEdit: () => void; onDelete: () => void; canEdit: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 bg-white">
      <div className="p-4 flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-900">Pastor: {rec.pastor_name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {rec.scope_of_evaluation && <>{rec.scope_of_evaluation} &middot; </>}
            {rec.year_level && <>{rec.year_level} &middot; </>}
            {new Date(rec.evaluation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
          {rec.jobspec_rating && (
            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 font-medium">Job Spec: {rec.jobspec_rating}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <div className="flex gap-1">
              <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                <TrashIcon className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-gray-500 hover:text-gray-800 underline">
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {rec.character_description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Character</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{rec.character_description}</p>
            </div>
          )}
          {rec.offense_committed && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Offense</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{rec.offense_committed}</p>
            </div>
          )}
          {rec.character_strengths && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Strengths</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{rec.character_strengths}</p>
            </div>
          )}
          {rec.jobspec_description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Job Spec</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{rec.jobspec_description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EvaluationsPanel({ studentId, studentName, canEdit }: EvaluationsPanelProps) {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [pastorRecs, setPastorRecs] = useState<PastorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEvalDialog, setShowEvalDialog] = useState(false);
  const [editingEval, setEditingEval] = useState<StudentEvaluation | null>(null);
  const [showPastorDialog, setShowPastorDialog] = useState(false);
  const [editingPastor, setEditingPastor] = useState<PastorRecommendation | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evals, recs] = await Promise.all([
        fetchEvaluations(studentId),
        fetchPastorRecommendations(studentId),
      ]);
      setEvaluations(evals);
      setPastorRecs(recs);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleSaveEval = async (data: Partial<StudentEvaluation>) => {
    if (editingEval) {
      await updateEvaluation(editingEval.id, data);
    } else {
      await createEvaluation({ ...data, student_id: studentId });
    }
    setShowEvalDialog(false);
    load();
  };

  const handleDeleteEval = async (id: string) => {
    if (!confirm('Delete this evaluation? This cannot be undone.')) return;
    await deleteEvaluation(id);
    load();
  };

  const handleSavePastor = async (data: Partial<PastorRecommendation>) => {
    if (editingPastor) {
      await updatePastorRecommendation(editingPastor.id, data);
    } else {
      await createPastorRecommendation({ ...data, student_id: studentId });
    }
    setShowPastorDialog(false);
    load();
  };

  const handleDeletePastor = async (id: string) => {
    if (!confirm('Delete this recommendation? This cannot be undone.')) return;
    await deletePastorRecommendation(id);
    load();
  };

  const avgSectionScores = evaluations.length > 0
    ? (() => {
        const totals: Record<string, number[]> = { Character: [], Spiritual: [], 'Work Performance': [], 'Skill Development': [], 'Healthy Behaviors': [] };
        evaluations.forEach((ev) => {
          const s = computeEvalScore(ev).sectionScores;
          Object.entries(s).forEach(([k, v]) => { if (v > 0) totals[k].push(v); });
        });
        return Object.entries(totals).map(([subject, vals]) => ({
          subject: subject.split(' ')[0],
          fullSubject: subject,
          score: vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20) : 0,
        }));
      })()
    : [];

  return (
    <div>
      <Tabs defaultValue="periodic">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="border-b-0 bg-transparent p-0 gap-0 h-auto">
            <TabsTrigger value="periodic" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent">
              Periodic Evaluations {evaluations.length > 0 && <span className="ml-1.5 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">{evaluations.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="pastor" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent">
              Pastor's Recommendations {pastorRecs.length > 0 && <span className="ml-1.5 bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">{pastorRecs.length}</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="periodic">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Periodic Evaluations</h4>
            {canEdit && (
              <Button size="sm" onClick={() => { setEditingEval(null); setShowEvalDialog(true); }} className="flex items-center gap-1">
                <PlusIcon className="w-4 h-4" />
                Add Evaluation
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200">
              <StarIcon className="mx-auto w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No evaluations yet.</p>
              {canEdit && <p className="text-xs mt-1">Click "Add Evaluation" to create the first one.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {avgSectionScores.length > 0 && (
                <div className="bg-white border border-gray-200 p-4 mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Average Scores Across {evaluations.length} Evaluation{evaluations.length !== 1 ? 's' : ''}</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={avgSectionScores}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#1a1a1a" fill="#1a1a1a" fillOpacity={0.1} strokeWidth={2} />
                      <Tooltip formatter={(v: any, n: string, { payload }: any) => [`${v}%`, payload?.fullSubject || n]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {evaluations.map((ev) => (
                <EvalCard
                  key={ev.id}
                  ev={ev}
                  canEdit={canEdit}
                  onEdit={() => { setEditingEval(ev); setShowEvalDialog(true); }}
                  onDelete={() => handleDeleteEval(ev.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pastor">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pastor's Recommendations</h4>
            {canEdit && (
              <Button size="sm" onClick={() => { setEditingPastor(null); setShowPastorDialog(true); }} className="flex items-center gap-1">
                <PlusIcon className="w-4 h-4" />
                Add Recommendation
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : pastorRecs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200">
              <StarIcon className="mx-auto w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No pastor recommendations yet.</p>
              {canEdit && <p className="text-xs mt-1">Click "Add Recommendation" to create the first one.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {pastorRecs.map((rec) => (
                <PastorRecCard
                  key={rec.id}
                  rec={rec}
                  canEdit={canEdit}
                  onEdit={() => { setEditingPastor(rec); setShowPastorDialog(true); }}
                  onDelete={() => handleDeletePastor(rec.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showEvalDialog} onOpenChange={(v) => !v && setShowEvalDialog(false)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingEval ? 'Edit Evaluation' : 'New Periodic Evaluation'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <EvaluationForm
              studentId={studentId}
              studentName={studentName}
              evaluation={editingEval}
              onSave={handleSaveEval}
              onCancel={() => setShowEvalDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPastorDialog} onOpenChange={(v) => !v && setShowPastorDialog(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPastor ? "Edit Pastor's Recommendation" : "New Pastor's Recommendation"}</DialogTitle>
          </DialogHeader>
          <PastorRecForm
            studentId={studentId}
            studentName={studentName}
            recommendation={editingPastor}
            onSave={handleSavePastor}
            onCancel={() => setShowPastorDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
