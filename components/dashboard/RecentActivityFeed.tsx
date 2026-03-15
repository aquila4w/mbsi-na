'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'submission' | 'grade' | 'enrollment' | 'assignment';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export function RecentActivityFeed() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchActivities();
    }
  }, [profile]);

  const fetchActivities = async () => {
    if (!profile) return;

    try {
      const allActivities: Activity[] = [];

      if (profile.role === 'student') {
        const { data: submissions } = await supabase
          .from('submissions')
          .select(`
            id,
            submitted_at,
            graded_at,
            grade,
            status,
            assignments(title, points_possible)
          `)
          .eq('user_id', profile.id)
          .order('submitted_at', { ascending: false })
          .limit(5);

        submissions?.forEach((sub: any) => {
          if (sub.status === 'graded' && sub.graded_at) {
            allActivities.push({
              id: `grade-${sub.id}`,
              type: 'grade',
              title: 'Assignment Graded',
              description: `${sub.assignments.title}: ${sub.grade}/${sub.assignments.points_possible} points`,
              timestamp: sub.graded_at,
            });
          } else if (sub.submitted_at) {
            allActivities.push({
              id: `submission-${sub.id}`,
              type: 'submission',
              title: 'Assignment Submitted',
              description: sub.assignments.title,
              timestamp: sub.submitted_at,
            });
          }
        });

        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('id, created_at, courses(name, code)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(3);

        enrollments?.forEach((enrollment: any) => {
          allActivities.push({
            id: `enrollment-${enrollment.id}`,
            type: 'enrollment',
            title: 'Enrolled in Course',
            description: `${enrollment.courses.code} - ${enrollment.courses.name}`,
            timestamp: enrollment.created_at,
          });
        });
      } else if (profile.role === 'teacher' || profile.role === 'admin') {
        const { data: submissions } = await supabase
          .from('submissions')
          .select(`
            id,
            submitted_at,
            status,
            assignments(title, course_id),
            profiles(full_name)
          `)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })
          .limit(10);

        submissions?.forEach((sub: any) => {
          allActivities.push({
            id: `submission-${sub.id}`,
            type: 'submission',
            title: 'New Submission',
            description: `${sub.profiles.full_name} submitted ${sub.assignments.title}`,
            timestamp: sub.submitted_at,
          });
        });

        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title, created_at, courses(name)')
          .eq('created_by', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        assignments?.forEach((assignment: any) => {
          allActivities.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            title: 'Assignment Created',
            description: `${assignment.title} in ${assignment.courses.name}`,
            timestamp: assignment.created_at,
          });
        });
      }

      allActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 8));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return DocumentTextIcon;
      case 'grade':
        return CheckCircleIcon;
      case 'enrollment':
        return UserGroupIcon;
      case 'assignment':
        return AcademicCapIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-100 text-blue-600';
      case 'grade':
        return 'bg-green-100 text-green-600';
      case 'enrollment':
        return 'bg-purple-100 text-purple-600';
      case 'assignment':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Recent Activity</h2>
        <p className="text-sm text-gray-600 mt-1">Latest updates and actions</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-bold">No recent activity</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your activity will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 border-2 border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div className={`p-2.5 rounded-full ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
