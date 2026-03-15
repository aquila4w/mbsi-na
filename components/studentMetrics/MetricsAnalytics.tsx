'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { StudentWithRecords } from '@/lib/studentMetrics/types';

interface MetricsAnalyticsProps {
  students: StudentWithRecords[];
}

function fmt$(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function MetricsAnalytics({ students }: MetricsAnalyticsProps) {
  const overviewData = useMemo(() =>
    students.map((s) => ({
      name: s.full_name.split(' ')[0],
      fullName: s.full_name,
      Guests: s.totals.guests,
      Baptisms: s.totals.baptisms_total,
      Contacts: s.totals.contacts,
      'Thanksgiving ($)': Math.round(s.totals.thanksgiving_offering),
      'Evangelism ($)': Math.round(s.totals.evangelism_offering),
    })),
    [students]
  );

  const yearlyTrend = useMemo(() => {
    const byYear: Record<number, { guests: number; baptisms: number; thanksgiving: number; evangelism: number; count: number }> = {};
    students.forEach((s) => {
      s.records.forEach((r) => {
        if (!r.year) return;
        if (!byYear[r.year]) byYear[r.year] = { guests: 0, baptisms: 0, thanksgiving: 0, evangelism: 0, count: 0 };
        byYear[r.year].guests += r.guests || 0;
        byYear[r.year].baptisms += (r.baptisms_us || 0) + (r.baptisms_rrb_ph || 0);
        byYear[r.year].thanksgiving += r.thanksgiving_offering || 0;
        byYear[r.year].evangelism += r.evangelism_offering || 0;
        byYear[r.year].count++;
      });
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, d]) => ({
        year,
        'Total Guests': d.guests,
        'Total Baptisms': d.baptisms,
        'Thanksgiving ($)': Math.round(d.thanksgiving),
        'Evangelism ($)': Math.round(d.evangelism),
      }));
  }, [students]);

  const radarData = useMemo(() => {
    if (students.length === 0) return [];
    const maxGuests = Math.max(...students.map((s) => s.totals.guests), 1);
    const maxBaptisms = Math.max(...students.map((s) => s.totals.baptisms_total), 1);
    const maxOffering = Math.max(...students.map((s) => s.totals.total_offering), 1);
    const maxContacts = Math.max(...students.map((s) => s.totals.contacts), 1);
    const maxCarolingGoal = Math.max(...students.map((s) => s.totals.caroling_total_goal), 1);

    return [
      { metric: 'Guests', ...Object.fromEntries(students.map((s) => [s.full_name.split(' ')[0], Math.round((s.totals.guests / maxGuests) * 100)])) },
      { metric: 'Baptisms', ...Object.fromEntries(students.map((s) => [s.full_name.split(' ')[0], Math.round((s.totals.baptisms_total / maxBaptisms) * 100)])) },
      { metric: 'Offerings', ...Object.fromEntries(students.map((s) => [s.full_name.split(' ')[0], Math.round((s.totals.total_offering / maxOffering) * 100)])) },
      { metric: 'Contacts', ...Object.fromEntries(students.map((s) => [s.full_name.split(' ')[0], Math.round((s.totals.contacts / maxContacts) * 100)])) },
      { metric: 'Caroling', ...Object.fromEntries(students.map((s) => [s.full_name.split(' ')[0], Math.round((s.totals.caroling_total_goal / maxCarolingGoal) * 100)])) },
    ];
  }, [students]);

  const COLORS = [
    '#1a1a1a', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
    '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe',
  ];

  if (students.length === 0) return null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-1">Cumulative Performance by Student</h3>
        <p className="text-sm text-gray-500 mb-4">Total guests and baptisms across all years</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overviewData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v: any, name: string) => [name.includes('$') ? fmt$(Number(v)) : v, name]}
              labelFormatter={(l) => overviewData.find((d) => d.name === l)?.fullName || l}
            />
            <Legend />
            <Bar dataKey="Guests" fill="#374151" />
            <Bar dataKey="Baptisms" fill="#0369a1" />
            <Bar dataKey="Contacts" fill="#9ca3af" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-1">Total Offerings by Student</h3>
        <p className="text-sm text-gray-500 mb-4">Thanksgiving + Evangelism offerings combined</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={overviewData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => fmt$(Number(v))} labelFormatter={(l) => overviewData.find((d) => d.name === l)?.fullName || l} />
            <Legend />
            <Bar dataKey="Thanksgiving ($)" fill="#1a1a1a" />
            <Bar dataKey="Evangelism ($)" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-1">Year-Over-Year Trend (All Students)</h3>
        <p className="text-sm text-gray-500 mb-4">Combined metrics across the entire cohort per calendar year</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={yearlyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any, name: string) => [name.includes('$') ? fmt$(Number(v)) : v, name]} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="Total Guests" stroke="#374151" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="left" type="monotone" dataKey="Total Baptisms" stroke="#0369a1" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="Thanksgiving ($)" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {students.length <= 8 && (
        <div>
          <h3 className="text-lg font-bold mb-1">Normalized Performance Radar</h3>
          <p className="text-sm text-gray-500 mb-4">Relative scores across all key metrics (100 = highest performer)</p>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
              {students.map((s, i) => (
                <Radar
                  key={s.id}
                  name={s.full_name.split(' ')[0]}
                  dataKey={s.full_name.split(' ')[0]}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
