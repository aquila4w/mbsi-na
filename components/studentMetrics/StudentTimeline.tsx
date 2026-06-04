'use client';

import { useState } from 'react';
import { StudentTimelineData } from '@/lib/advancement/types';
import { OUTCOME_LABELS, OUTCOME_COLORS, TIER_INFO, ENROLLMENT_STATUS_INFO } from '@/lib/advancement/constants';
import { StudentYearCard } from './StudentYearCard';
import { useMediaQuery } from '@/hooks/use-media-query';

interface StudentTimelineProps {
  data: StudentTimelineData;
}

export function StudentTimeline({ data }: StudentTimelineProps) {
  const { student, enrollments, assignments, yearProfiles, decisions } = data;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  // Build timeline nodes from enrollments
  const timelineNodes = enrollments.map((enrollment) => {
    const level = enrollment.level;
    const yearProfile = yearProfiles.find((yp) => yp.enrollment_id === enrollment.id);
    const nodeAssignments = assignments.filter((a) => a.enrollment_id === enrollment.id);
    const decision = decisions.find((d) => d.enrollment_id === enrollment.id);

    return {
      enrollment,
      level,
      yearProfile,
      assignments: nodeAssignments,
      decision,
    };
  });

  const statusInfo = ENROLLMENT_STATUS_INFO[student.current_status] || ENROLLMENT_STATUS_INFO.enrolled;

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300">
        <p className="text-gray-500">No enrollment history yet</p>
        <p className="text-gray-400 text-sm mt-1">Enroll this student to start tracking their journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Status Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200">
        <div>
          <h3 className="font-bold">{student.full_name}</h3>
          <p className="text-xs text-gray-500">
            Entered: {student.date_entered ? new Date(student.date_entered).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <span className={`inline-block px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Timeline Visualization */}
      {isMobile ? (
        // Vertical Timeline (mobile)
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {timelineNodes.map((node, idx) => {
            const isExpanded = expandedNode === node.enrollment.id;
            const tierInfo = node.level ? TIER_INFO[node.level.tier] : null;
            const outcomeInfo = node.decision ? OUTCOME_COLORS[node.decision.outcome] : null;
            const isLast = idx === timelineNodes.length - 1;

            return (
              <div key={node.enrollment.id} className="relative mb-6">
                {/* Node dot */}
                <div
                  className={`absolute -left-4 w-4 h-4 rounded-full border-2 ${
                    node.enrollment.status === 'quit' || node.enrollment.status === 'expelled'
                      ? 'bg-red-400 border-red-500'
                      : isLast && node.enrollment.status !== 'graduated'
                      ? 'bg-green-400 border-green-500'
                      : 'bg-white border-gray-300'
                  }`}
                  style={{ top: '4px', transform: 'translateX(-50%)' }}
                ></div>

                {/* Gap indicator for re-entry */}
                {node.enrollment.re_entry_of && (
                  <div className="mb-2 px-2 py-1 bg-amber-50 border border-amber-200 text-xs text-amber-700 inline-block">
                    ↩ Re-enrolled
                  </div>
                )}

                {/* Node Card */}
                <div
                  className={`border border-gray-200 cursor-pointer hover:border-black transition-colors ${
                    isExpanded ? 'ring-1 ring-black' : ''
                  }`}
                  onClick={() => setExpandedNode(isExpanded ? null : node.enrollment.id)}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-semibold text-sm">{node.level?.display_name || 'Unknown Level'}</p>
                        <p className="text-xs text-gray-500">AY {node.enrollment.academic_year}</p>
                      </div>
                      {tierInfo && (
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Assignment location */}
                    {node.assignments.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        📍 {node.assignments[0].location}
                        {node.assignments[0].ministry_role && ` — ${node.assignments[0].ministry_role}`}
                      </p>
                    )}

                    {/* Outcome badge */}
                    {node.decision && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium ${outcomeInfo?.bg} ${outcomeInfo?.text}`}>
                          {OUTCOME_LABELS[node.decision.outcome]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <StudentYearCard node={node} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Horizontal Timeline (desktop/tablet)
        <div>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-0 min-w-max">
              {timelineNodes.map((node, idx) => {
                const isExpanded = expandedNode === node.enrollment.id;
                const tierInfo = node.level ? TIER_INFO[node.level.tier] : null;
                const outcomeInfo = node.decision ? OUTCOME_COLORS[node.decision.outcome] : null;
                const isLast = idx === timelineNodes.length - 1;

                return (
                  <div key={node.enrollment.id} className="flex items-start">
                    {/* Node + content */}
                    <div
                      className="w-48 flex-shrink-0 cursor-pointer group"
                      onClick={() => setExpandedNode(isExpanded ? null : node.enrollment.id)}
                    >
                      {/* Re-entry marker */}
                      {node.enrollment.re_entry_of && (
                        <div className="mb-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-xs text-amber-700 text-center">
                          ↩ Re-enrolled
                        </div>
                      )}

                      {/* Node dot + line */}
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            node.enrollment.status === 'quit' || node.enrollment.status === 'expelled'
                              ? 'bg-red-400 border-red-500'
                              : isLast && node.enrollment.status !== 'graduated'
                              ? 'bg-green-400 border-green-500'
                              : node.enrollment.status === 'graduated'
                              ? 'bg-purple-400 border-purple-500'
                              : 'bg-white border-gray-300 group-hover:border-black'
                          }`}
                        ></div>
                        {!isLast && <div className="flex-1 h-0.5 bg-gray-200"></div>}
                      </div>

                      {/* Card */}
                      <div
                        className={`p-3 border text-sm ${
                          isExpanded ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'
                        } transition-colors`}
                      >
                        <p className="font-semibold text-xs">{node.level?.display_name}</p>
                        <p className="text-xs text-gray-500">AY {node.enrollment.academic_year}</p>

                        {node.assignments.length > 0 && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            📍 {node.assignments[0].location}
                          </p>
                        )}

                        {node.decision && (
                          <span className={`inline-block mt-1 px-1.5 py-0.5 text-xs font-medium ${outcomeInfo?.bg} ${outcomeInfo?.text}`}>
                            {OUTCOME_LABELS[node.decision.outcome]}
                          </span>
                        )}

                        {tierInfo && (
                          <span className={`inline-block mt-1 px-1.5 py-0.5 text-xs ${tierInfo.color} ml-1`}>
                            {tierInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expanded year card below timeline */}
          {expandedNode && (() => {
            const node = timelineNodes.find((n) => n.enrollment.id === expandedNode);
            if (!node) return null;
            return <StudentYearCard node={node} />;
          })()}
        </div>
      )}

      {/* Place Assignments Timeline */}
      {assignments.length > 0 && (
        <div className="border border-gray-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-sm">Place Assignments</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {assignments.map((a) => (
                <div key={a.id} className={`p-3 border ${a.is_current ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-sm">{a.location}</p>
                    {a.is_current && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5">Current</span>
                    )}
                  </div>
                  {a.ministry_role && <p className="text-xs text-gray-600 mt-1">{a.ministry_role}</p>}
                  {a.supervisor_name && <p className="text-xs text-gray-500">Supervisor: {a.supervisor_name}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.assigned_from).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    {a.assigned_until
                      ? ` — ${new Date(a.assigned_until).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : ' — Present'}
                  </p>
                  {a.notes && <p className="text-xs text-gray-500 mt-1 italic">{a.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
