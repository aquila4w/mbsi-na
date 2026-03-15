'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center space-x-3 mb-12">
            <Image
              src="/mbsi_logo.png"
              alt="MBSI Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-2xl font-bold">MBSI NA</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">Sign in</h1>
            <p className="text-gray-600">Access your MBSI account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                placeholder="name@institution.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-black font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-black relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center max-w-lg px-8">
            <h2 className="text-3xl font-bold mb-4">Enterprise learning infrastructure</h2>
            <p className="text-gray-400">
              Trusted by educational institutions worldwide for course management, student engagement, and analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
