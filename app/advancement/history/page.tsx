'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchAdvancementHistory, fetchSessions, fetchLevels } from '@/lib/advancement/service';
import { AdvancementDecision, AdvancementSession, MbsiLevel } from '@/lib/advancement/types';
import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/lib/advancement/constants';
import { OutcomeBadge } from '@/components/advancement/OutcomeBadge';
import { ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdvancementHistoryPage() {
  const [decisions, setDecisions] = useState<AdvancementDecision[]>([]);
  const [sessions, setSessions] = useState<AdvancementSession[]>([]);
  const [levels, setLevels] = useState<MbsiLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  useEffect(() => {
    Promise.all([fetchSessions(), fetchLevels()]).then(([sessionsData, levelsData]) => {
      setSessions(sessionsData);
      setLevels(levelsData);
    });
  }, []);

  useEffect(() => {
    loadHistory();
  }, [filterYear, filterOutcome, filterLevel]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchAdvancementHistory({
        academicYear: filterYear || undefined,
        outcome: filterOutcome || undefined,
        levelCode: filterLevel || undefined,
      });
      setDecisions(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Link href="/advancement" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Advancement
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Advancement History</h1>
            <p className="text-gray-500 text-sm mt-1">View all past deliberation records</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Filters:</span>
            </div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Academic Years</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.academic_year}>{s.academic_year}</option>
              ))}
            </select>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Outcomes</option>
              {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              {levels.filter((l) => !l.is_terminal).map((l) => (
                <option key={l.id} value={l.code}>{l.display_name}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : decisions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300">
              <p className="text-gray-500">No deliberation records found</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">{decisions.length} record(s) found</p>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Level</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {decisions.map((d) => {
                      const colors = OUTCOME_COLORS[d.outcome];
                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{d.student_name}</td>
                          <td className="px-4 py-3 text-gray-500">{d.metrics_snapshot?.academic_year || '-'}</td>
                          <td className="px-4 py-3">{d.current_level?.display_name || d.current_level_code}</td>
                          <td className="px-4 py-3">
                            <OutcomeBadge outcome={d.outcome} className="py-0.5" />
                          </td>
                          <td className="px-4 py-3">{d.target_level?.display_name || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{d.conditions || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {decisions.map((d) => {
                  const colors = OUTCOME_COLORS[d.outcome];
                  return (
                    <div key={d.id} className="border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{d.student_name}</p>
                        <OutcomeBadge outcome={d.outcome} className="py-0.5" />
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <p>Level: {d.current_level?.display_name || d.current_level_code} → {d.target_level?.display_name || '-'}</p>
                        <p>Year: {d.metrics_snapshot?.academic_year || '-'}</p>
                        {d.conditions && <p className="text-amber-700">Conditions: {d.conditions}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
