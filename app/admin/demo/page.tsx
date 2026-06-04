'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { seedDemoData, cleanupDemoData } from '@/lib/demo/service';
import { BeakerIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

export default function DemoPage() {
  const [loading, setLoading] = useState<'seed' | 'cleanup' | null>(null);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  const handleSeed = async () => {
    if (!confirm('This will create demo users, courses, assignments, quizzes, and more. Continue?')) return;
    setLoading('seed');
    setResult(null);
    try {
      const data = await seedDemoData();
      setResult(data);
      toast.success('Demo data seeded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed demo data');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will DELETE all demo data. Are you sure?')) return;
    setLoading('cleanup');
    setResult(null);
    try {
      const data = await cleanupDemoData();
      setResult(data);
      toast.success('Demo data cleaned up!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cleanup demo data');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Demo Data Manager</h1>
            <p className="text-gray-500 text-sm mt-1">
              Populate or clean up demo data for testing and demonstration purposes.
            </p>
          </div>

          {/* Info Card */}
          <div className="border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide">What gets created</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500">Teachers</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500">Courses</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500">Quizzes</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-gray-500">Assignments</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500">Discussions</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-gray-500">Groups</p>
              </div>
              <div className="p-3 bg-gray-50">
                <p className="text-2xl font-bold">6</p>
                <p className="text-xs text-gray-500">Announcements</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs space-y-1">
              <p className="font-medium">Demo credentials (all accounts use the same password):</p>
              <p><strong>Password:</strong> <code className="bg-blue-100 px-1">Demo@1234</code></p>
              <p><strong>Teachers:</strong> santos@demo.mbsina.org, reyes@demo.mbsina.org, cruz@demo.mbsina.org</p>
              <p><strong>Students:</strong> maria@demo.mbsina.org, juan@demo.mbsina.org, ana@demo.mbsina.org, pedro@demo.mbsina.org, rosa@demo.mbsina.org, luis@demo.mbsina.org, carmen@demo.mbsina.org, diego@demo.mbsina.org</p>
              <p><strong>TA:</strong> marco@demo.mbsina.org</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleSeed}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'seed' ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <BeakerIcon className="w-5 h-5" />
              )}
              {loading === 'seed' ? 'Seeding...' : 'Seed Demo Data'}
            </button>

            <button
              onClick={handleCleanup}
              disabled={loading !== null}
              className="flex items-center justify-center gap-3 px-6 py-5 border-2 border-red-300 text-red-700 font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'cleanup' ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <TrashIcon className="w-5 h-5" />
              )}
              {loading === 'cleanup' ? 'Cleaning...' : 'Clean Up Demo Data'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`border p-4 text-sm ${result.status === 'seeded' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">
                {result.status === 'seeded' ? '✅ Demo Data Created' : '🧹 Demo Data Removed'}
              </h3>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
