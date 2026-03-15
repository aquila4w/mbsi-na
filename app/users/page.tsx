'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
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
          <div>
            <h1 className="text-4xl font-bold">User Management</h1>
            <p className="text-gray-600 mt-2">Manage users and permissions</p>
          </div>

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
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      roleFilter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      roleFilter === 'admin'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setRoleFilter('teacher')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      roleFilter === 'teacher'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Teachers
                  </button>
                  <button
                    onClick={() => setRoleFilter('student')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      roleFilter === 'student'
                        ? 'bg-black text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-black'
                    }`}
                  >
                    Students
                  </button>
                </div>
              </div>
            </div>

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
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Actions
                      </th>
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
                          <span
                            className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1.5 border-2 border-gray-300 text-sm focus:border-black focus:outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="ta">TA</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
              </div>
              <div>
                <h3 className="font-bold mb-2">User Roles</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><span className="font-medium">Admin:</span> Full system access and user management</li>
                  <li><span className="font-medium">Teacher:</span> Can create and manage courses</li>
                  <li><span className="font-medium">TA:</span> Can assist with course management</li>
                  <li><span className="font-medium">Student:</span> Can enroll in and view courses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
