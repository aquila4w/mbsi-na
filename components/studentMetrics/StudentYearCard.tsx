'use client';

import { OUTCOME_LABELS, OUTCOME_COLORS } from '@/lib/advancement/constants';
import { MbsiLevel, StudentEnrollment, StudentPlaceAssignment, StudentYearProfile, AdvancementDecision } from '@/lib/advancement/types';

interface TimelineNode {
  enrollment: StudentEnrollment & { level?: MbsiLevel };
  level?: MbsiLevel;
  yearProfile?: StudentYearProfile & { level?: MbsiLevel };
  assignments: StudentPlaceAssignment[];
  decision?: AdvancementDecision & { current_level?: MbsiLevel; target_level?: MbsiLevel };
}

export function StudentYearCard({ node }: { node: TimelineNode }) {
  const { enrollment, level, yearProfile, assignments, decision } = node;
  const outcomeInfo = decision ? OUTCOME_COLORS[decision.outcome] : null;

  return (
    <div className="border border-gray-200 mt-3 bg-white">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm">{level?.display_name || 'Unknown Level'}</h4>
          <p className="text-xs text-gray-500">
            AY {enrollment.academic_year} • Status: <span className="capitalize">{enrollment.status}</span>
          </p>
        </div>
        {decision && (
          <span className={`inline-block px-3 py-1 text-xs font-medium ${outcomeInfo?.bg} ${outcomeInfo?.text} ${outcomeInfo?.border} border`}>
            {OUTCOME_LABELS[decision.outcome]}
            {decision.target_level && ` → ${decision.target_level.display_name}`}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Place Assignment */}
        {assignments.length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Place Assignment</h5>
            {assignments.map((a) => (
              <div key={a.id} className="text-sm space-y-0.5">
                <p><span className="font-medium">Location:</span> {a.location}</p>
                {a.ministry_role && <p><span className="font-medium">Role:</span> {a.ministry_role}</p>}
                {a.supervisor_name && <p><span className="font-medium">Supervisor:</span> {a.supervisor_name}</p>}
                <p className="text-gray-500 text-xs">
                  {new Date(a.assigned_from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  {a.assigned_until ? ` — ${new Date(a.assigned_until).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' — Present'}
                </p>
                {a.notes && <p className="text-gray-600 text-xs italic">{a.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Year Profile Attributes */}
        {yearProfile && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Year Profile</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {yearProfile.academics && (
                <div><span className="font-medium text-xs text-gray-500 block">Academics</span><p className="text-xs">{yearProfile.academics}</p></div>
              )}
              {yearProfile.spirituality && (
                <div><span className="font-medium text-xs text-gray-500 block">Spirituality</span><p className="text-xs">{yearProfile.spirituality}</p></div>
              )}
              {yearProfile.jobspec_ministries && (
                <div><span className="font-medium text-xs text-gray-500 block">Job Spec / Ministries</span><p className="text-xs">{yearProfile.jobspec_ministries}</p></div>
              )}
              {yearProfile.ministerial_proficiency && (
                <div><span className="font-medium text-xs text-gray-500 block">Ministerial Proficiency</span><p className="text-xs">{yearProfile.ministerial_proficiency}</p></div>
              )}
              {yearProfile.character_summary && (
                <div><span className="font-medium text-xs text-gray-500 block">Character</span><p className="text-xs">{yearProfile.character_summary}</p></div>
              )}
              {yearProfile.achievements_ranking && (
                <div><span className="font-medium text-xs text-gray-500 block">Achievements</span><p className="text-xs">{yearProfile.achievements_ranking}</p></div>
              )}
              {yearProfile.faculty_recommendation && (
                <div><span className="font-medium text-xs text-gray-500 block">Faculty Recommendation</span><p className="text-xs">{yearProfile.faculty_recommendation}</p></div>
              )}
              {yearProfile.faculty_remarks && (
                <div><span className="font-medium text-xs text-gray-500 block">Faculty Remarks</span><p className="text-xs">{yearProfile.faculty_remarks}</p></div>
              )}
            </div>
          </div>
        )}

        {/* Metrics Snapshot */}
        {decision?.metrics_snapshot && Object.keys(decision.metrics_snapshot).length > 0 && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Performance Metrics</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetricBadge label="Baptisms" value={(decision.metrics_snapshot.baptisms_us || 0) + (decision.metrics_snapshot.baptisms_rrb_ph || 0)} />
              <MetricBadge label="Guests" value={decision.metrics_snapshot.guests} />
              <MetricBadge label="Contacts" value={decision.metrics_snapshot.contacts} />
              <MetricBadge label="Thanksgiving" value={`$${Number(decision.metrics_snapshot.thanksgiving_offering || 0).toLocaleString()}`} />
              <MetricBadge label="Evangelism" value={`$${Number(decision.metrics_snapshot.evangelism_offering || 0).toLocaleString()}`} />
              <MetricBadge label="Caroling" value={decision.metrics_snapshot.caroling_goal_reached ? '✓ Goal' : `$${Number(decision.metrics_snapshot.caroling_amount || 0).toLocaleString()}`} />
            </div>
          </div>
        )}

        {/* Advancement Decision Details */}
        {decision && (decision.conditions || decision.remarks) && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Advancement Details</h5>
            {decision.conditions && (
              <div className="p-2 bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-2">
                <span className="font-medium">Conditions:</span> {decision.conditions}
              </div>
            )}
            {decision.remarks && (
              <div className="p-2 bg-gray-50 border border-gray-200 text-xs text-gray-700">
                <span className="font-medium">Remarks:</span> {decision.remarks}
              </div>
            )}
          </div>
        )}

        {/* Admin Notes */}
        {enrollment.admin_notes && (
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Admin Notes</h5>
            <p className="text-xs text-gray-600">{enrollment.admin_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-2 bg-gray-50 border border-gray-100 text-center">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
