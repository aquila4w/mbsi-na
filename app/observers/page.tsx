'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, User, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';

interface ObservedStudent {
  id: string;
  full_name: string;
  email: string;
  enrollments: any[];
  recent_grades: any[];
}

export default function ObserversPage() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<ObservedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'observer') {
      loadObservedStudents();
    }
  }, [user, profile]);

  const loadObservedStudents = async () => {
    const { data: links } = await supabase
      .from('observer_links')
      .select('student_id')
      .eq('observer_id', user!.id);

    if (!links || links.length === 0) {
      setLoading(false);
      return;
    }

    const studentIds = links.map(l => l.student_id);

    const { data: studentsData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', studentIds);

    if (studentsData) {
      const studentsWithData = await Promise.all(
        studentsData.map(async (student) => {
          const [enrollmentsResponse, submissionsResponse] = await Promise.all([
            supabase
              .from('enrollments')
              .select('*, courses(name, code)')
              .eq('user_id', student.id)
              .eq('status', 'active'),
            supabase
              .from('submissions')
              .select('*, assignments(title, points_possible)')
              .eq('student_id', student.id)
              .eq('status', 'graded')
              .order('graded_at', { ascending: false })
              .limit(5)
          ]);

          return {
            ...student,
            enrollments: enrollmentsResponse.data || [],
            recent_grades: submissionsResponse.data || []
          };
        })
      );

      setStudents(studentsWithData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['observer']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['observer']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Observed Students</h1>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">No students assigned to observe yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {students.map((student) => (
                <Card key={student.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>{student.full_name}</CardTitle>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Current Courses ({student.enrollments.length})
                      </h3>
                      <div className="space-y-2">
                        {student.enrollments.map((enrollment: any) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-2 border rounded">
                            <span>{enrollment.courses.code} - {enrollment.courses.name}</span>
                            <Badge>{enrollment.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {student.recent_grades.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Recent Grades
                        </h3>
                        <div className="space-y-2">
                          {student.recent_grades.map((submission: any) => (
                            <div key={submission.id} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{submission.assignments.title}</span>
                              <span className="font-medium">
                                {submission.grade}/{submission.assignments.points_possible}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
