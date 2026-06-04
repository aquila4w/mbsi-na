'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchGraduates, promoteGraduates } from '@/lib/advancement/service';
import { ArrowLeftIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    loadGraduates();
  }, []);

  const loadGraduates = async () => {
    try {
      const data = await fetchGraduates();
      setGraduates(data);
    } catch (err) {
      console.error('Error loading graduates:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === graduates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(graduates.map((g) => g.id)));
    }
  };

  const handlePromote = async () => {
    if (!confirm(`Promote ${selected.size} graduate(s) to Minister? This cannot be undone.`)) return;
    setPromoting(true);
    try {
      await promoteGraduates(Array.from(selected));
      toast.success(`${selected.size} graduate(s) promoted to Minister`);
      setSelected(new Set());
      await loadGraduates();
    } catch (err: any) {
      toast.error(err.message || 'Failed to promote graduates');
    } finally {
      setPromoting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Link href="/advancement" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Advancement
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Graduate Promotion</h1>
                <p className="text-gray-500 text-sm mt-1">Promote graduates to Minister status</p>
              </div>
              {selected.size > 0 && (
                <button
                  onClick={handlePromote}
                  disabled={promoting}
                  className="inline-flex items-center px-4 py-3 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <AcademicCapIcon className="w-4 h-4 mr-2" />
                  {promoting ? 'Promoting...' : `Promote ${selected.size} to Minister`}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : graduates.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300">
              <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No graduates pending promotion</p>
              <p className="text-gray-400 text-sm mt-1">Graduates will appear here after advancement sessions are applied</p>
            </div>
          ) : (
            <div className="border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.size === graduates.length}
                  onChange={toggleAll}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">{graduates.length} graduate(s)</span>
              </div>
              <div className="divide-y divide-gray-100">
                {graduates.map((g) => (
                  <div key={g.id} className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selected.has(g.id)}
                      onChange={() => toggleSelect(g.id)}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{g.full_name}</p>
                      <p className="text-xs text-gray-500">
                        Entered: {g.date_entered ? new Date(g.date_entered).toLocaleDateString() : 'N/A'}
                        {g.graduated_at && ` • Graduated: ${new Date(g.graduated_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800">
                      Graduate
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
