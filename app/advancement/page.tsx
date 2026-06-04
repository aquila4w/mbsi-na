'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchSessions, createSession } from '@/lib/advancement/service';
import { AdvancementSession } from '@/lib/advancement/types';
import { SESSION_STATUS_INFO } from '@/lib/advancement/constants';
import SessionFormDialog from '@/components/advancement/SessionFormDialog';
import { PlusIcon, CalendarIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdvancementPage() {
  const [sessions, setSessions] = useState<AdvancementSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (data: { academic_year: string; session_date: string; title: string }) => {
    const session = await createSession({
      ...data,
      status: 'draft',
    });
    if (session) {
      setShowNewDialog(false);
      window.location.href = `/advancement/${session.id}`;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher', 'ta']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Advancement</h1>
              <p className="text-gray-500 text-sm mt-1">Manage annual deliberation sessions and student advancement</p>
            </div>
            <button
              onClick={() => setShowNewDialog(true)}
              className="inline-flex items-center px-4 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Deliberation Session
            </button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/advancement/graduates"
              className="flex items-center p-4 border border-gray-200 hover:border-black transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded mr-4">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Graduate Promotion</p>
                <p className="text-xs text-gray-500">Promote graduates to Minister</p>
              </div>
            </Link>
            <Link
              href="/advancement/history"
              className="flex items-center p-4 border border-gray-200 hover:border-black transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded mr-4">
                <CalendarIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Advancement History</p>
                <p className="text-xs text-gray-500">View past deliberation records</p>
              </div>
            </Link>
          </div>

          {/* Session List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300">
              <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No deliberation sessions yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first session to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => {
                const statusInfo = SESSION_STATUS_INFO[session.status] || SESSION_STATUS_INFO.draft;
                return (
                  <Link
                    key={session.id}
                    href={`/advancement/${session.id}`}
                    className="block p-6 border border-gray-200 hover:border-black transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm">
                        {session.title || `Deliberation ${session.academic_year}`}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>Academic Year: {session.academic_year}</p>
                      <p>Session Date: {session.session_date ? new Date(session.session_date).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <SessionFormDialog
          open={showNewDialog}
          onClose={() => setShowNewDialog(false)}
          onSubmit={handleCreateSession}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
