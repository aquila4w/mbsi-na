'use client';

import { useState } from 'react';
import { StudentWithRecords, StudentMetricsRecord } from '@/lib/studentMetrics/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecordFormDialog } from './RecordFormDialog';
import { createRecord, updateRecord, deleteRecord } from '@/lib/studentMetrics/service';
import { PencilIcon, TrashIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface StudentRecordsGridProps {
  student: StudentWithRecords;
  onRefresh: () => void;
  canEdit: boolean;
}

function fmt$(n: number | null | undefined) {
  if (!n) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="flex items-center gap-1 text-green-700 font-medium text-xs"><CheckCircleIcon className="w-4 h-4" />Yes</span>
  ) : (
    <span className="flex items-center gap-1 text-gray-400 text-xs"><XCircleIcon className="w-4 h-4" />No</span>
  );
}

export function StudentRecordsGrid({ student, onRefresh, canEdit }: StudentRecordsGridProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentMetricsRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = async (data: Partial<StudentMetricsRecord>) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, data);
    } else {
      await createRecord({ ...data, student_id: student.id });
    }
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteRecord(id);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (record: StudentMetricsRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const t = student.totals;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Year-by-Year Records</h4>
        {canEdit && (
          <Button size="sm" onClick={openAdd} className="flex items-center gap-1">
            <PlusIcon className="w-4 h-4" />
            Add Record
          </Button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Year Level</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Year</th>
              <th className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Assignment</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Contacts</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Guests</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Baptisms (US)</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600">Baptisms (PH)</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Thanksgiving</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Evangelism</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Caroling Goal</th>
              <th className="text-right px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Goal Amt</th>
              <th className="text-center px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Leader</th>
              {canEdit && <th className="px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {student.records.map((r, i) => (
              <tr key={r.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <Badge variant="outline" className="text-xs font-normal">{r.year_level}</Badge>
                </td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{r.year || r.academic_year}</td>
                <td className="px-3 py-2 text-gray-600 max-w-[140px] truncate">{r.assignment || '-'}</td>
                <td className="px-3 py-2 text-right">{r.contacts > 0 ? r.contacts : '-'}</td>
                <td className="px-3 py-2 text-right font-medium">{r.guests > 0 ? r.guests : '-'}</td>
                <td className="px-3 py-2 text-right">{r.baptisms_us > 0 ? r.baptisms_us : '-'}</td>
                <td className="px-3 py-2 text-right">{r.baptisms_rrb_ph > 0 ? r.baptisms_rrb_ph : '-'}</td>
                <td className="px-3 py-2 text-right text-green-700 font-medium">{fmt$(r.thanksgiving_offering)}</td>
                <td className="px-3 py-2 text-right text-blue-700 font-medium">{fmt$(r.evangelism_offering)}</td>
                <td className="px-3 py-2 text-center"><YesNo value={r.caroling_goal_reached} /></td>
                <td className="px-3 py-2 text-right">{r.caroling_amount > 0 ? fmt$(r.caroling_amount) : '-'}</td>
                <td className="px-3 py-2 text-center"><YesNo value={r.caroling_leader} /></td>
                {canEdit && (
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {student.records.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 13 : 12} className="px-3 py-8 text-center text-gray-400 text-sm">
                  No records yet. {canEdit && 'Click "Add Record" to get started.'}
                </td>
              </tr>
            )}

            {student.records.length > 0 && (
              <tr className="bg-gray-900 text-white font-semibold border-t-2 border-gray-700">
                <td className="px-3 py-2" colSpan={3}>TOTAL</td>
                <td className="px-3 py-2 text-right">{t.contacts > 0 ? t.contacts : '-'}</td>
                <td className="px-3 py-2 text-right">{t.guests}</td>
                <td className="px-3 py-2 text-right">{t.baptisms_us > 0 ? t.baptisms_us : '-'}</td>
                <td className="px-3 py-2 text-right">{t.baptisms_rrb_ph > 0 ? t.baptisms_rrb_ph : '-'}</td>
                <td className="px-3 py-2 text-right text-green-300">{fmt$(t.thanksgiving_offering)}</td>
                <td className="px-3 py-2 text-right text-blue-300">{fmt$(t.evangelism_offering)}</td>
                <td className="px-3 py-2 text-center">{t.caroling_goals_reached}/{t.years_count}</td>
                <td className="px-3 py-2 text-right">{fmt$(t.caroling_total_goal)}</td>
                <td className="px-3 py-2 text-center">{t.caroling_leader_count}/{t.years_count}</td>
                {canEdit && <td />}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <RecordFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        record={editingRecord}
        studentId={student.id}
      />
    </div>
  );
}
