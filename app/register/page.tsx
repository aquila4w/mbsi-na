'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserRole } from '@/lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName, role);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    { value: 'student', label: 'Student', description: 'Enroll in courses' },
    { value: 'teacher', label: 'Teacher', description: 'Create courses' },
    { value: 'ta', label: 'TA', description: 'Assist instructors' },
    { value: 'designer', label: 'Designer', description: 'Create content' },
    { value: 'observer', label: 'Observer', description: 'Monitor progress' },
    { value: 'admin', label: 'Admin', description: 'Full access' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center space-x-3 mb-12">
            <Image
              src="/mbsi_logo copy.png"
              alt="MBSI Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <span className="text-2xl font-bold">MBSI NA</span>
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3">Create account</h1>
            <p className="text-gray-600">Get started with MBSI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

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
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} — {option.description}
                  </option>
                ))}
              </select>
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
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 focus:border-black focus:outline-none transition-colors"
                placeholder="Re-enter password"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-black font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-black relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center max-w-lg px-8">
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 bg-white/10 text-xs font-medium tracking-wide uppercase mb-4">
                Trusted Platform
              </div>
              <h2 className="text-3xl font-bold mb-4">Join thousands of educators</h2>
              <p className="text-gray-400">
                Start managing courses, tracking progress, and engaging students with our comprehensive LMS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
