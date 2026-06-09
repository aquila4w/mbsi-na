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
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ChartBarIcon, UserGroupIcon, Squares2X2Icon, QueueListIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [secondarySort, setSecondarySort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string, shiftKey: boolean) => {
    if (shiftKey && sort) {
      // Shift+Click: set or toggle secondary sort
      setSecondarySort((prev) => {
        if (prev && prev.key === key) {
          if (prev.dir === 'desc') return { key, dir: 'asc' };
          return null; // third click clears secondary
        }
        return { key, dir: 'desc' };
      });
    } else {
      // Normal click: set primary sort, clear secondary
      setSort((prev) => {
        if (!prev || prev.key !== key) return { key, dir: 'desc' };
        if (prev.dir === 'desc') return { key, dir: 'asc' };
        return null; // third click clears
      });
      setSecondarySort(null);
    }
  };

  const getSortValue = (s: StudentWithRecords, key: string): string | number => {
    const latest = s.records[s.records.length - 1];
    switch (key) {
      case 'name': return s.full_name.toLowerCase();
      case 'level': return latest?.year_level?.toLowerCase() || '';
      case 'assignment': return latest?.assignment?.toLowerCase() || '';
      case 'guests': return s.totals.guests;
      case 'baptisms': return s.totals.baptisms_total;
      case 'converts': return s.totals.converts;
      case 'thanksgiving': return s.totals.thanksgiving_offering;
      case 'tithes': return s.totals.tithes;
      case 'years': return s.totals.years_count;
      default: return '';
    }
  };

  const applySorting = (data: StudentWithRecords[]) => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const aVal = getSortValue(a, sort.key);
      const bVal = getSortValue(b, sort.key);
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      if (cmp !== 0) return sort.dir === 'asc' ? cmp : -cmp;
      if (secondarySort) {
        const a2 = getSortValue(a, secondarySort.key);
        const b2 = getSortValue(b, secondarySort.key);
        const cmp2 = a2 < b2 ? -1 : a2 > b2 ? 1 : 0;
        return secondarySort.dir === 'asc' ? cmp2 : -cmp2;
      }
      return 0;
    });
  };

  const SortHeader = ({ label, sortKey, align = 'left' }: { label: string; sortKey: string; align?: 'left' | 'right' | 'center' }) => {
    const isActive = sort?.key === sortKey;
    const isSecondary = secondarySort?.key === sortKey && !isActive;
    return (
      <th
        className={`px-4 py-3 text-xs font-medium uppercase tracking-wide cursor-pointer select-none hover:text-black transition-colors ${
          align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
        } ${isActive ? 'text-black' : 'text-gray-500'}`}
        onClick={(e) => handleSort(sortKey, e.shiftKey)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isActive && (
            sort.dir === 'asc'
              ? <ChevronUpIcon className="w-3 h-3" />
              : <ChevronDownIcon className="w-3 h-3" />
          )}
          {isSecondary && (
            secondarySort.dir === 'asc'
              ? <ChevronUpIcon className="w-3 h-3 opacity-40" />
              : <ChevronDownIcon className="w-3 h-3 opacity-40" />
          )}
        </span>
      </th>
    );
  };

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
  const sorted = applySorting(filtered);

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
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search students..."
                    className="pl-9"
                  />
                </div>
                <div className="flex border border-gray-300">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 transition-colors ${viewMode === 'cards' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="Card view"
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    title="List view"
                  >
                    <QueueListIcon className="w-4 h-4" />
                  </button>
                </div>
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
              ) : viewMode === 'cards' ? (
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
              ) : (
                <div className="bg-white border border-gray-200 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <SortHeader label="Student" sortKey="name" />
                        <SortHeader label="Level" sortKey="level" />
                        <SortHeader label="Assignment" sortKey="assignment" />
                        <SortHeader label="Guests" sortKey="guests" align="right" />
                        <SortHeader label="Baptisms" sortKey="baptisms" align="right" />
                        <SortHeader label="Converts" sortKey="converts" align="right" />
                        <SortHeader label="Thanksgiving" sortKey="thanksgiving" align="right" />
                        <SortHeader label="Tithes" sortKey="tithes" align="right" />
                        <SortHeader label="Yrs" sortKey="years" align="center" />
                        {canEdit && (
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sorted.map((s) => {
                        const latest = s.records[s.records.length - 1];
                        const carolingRate = s.totals.years_count > 0 ? Math.round((s.totals.caroling_goals_reached / s.totals.years_count) * 100) : 0;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Link href={`/metrics/${s.id}`} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-900 flex items-center justify-center shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {s.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 group-hover:text-black">{s.full_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {s.date_entered ? `Entered ${new Date(s.date_entered).getFullYear()}` : ''}
                                  </p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {latest && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 font-medium">
                                  {latest.year_level}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {latest?.assignment || '—'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">{s.totals.guests.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-blue-900">{s.totals.baptisms_total}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">{s.totals.converts}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-green-900">{fmt$(s.totals.thanksgiving_offering)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-purple-900">{fmt$(s.totals.tithes)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">{s.totals.years_count}</td>
                            {canEdit && (
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEditStudent(s)}
                                    className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded"
                                    title="Edit student"
                                  >
                                    <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStudent(s)}
                                    className="p-1.5 border border-gray-200 hover:bg-red-50 rounded"
                                    title="Delete student"
                                  >
                                    <TrashIcon className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
