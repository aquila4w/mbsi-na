'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StudentWithRecords } from '@/lib/studentMetrics/types';
import { fetchStudentWithRecords, updateStudent } from '@/lib/studentMetrics/service';
import { StudentRecordsGrid } from '@/components/studentMetrics/StudentRecordsGrid';
import { EvaluationsPanel } from '@/components/studentMetrics/EvaluationsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

const PROFILE_FIELDS: { key: keyof StudentWithRecords; label: string; placeholder: string }[] = [
  { key: 'academics', label: 'Academics', placeholder: 'Academic standing, performance, GPA notes...' },
  { key: 'spirituality', label: 'Spirituality', placeholder: 'Spiritual development notes...' },
  { key: 'jobspec_ministries', label: 'Job Spec / Ministries', placeholder: 'Ministry assignments and job spec notes...' },
  { key: 'ministerial_proficiency', label: 'Ministerial Proficiency / Pastoral Care', placeholder: 'Pastoral care and ministerial proficiency notes...' },
  { key: 'character_summary', label: 'Character', placeholder: 'Character overview and summary...' },
  { key: 'achievements_ranking', label: 'Achievements / Ranking', placeholder: 'Notable achievements, awards, rankings...' },
  { key: 'faculty_recommendation', label: 'Faculty Recommendation', placeholder: 'Faculty recommendation text...' },
  { key: 'faculty_remarks', label: 'Faculty Remarks', placeholder: 'Additional faculty remarks...' },
];

function ProfileFieldsEditor({ student, canEdit, onRefresh }: { student: StudentWithRecords; canEdit: boolean; onRefresh: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init: Record<string, string> = {};
    PROFILE_FIELDS.forEach(({ key }) => {
      init[key as string] = (student[key] as string) || '';
    });
    setValues(init);
  }, [student]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStudent(student.id, values as any);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PROFILE_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key as string} className="space-y-1">
            <Label className="font-semibold text-gray-800">{label}</Label>
            <Textarea
              rows={3}
              value={values[key as string] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [key as string]: e.target.value }))}
              placeholder={placeholder}
              disabled={!canEdit}
              className="resize-none"
            />
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saved ? <><CheckIcon className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : 'Save Profile Fields'}
          </Button>
        </div>
      )}
    </div>
  );
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
            <Link href="/metrics">
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                All Students
              </button>
            </Link>

            <div className="bg-white border border-gray-200 p-6">
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

            <Tabs defaultValue="records">
              <TabsList className="border-b border-gray-200 bg-transparent p-0 h-auto gap-0 w-full justify-start">
                {[
                  { value: 'records', label: 'Year Records' },
                  { value: 'evaluations', label: 'Evaluations' },
                  { value: 'profile', label: 'Profile & Faculty Notes' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="px-5 py-2.5 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black rounded-none bg-transparent"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="records" className="mt-6">
                {chartData.length > 1 && (
                  <div className="bg-white border border-gray-200 p-6 mb-6">
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
              </TabsContent>

              <TabsContent value="evaluations" className="mt-6">
                <div className="bg-white border border-gray-200 p-6">
                  <EvaluationsPanel
                    studentId={student.id}
                    studentName={student.full_name}
                    canEdit={canEdit}
                  />
                </div>
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <div className="bg-white border border-gray-200 p-6">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold">Profile & Faculty Notes</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Academic summary fields and faculty assessments for this student.</p>
                  </div>
                  <ProfileFieldsEditor student={student} canEdit={canEdit} onRefresh={load} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
