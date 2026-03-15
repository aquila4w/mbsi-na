import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center bg-white border-2 border-gray-200 p-16 max-w-md">
        <div className="mb-8">
          <h1 className="text-7xl font-bold mb-4">403</h1>
          <div className="h-1 w-24 bg-black mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
