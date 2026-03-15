'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Clock, Award } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Quiz {
  id: string;
  title: string;
  description: string;
  quiz_type: string;
  time_limit: number | null;
  points_possible: number;
  allowed_attempts: number;
  due_date: string | null;
  status: string;
}

export default function CourseQuizzesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, courseId]);

  const loadData = async () => {
    const [courseResponse, enrollmentResponse, quizzesResponse] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('enrollments').select('role').eq('course_id', courseId).eq('user_id', user!.id).single(),
      supabase.from('quizzes').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
    ]);

    if (courseResponse.data) setCourse(courseResponse.data);
    if (enrollmentResponse.data?.role === 'teacher' || profile?.role === 'admin') {
      setIsTeacher(true);
    }
    if (quizzesResponse.data) {
      const filteredQuizzes = isTeacher || profile?.role === 'admin'
        ? quizzesResponse.data
        : quizzesResponse.data.filter(q => q.status === 'published');
      setQuizzes(filteredQuizzes);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading quizzes...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course?.name} - Quizzes</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            {isTeacher && (
              <Link href={`/courses/${courseId}/quizzes/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </Link>
            )}
          </div>

          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quizzes yet. {isTeacher && 'Create your first quiz to get started.'}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <Link key={quiz.id} href={`/courses/${courseId}/quizzes/${quiz.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{quiz.title}</h3>
                            <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                              {quiz.status}
                            </Badge>
                            <Badge variant="outline">{quiz.quiz_type}</Badge>
                          </div>
                          {quiz.description && (
                            <p className="text-gray-600 mb-3">{quiz.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {quiz.points_possible && (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                {quiz.points_possible} points
                              </div>
                            )}
                            {quiz.time_limit && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.time_limit} minutes
                              </div>
                            )}
                            {quiz.allowed_attempts && (
                              <span>{quiz.allowed_attempts} {quiz.allowed_attempts === 1 ? 'attempt' : 'attempts'}</span>
                            )}
                            {quiz.due_date && (
                              <span>Due {format(new Date(quiz.due_date), 'MMM d, yyyy')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
