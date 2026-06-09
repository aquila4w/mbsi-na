'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { UserGroupIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  must_change_password: boolean;
  created_at: string;
}

interface AddUserForm {
  email: string;
  full_name: string;
  role: string;
  password: string;
  generatePassword: boolean;
  must_change_password: boolean;
}

interface ResetPasswordForm {
  password: string;
  generatePassword: boolean;
  must_change_password: boolean;
}

const emptyAddForm: AddUserForm = {
  email: '',
  full_name: '',
  role: 'student',
  password: '',
  generatePassword: true,
  must_change_password: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add user dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>(emptyAddForm);
  const [addLoading, setAddLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Reset password dialog
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetUser, setResetUser] = useState<UserProfile | null>(null);
  const [resetForm, setResetForm] = useState<ResetPasswordForm>({
    password: '',
    generatePassword: true,
    must_change_password: true,
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setGeneratedPassword(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addForm.email,
          full_name: addForm.full_name,
          role: addForm.role,
          password: addForm.generatePassword ? undefined : addForm.password,
          must_change_password: addForm.must_change_password,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(`User ${addForm.email} created successfully`);

      if (data.generated_password) {
        setGeneratedPassword(data.generated_password);
      } else {
        setShowAddDialog(false);
        setAddForm(emptyAddForm);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;

    setResetLoading(true);
    setResetResult(null);

    try {
      const res = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: resetForm.generatePassword ? undefined : resetForm.password,
          must_change_password: resetForm.must_change_password,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(`Password reset for ${resetUser.email}`);

      if (data.generated_password) {
        setResetResult(data.generated_password);
      } else {
        closeResetDialog();
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleToggleMustChangePassword = async (user: UserProfile) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: undefined,
          must_change_password: !user.must_change_password,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        user.must_change_password
          ? `Password change no longer required for ${user.full_name}`
          : `${user.full_name} will be prompted to change password`
      );
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    }
  };

  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetUser(null);
    setResetForm({ password: '', generatePassword: true, must_change_password: true });
    setResetResult(null);
    fetchUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'teacher':
        return 'bg-black text-white';
      case 'ta':
        return 'bg-gray-700 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">User Management</h1>
              <p className="text-gray-600 mt-2">Add users, manage passwords, and control access</p>
            </div>
            <button
              onClick={() => { setAddForm(emptyAddForm); setGeneratedPassword(null); setShowAddDialog(true); }}
              className="bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Add User
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {['all', 'admin', 'teacher', 'ta', 'student'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        roleFilter === role
                          ? 'bg-black text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                      }`}
                    >
                      {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-bold">No users found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  {searchQuery || roleFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No users in the system yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{user.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.must_change_password && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                              Must change password
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setResetUser(user);
                                setResetForm({ password: '', generatePassword: true, must_change_password: true });
                                setResetResult(null);
                                setShowResetDialog(true);
                              }}
                              className="px-3 py-1.5 text-xs font-medium border border-gray-300 hover:border-black transition-colors"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => handleToggleMustChangePassword(user)}
                              className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                                user.must_change_password
                                  ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                  : 'border-gray-300 text-gray-600 hover:border-black'
                              }`}
                            >
                              {user.must_change_password ? 'Clear Flag' : 'Force Change'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add User Dialog */}
        {showAddDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Add New User</h2>
                <button onClick={() => setShowAddDialog(false)} className="text-gray-400 hover:text-black">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {generatedPassword ? (
                <div className="p-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-sm font-medium text-green-800 mb-2">User created successfully!</p>
                    <p className="text-xs text-green-700 mb-2">Share this password with the user:</p>
                    <div className="bg-white border border-green-300 p-3 rounded font-mono text-sm select-all">
                      {generatedPassword}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddDialog(false);
                      setAddForm(emptyAddForm);
                      setGeneratedPassword(null);
                      fetchUsers();
                    }}
                    className="w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={addForm.full_name}
                      onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={addForm.role}
                      onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                      className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="ta">TA</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <label className="flex items-center space-x-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={addForm.generatePassword}
                          onChange={(e) => setAddForm({ ...addForm, generatePassword: e.target.checked })}
                          className="rounded"
                        />
                        <span>Auto-generate</span>
                      </label>
                    </div>
                    {!addForm.generatePassword && (
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        placeholder="Minimum 6 characters"
                        required={!addForm.generatePassword}
                      />
                    )}
                  </div>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={addForm.must_change_password}
                      onChange={(e) => setAddForm({ ...addForm, must_change_password: e.target.checked })}
                      className="rounded"
                    />
                    <span>Require password change on first login</span>
                  </label>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1 border-2 border-gray-300 py-2.5 text-sm font-medium hover:border-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="flex-1 bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {addLoading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Reset Password Dialog */}
        {showResetDialog && resetUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Reset Password</h2>
                <button onClick={closeResetDialog} className="text-gray-400 hover:text-black">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {resetResult ? (
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">Password reset for <strong>{resetUser.email}</strong></p>
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-xs text-green-700 mb-2">New password:</p>
                    <div className="bg-white border border-green-300 p-3 rounded font-mono text-sm select-all">
                      {resetResult}
                    </div>
                  </div>
                  <button
                    onClick={closeResetDialog}
                    className="w-full bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                  <p className="text-sm text-gray-600">
                    Reset password for <strong>{resetUser.full_name}</strong> ({resetUser.email})
                  </p>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <label className="flex items-center space-x-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={resetForm.generatePassword}
                          onChange={(e) => setResetForm({ ...resetForm, generatePassword: e.target.checked })}
                          className="rounded"
                        />
                        <span>Auto-generate</span>
                      </label>
                    </div>
                    {!resetForm.generatePassword && (
                      <input
                        type="password"
                        value={resetForm.password}
                        onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                        className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                        placeholder="Minimum 6 characters"
                        required={!resetForm.generatePassword}
                      />
                    )}
                  </div>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={resetForm.must_change_password}
                      onChange={(e) => setResetForm({ ...resetForm, must_change_password: e.target.checked })}
                      className="rounded"
                    />
                    <span>Require password change on next login</span>
                  </label>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeResetDialog}
                      className="flex-1 border-2 border-gray-300 py-2.5 text-sm font-medium hover:border-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 bg-black text-white py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {resetLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
