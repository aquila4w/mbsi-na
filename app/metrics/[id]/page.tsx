'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StudentWithRecords } from '@/lib/studentMetrics/types';
import { fetchStudentWithRecords } from '@/lib/studentMetrics/service';
import { StudentRecordsGrid } from '@/components/studentMetrics/StudentRecordsGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function StudentMetricsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [student, setStudent] = useState<StudentWithRecords | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = profile?.role === 'admin' || profile?.role === 'teacher' || profile?.role === 'ta';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStudentWithRecords(id);
      setStudent(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const chartData = student?.records.map((r) => ({
    year: r.year || r.academic_year,
    Guests: r.guests,
    Baptisms: (r.baptisms_us || 0) + (r.baptisms_rrb_ph || 0),
    'Thanksgiving ($)': Math.round(r.thanksgiving_offering || 0),
    'Evangelism ($)': Math.round(r.evangelism_offering || 0),
  })) || [];

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
      <DashboardLayout>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
          </div>
        ) : !student ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Student not found.</p>
            <Link href="/metrics">
              <Button variant="outline" className="mt-4">Back to Metrics</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/metrics">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" />
                  All Students
                </button>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-white text-lg font-bold">
                      {student.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{student.full_name}</h1>
                    <div className="flex items-center gap-4 mt-1">
                      {student.date_entered && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          Entered {new Date(student.date_entered).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                      {student.records.length > 0 && student.records[student.records.length - 1].assignment && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPinIcon className="w-4 h-4" />
                          {student.records[student.records.length - 1].assignment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-gray-100">
                {[
                  { label: 'Total Guests', value: student.totals.guests.toLocaleString(), color: '' },
                  { label: 'Total Baptisms', value: student.totals.baptisms_total, color: 'text-blue-700' },
                  { label: 'Contacts', value: student.totals.contacts > 0 ? student.totals.contacts.toLocaleString() : '-', color: '' },
                  { label: 'Thanksgiving', value: fmt$(student.totals.thanksgiving_offering), color: 'text-green-700' },
                  { label: 'Evangelism', value: fmt$(student.totals.evangelism_offering), color: 'text-blue-700' },
                  { label: 'Caroling Rate', value: student.totals.years_count > 0 ? `${Math.round((student.totals.caroling_goals_reached / student.totals.years_count) * 100)}%` : '-', color: '' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="bg-white border border-gray-200 p-6">
                <h2 className="text-lg font-bold mb-4">Year-by-Year Performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Guests & Baptisms</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Guests" fill="#374151" />
                        <Bar dataKey="Baptisms" fill="#0369a1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Offerings</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => fmt$(Number(v))} />
                        <Legend />
                        <Bar dataKey="Thanksgiving ($)" fill="#1a1a1a" />
                        <Bar dataKey="Evangelism ($)" fill="#6b7280" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 p-6">
              <StudentRecordsGrid student={student} onRefresh={load} canEdit={canEdit} />
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
