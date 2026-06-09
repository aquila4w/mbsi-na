'use client';

import { StudentWithRecords } from '@/lib/studentMetrics/types';
import { UserIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface StudentSummaryCardProps {
  student: StudentWithRecords;
  onClick: () => void;
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function StudentSummaryCard({ student, onClick }: StudentSummaryCardProps) {
  const t = student.totals;
  const latestRecord = student.records[student.records.length - 1];
  const carolingRate = t.years_count > 0 ? Math.round((t.caroling_goals_reached / t.years_count) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200 p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {student.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-black">{student.full_name}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              {student.date_entered && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarIcon className="w-3 h-3" />
                  Entered {new Date(student.date_entered).getFullYear()}
                </span>
              )}
              {latestRecord && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPinIcon className="w-3 h-3" />
                  {latestRecord.assignment || latestRecord.year_level}
                </span>
              )}
            </div>
          </div>
        </div>
        {latestRecord && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 font-medium shrink-0">
            {latestRecord.year_level}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-gray-50 p-2 text-center">
          <p className="text-lg font-bold text-gray-900">{t.guests.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Guests</p>
        </div>
        <div className="bg-blue-50 p-2 text-center">
          <p className="text-lg font-bold text-blue-900">{t.baptisms_total}</p>
          <p className="text-xs text-blue-600 mt-0.5">Baptisms</p>
        </div>
        <div className="bg-green-50 p-2 text-center">
          <p className="text-base font-bold text-green-900">{fmt$(t.thanksgiving_offering)}</p>
          <p className="text-xs text-green-600 mt-0.5">Thanksgiving</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-gray-50 p-2 text-center">
          <p className="text-lg font-bold text-gray-900">{t.converts}</p>
          <p className="text-xs text-gray-500 mt-0.5">Converts</p>
        </div>
        <div className="bg-purple-50 p-2 text-center">
          <p className="text-base font-bold text-purple-900">{fmt$(t.tithes)}</p>
          <p className="text-xs text-purple-600 mt-0.5">Tithes</p>
        </div>
        <div className="bg-gray-50 p-2 text-center">
          <p className="text-lg font-bold text-gray-900">{carolingRate}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Caroling</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{t.years_count} year{t.years_count !== 1 ? 's' : ''} of records</span>
        <span className="text-gray-400 group-hover:text-gray-700 transition-colors">View details →</span>
      </div>
    </button>
  );
}
