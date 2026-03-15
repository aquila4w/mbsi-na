'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { differenceInDays, differenceInHours } from 'date-fns';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  dueDate: Date;
  hoursUntilDue: number;
  isUrgent: boolean;
}

export function NotificationBadge() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (profile?.role === 'student') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  const fetchNotifications = async () => {
    if (!profile) return;

    try {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', profile.id)
        .eq('role', 'student');

      if (!enrollments || enrollments.length === 0) return;

      const enrollmentList = enrollments as any[];
      const courseIds = enrollmentList.map((e: any) => e.course_id);

      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          course_id
        `)
        .in('course_id', courseIds)
        .eq('status', 'published')
        .not('due_date', 'is', null);

      if (!assignments) return;

      const assignmentList = assignments as any[];

      const { data: submissions } = await supabase
        .from('submissions')
        .select('assignment_id')
        .eq('student_id', profile.id);

      const submissionList = (submissions || []) as any[];
      const submittedIds = new Set(submissionList.map((s: any) => s.assignment_id));

      const now = new Date();
      const upcomingAssignments = assignmentList
        .filter((a: any) => !submittedIds.has(a.id))
        .map((a: any) => {
          const dueDate = new Date(a.due_date!);
          const hoursUntilDue = differenceInHours(dueDate, now);
          return {
            id: a.id,
            title: a.title,
            dueDate,
            hoursUntilDue,
            isUrgent: hoursUntilDue <= 24 && hoursUntilDue > 0,
          };
        })
        .filter((a: any) => a.hoursUntilDue > 0 && a.hoursUntilDue <= 168)
        .sort((a: any, b: any) => a.hoursUntilDue - b.hoursUntilDue);

      setNotifications(upcomingAssignments);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const urgentCount = notifications.filter(n => n.isUrgent).length;
  const totalCount = notifications.length;

  if (profile?.role !== 'student') {
    return (
      <Link href="/notifications">
        <button className="relative p-2 hover:bg-gray-100 transition-colors">
          <BellIcon className="w-6 h-6 text-gray-700" />
        </button>
      </Link>
    );
  }

  if (totalCount === 0) {
    return (
      <Link href="/notifications">
        <button className="relative p-2 hover:bg-gray-100 transition-colors">
          <BellIcon className="w-6 h-6 text-gray-700" />
        </button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="w-6 h-6 text-gray-700" />
        {totalCount > 0 && (
          <span className={`absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${urgentCount > 0 ? 'bg-red-600' : 'bg-black'}`}>
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-gray-200 shadow-lg z-20">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Upcoming Assignments
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {totalCount} assignment{totalCount !== 1 ? 's' : ''} due soon
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    notification.isUrgent ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className={`text-xs mt-1 ${notification.isUrgent ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {notification.hoursUntilDue < 24
                          ? `Due in ${notification.hoursUntilDue} hour${notification.hoursUntilDue !== 1 ? 's' : ''}`
                          : `Due in ${differenceInDays(notification.dueDate, new Date())} day${differenceInDays(notification.dueDate, new Date()) !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    {notification.isUrgent && (
                      <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-medium uppercase tracking-wide">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
