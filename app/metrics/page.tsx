'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StudentWithRecords } from '@/lib/studentMetrics/types';
import { fetchAllStudentsWithRecords, createStudent, updateStudent, deleteStudent } from '@/lib/studentMetrics/service';
import { StudentSummaryCard } from '@/components/studentMetrics/StudentSummaryCard';
import { StudentFormDialog } from '@/components/studentMetrics/StudentFormDialog';
import { MetricsAnalytics } from '@/components/studentMetrics/MetricsAnalytics';
import { StudentMetricsStudent } from '@/lib/studentMetrics/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function MetricsPage() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentWithRecords[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentMetricsStudent | null>(null);

  const canEdit = profile?.role === 'admin' || profile?.role === 'teacher' || profile?.role === 'ta';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllStudentsWithRecords();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = students.filter((s) =>
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveStudent = async (data: Partial<StudentMetricsStudent>) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    } else {
      await createStudent(data);
    }
    load();
  };

  const handleDeleteStudent = async (s: StudentWithRecords) => {
    if (!confirm(`Delete ${s.full_name} and all their records? This cannot be undone.`)) return;
    await deleteStudent(s.id);
    load();
  };

  const openEditStudent = (s: StudentMetricsStudent) => {
    setEditingStudent(s);
    setShowStudentForm(true);
  };

  const totals = students.reduce(
    (acc, s) => ({
      guests: acc.guests + s.totals.guests,
      baptisms: acc.baptisms + s.totals.baptisms_total,
      thanksgiving: acc.thanksgiving + s.totals.thanksgiving_offering,
      evangelism: acc.evangelism + s.totals.evangelism_offering,
    }),
    { guests: 0, baptisms: 0, thanksgiving: 0, evangelism: 0 }
  );

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Student Metrics</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Track missionary performance — guests, baptisms, offerings, and caroling across all years
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={() => { setEditingStudent(null); setShowStudentForm(true); }}
                className="flex items-center gap-2 shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
                Add Student
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: students.length, icon: UserGroupIcon, color: 'bg-gray-900 text-white' },
              { label: 'Total Guests', value: totals.guests.toLocaleString(), icon: UserGroupIcon, color: 'bg-gray-100' },
              { label: 'Total Baptisms', value: totals.baptisms, icon: ChartBarIcon, color: 'bg-blue-50 text-blue-900' },
              { label: 'Total Thanksgiving', value: fmt$(totals.thanksgiving), icon: ChartBarIcon, color: 'bg-green-50 text-green-900' },
            ].map((stat) => (
              <div key={stat.label} className={`p-4 border border-gray-200 ${stat.color}`}>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="students">
            <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto gap-0">
              <TabsTrigger
                value="students"
                className="px-5 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="px-5 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-6">
              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <UserGroupIcon className="mx-auto w-12 h-12 mb-3 opacity-30" />
                  <p>{search ? 'No students match your search.' : 'No students yet.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((s) => (
                    <div key={s.id} className="relative group">
                      <Link href={`/metrics/${s.id}`}>
                        <StudentSummaryCard student={s} onClick={() => {}} />
                      </Link>
                      {canEdit && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.preventDefault(); openEditStudent(s); }}
                            className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded shadow-sm"
                            title="Edit student"
                          >
                            <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); handleDeleteStudent(s); }}
                            className="p-1.5 bg-white border border-gray-200 hover:bg-red-50 rounded shadow-sm"
                            title="Delete student"
                          >
                            <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
                </div>
              ) : (
                <div className="bg-white border border-gray-200 p-6">
                  <MetricsAnalytics students={students} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <StudentFormDialog
          open={showStudentForm}
          onClose={() => setShowStudentForm(false)}
          onSave={handleSaveStudent}
          student={editingStudent}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
