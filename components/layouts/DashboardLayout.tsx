'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  CalendarIcon,
  EyeIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Courses', href: '/courses', icon: BookOpenIcon },
  { name: 'Assignments', href: '/assignments', icon: AcademicCapIcon, roles: ['student', 'teacher', 'ta'] },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Observers', href: '/observers', icon: EyeIcon, roles: ['observer'] },
  { name: 'Users', href: '/users', icon: UserGroupIcon, roles: ['admin'] },
  { name: 'User Admin', href: '/admin/users', icon: UserGroupIcon, roles: ['admin'] },
  { name: 'Metrics', href: '/metrics', icon: ChartBarIcon, roles: ['admin', 'teacher', 'ta'] },
  { name: 'Advancement', href: '/advancement', icon: ClipboardDocumentCheckIcon, roles: ['admin', 'teacher', 'ta'] },
  { name: 'Demo', href: '/admin/demo', icon: BeakerIcon, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (profile && item.roles.includes(profile.role))
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-black text-white',
      teacher: 'bg-gray-800 text-white',
      ta: 'bg-gray-700 text-white',
      student: 'bg-gray-600 text-white',
      designer: 'bg-gray-700 text-white',
      observer: 'bg-gray-500 text-white',
    };
    return colors[role] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <Image
                  src="/mbsi-logo.png"
                  alt="MBSI Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <h1 className="text-xl font-bold tracking-tight">MBSI NA</h1>
              </Link>
              <div className="hidden md:flex items-center space-x-1">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-black border-b-2 border-black'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBadge />

              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 p-2 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-black flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {profile?.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{profile?.role}</p>
                  </div>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white border border-gray-200 focus:outline-none">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{profile?.email}</p>
                      <span
                        className={`inline-block mt-3 px-2 py-1 text-xs font-medium uppercase tracking-wide ${getRoleBadgeColor(
                          profile?.role || ''
                        )}`}
                      >
                        {profile?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center px-4 py-3 text-sm`}
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={signOut}
                            className={`${
                              active ? 'bg-gray-50' : ''
                            } flex items-center w-full px-4 py-3 text-sm text-red-600`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
