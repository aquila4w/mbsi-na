'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  fetchSession,
  fetchSessionWithDecisions,
  fetchLevels,
  createDecisionsForSession,
  updateDecision,
  finalizeSession,
  applySession,
} from '@/lib/advancement/service';
import { AdvancementSession, AdvancementDecision, MbsiLevel } from '@/lib/advancement/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, SESSION_STATUS_INFO, TIER_INFO, sortLevels } from '@/lib/advancement/constants';
import { ArrowLeftIcon, CheckCircleIcon, LockClosedIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<AdvancementSession | null>(null);
  const [decisions, setDecisions] = useState<AdvancementDecision[]>([]);
  const [levels, setLevels] = useState<MbsiLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [populating, setPopulating] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [editingOutcome, setEditingOutcome] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const [sessionData, decisionsData, levelsData] = await Promise.all([
        fetchSession(sessionId),
        fetchSessionWithDecisions(sessionId),
        fetchLevels(),
      ]);
      setSession(sessionData);
      setDecisions(decisionsData);
      setLevels(levelsData);
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePopulate = async () => {
    setPopulating(true);
    try {
      const count = await createDecisionsForSession(sessionId);
      toast.success(`${count} students added to deliberation`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to populate students');
    } finally {
      setPopulating(false);
    }
  };

  const handleUpdateOutcome = async (decisionId: string, outcome: string, targetLevelId?: string, conditions?: string, remarks?: string) => {
    try {
      const update: any = { outcome };
      if (targetLevelId) update.target_level_id = targetLevelId;
      if (conditions !== undefined) update.conditions = conditions;
      if (remarks !== undefined) update.remarks = remarks;
      await updateDecision(decisionId, update);
      toast.success('Decision updated');
      setSelectedDecision(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update decision');
    }
  };

  const handleFinalize = async () => {
    if (!confirm('Are you sure you want to finalize this session? All decisions will be locked.')) return;
    try {
      await finalizeSession(sessionId);
      toast.success('Session finalized');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to finalize');
    }
  };

  const handleApply = async () => {
    if (!confirm('Are you sure you want to apply all advancements? This will update student levels and cannot be undone.')) return;
    try {
      await applySession(sessionId);
      toast.success('Advancements applied successfully');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply advancements');
    }
  };

  // Group decisions by current level tier
  const groupedDecisions = decisions.reduce((acc, d) => {
    const level = levels.find((l) => l.id === d.current_level_id);
    const tier = level?.tier || 'unknown';
    const tierOrder = level?.tier_order ?? 99;
    const key = `${tierOrder}-${tier}`;
    if (!acc[key]) acc[key] = { tier, tierOrder, level, decisions: [] };
    acc[key].decisions.push(d);
    return acc;
  }, {} as Record<string, { tier: string; tierOrder: number; level?: MbsiLevel; decisions: AdvancementDecision[] }>);

  const sortedGroups = Object.values(groupedDecisions).sort((a, b) => b.tierOrder - a.tierOrder);

  const isLocked = session?.status === 'finalized' || session?.status === 'applied';

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
        <DashboardLayout>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link href="/advancement" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Sessions
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {session?.title || `Deliberation ${session?.academic_year}`}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">AY {session?.academic_year}</span>
                  {session && (
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_INFO[session.status]?.color || ''}`}>
                      {SESSION_STATUS_INFO[session.status]?.label || session.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {session?.status === 'draft' && decisions.length === 0 && (
                  <button
                    onClick={handlePopulate}
                    disabled={populating}
                    className="inline-flex items-center px-4 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    {populating ? 'Loading Students...' : 'Populate Students'}
                  </button>
                )}
                {session?.status === 'draft' && decisions.length > 0 && (
                  <button
                    onClick={handleFinalize}
                    className="inline-flex items-center px-4 py-3 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    <LockClosedIcon className="w-4 h-4 mr-2" />
                    Finalize Session
                  </button>
                )}
                {session?.status === 'finalized' && (
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center px-4 py-3 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Apply Advancements
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          {decisions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {Object.entries(OUTCOME_LABELS).map(([key, label]) => {
                const count = decisions.filter((d) => d.outcome === key).length;
                const colors = OUTCOME_COLORS[key as keyof typeof OUTCOME_COLORS];
                return (
                  <div key={key} className={`p-3 border ${colors.border} ${colors.bg} text-center`}>
                    <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                    <p className={`text-xs ${colors.text} opacity-75`}>{label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grouped Students */}
          {decisions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300">
              <p className="text-gray-500">No students added yet</p>
              <p className="text-gray-400 text-sm mt-1">Click &quot;Populate Students&quot; to add all active students</p>
            </div>
          ) : (
            sortedGroups.map((group) => {
              const tierInfo = TIER_INFO[group.tier];
              // Within group, sort by level_order descending (highest first)
              const sorted = [...group.decisions].sort((a, b) => {
                const levelA = levels.find((l) => l.id === a.current_level_id);
                const levelB = levels.find((l) => l.id === b.current_level_id);
                return (levelB?.level_order || 0) - (levelA?.level_order || 0);
              });

              return (
                <div key={group.tier} className="border border-gray-200">
                  <div className={`px-4 py-3 ${tierInfo?.color || 'bg-gray-100'}`}>
                    <h2 className="font-bold text-sm uppercase tracking-wide">
                      {tierInfo?.label || group.tier} ({sorted.length} students)
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {sorted.map((decision) => {
                      const outcomeColors = OUTCOME_COLORS[decision.outcome];
                      const isEditing = selectedDecision === decision.id;
                      const targetLevel = levels.find((l) => l.id === decision.target_level_id);

                      return (
                        <div key={decision.id} className="p-4">
                          {/* Student Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{decision.student_name}</p>
                              <p className="text-xs text-gray-500">
                                {decision.current_level?.display_name || decision.current_level_code}
                                {decision.metrics_snapshot?.assignment && ` — ${decision.metrics_snapshot.assignment}`}
                              </p>
                              {/* Metrics highlights */}
                              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                {decision.metrics_snapshot?.baptisms_us + decision.metrics_snapshot?.baptisms_rrb_ph > 0 && (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700">Baptisms: {(decision.metrics_snapshot.baptisms_us || 0) + (decision.metrics_snapshot.baptisms_rrb_ph || 0)}</span>
                                )}
                                {decision.metrics_snapshot?.guests > 0 && (
                                  <span className="px-1.5 py-0.5 bg-green-50 text-green-700">Guests: {decision.metrics_snapshot.guests}</span>
                                )}
                                {decision.metrics_snapshot?.thanksgiving_offering > 0 && (
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700">TG: ${Number(decision.metrics_snapshot.thanksgiving_offering).toLocaleString()}</span>
                                )}
                                {decision.metrics_snapshot?.caroling_goal_reached && (
                                  <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700">Carol ✓</span>
                                )}
                              </div>
                            </div>

                            {/* Outcome Badge / Edit */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isEditing && !isLocked ? (
                                <div className="space-y-2 w-full sm:w-auto">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(OUTCOME_LABELS).map(([key, label]) => {
                                      const colors = OUTCOME_COLORS[key as keyof typeof OUTCOME_COLORS];
                                      const isSelected = editingOutcome === key;
                                      return (
                                        <button
                                          key={key}
                                          onClick={() => setEditingOutcome(key)}
                                          className={`px-2 py-1.5 text-xs font-medium border transition-colors ${colors.bg} ${colors.text} ${
                                            isSelected ? `${colors.border} border-2 font-bold` : `border-transparent hover:opacity-80`
                                          }`}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {editingOutcome && (
                                    <OutcomeForm
                                      outcome={editingOutcome}
                                      targetLevelId={decision.target_level_id}
                                      levels={levels}
                                      conditions={decision.conditions}
                                      remarks={decision.remarks}
                                      onSave={(data) => handleUpdateOutcome(decision.id, editingOutcome, data.targetLevelId, data.conditions, data.remarks)}
                                      onCancel={() => {
                                        setSelectedDecision(null);
                                        setEditingOutcome('');
                                      }}
                                    />
                                  )}
                                </div>
                              ) : (
                                <>
                                  <span className={`inline-block px-2 py-1 text-xs font-medium ${outcomeColors.bg} ${outcomeColors.text} ${outcomeColors.border} border`}>
                                    {OUTCOME_LABELS[decision.outcome]}
                                    {targetLevel && decision.outcome !== 'retained' && decision.outcome !== 'suspended' && decision.outcome !== 'expelled' && (
                                      <span className="ml-1 opacity-75">→ {targetLevel.display_name}</span>
                                    )}
                                  </span>
                                  {!isLocked && (
                                    <button
                                      onClick={() => {
                                        setSelectedDecision(decision.id);
                                        setEditingOutcome(decision.outcome);
                                      }}
                                      className="px-2 py-1 text-xs border border-gray-200 hover:border-black transition-colors"
                                    >
                                      Edit
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Conditions / Remarks display */}
                          {(decision.conditions || decision.remarks) && !isEditing && (
                            <div className="mt-2 pl-0 sm:pl-4 space-y-1">
                              {decision.conditions && (
                                <p className="text-xs text-amber-700 bg-amber-50 p-2">
                                  <span className="font-medium">Conditions:</span> {decision.conditions}
                                </p>
                              )}
                              {decision.remarks && (
                                <p className="text-xs text-gray-600 bg-gray-50 p-2">
                                  <span className="font-medium">Remarks:</span> {decision.remarks}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Inline outcome editing form
function OutcomeForm({
  outcome,
  targetLevelId,
  levels,
  conditions,
  remarks,
  onSave,
  onCancel,
}: {
  outcome: string;
  targetLevelId: string | null;
  levels: MbsiLevel[];
  conditions: string;
  remarks: string;
  onSave: (data: { targetLevelId: string; conditions: string; remarks: string }) => void;
  onCancel: () => void;
}) {
  const [targetId, setTargetId] = useState(targetLevelId || '');
  const [cond, setCond] = useState(conditions);
  const [rem, setRem] = useState(remarks);
  const [saving, setSaving] = useState(false);

  const needsConditions = outcome === 'conditional_1' || outcome === 'conditional_2';
  const needsTarget = ['advanced', 'conditional_1', 'conditional_2', 'graduated', 'honorable_discharge'].includes(outcome);

  const nonTerminalLevels = sortLevels(levels.filter((l) => !l.is_terminal));

  return (
    <div className="space-y-2 p-3 bg-gray-50 border border-gray-200">
      {needsTarget && (
        <div>
          <label className="block text-xs font-medium mb-1">Target Level</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs"
          >
            <option value="">Select level</option>
            {nonTerminalLevels.map((l) => (
              <option key={l.id} value={l.id}>{l.display_name}</option>
            ))}
            {levels.filter((l) => l.is_terminal).map((l) => (
              <option key={l.id} value={l.id}>{l.display_name}</option>
            ))}
          </select>
        </div>
      )}
      {needsConditions && (
        <div>
          <label className="block text-xs font-medium mb-1">Conditions *</label>
          <textarea
            value={cond}
            onChange={(e) => setCond(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 px-2 py-1.5 text-xs"
            placeholder="Enter conditions for this student..."
          />
        </div>
      )}
      <div>
        <label className="block text-xs font-medium mb-1">Remarks</label>
        <textarea
          value={rem}
          onChange={(e) => setRem(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 px-2 py-1.5 text-xs"
          placeholder="Additional remarks..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-gray-300 text-xs font-medium hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            setSaving(true);
            onSave({ targetLevelId: targetId, conditions: cond, remarks: rem });
            setSaving(false);
          }}
          disabled={saving || (needsConditions && !cond.trim())}
          className="flex-1 px-3 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
