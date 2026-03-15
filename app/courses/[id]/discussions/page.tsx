'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Lock, Pin, User } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Discussion {
  id: string;
  title: string;
  description: string;
  pinned: boolean;
  locked: boolean;
  created_by: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  };
  post_count: number;
}

export default function CourseDiscussionsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', description: '' });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, courseId]);

  const loadData = async () => {
    const [courseResponse, enrollmentResponse] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('enrollments').select('role').eq('course_id', courseId).eq('user_id', user!.id).single()
    ]);

    if (courseResponse.data) setCourse(courseResponse.data);
    if (enrollmentResponse.data?.role === 'teacher' || profile?.role === 'admin') {
      setIsTeacher(true);
    }

    await loadDiscussions();
  };

  const loadDiscussions = async () => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        author:profiles!discussions_created_by_fkey(full_name, avatar_url)
      `)
      .eq('course_id', courseId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      const discussionsWithCounts = await Promise.all(
        data.map(async (discussion) => {
          const { count } = await supabase
            .from('discussion_posts')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id);

          return {
            ...discussion,
            author: Array.isArray(discussion.author) ? discussion.author[0] : discussion.author,
            post_count: count || 0
          };
        })
      );

      setDiscussions(discussionsWithCounts);
    }

    setLoading(false);
  };

  const createDiscussion = async () => {
    if (!newDiscussion.title.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('discussions').insert({
      course_id: courseId,
      title: newDiscussion.title,
      description: newDiscussion.description,
      created_by: user!.id
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create discussion', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Discussion created successfully' });
      setShowNewDialog(false);
      setNewDiscussion({ title: '', description: '' });
      loadDiscussions();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading discussions...</p>
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
              <h1 className="text-3xl font-bold">{course?.name} - Discussions</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            {isTeacher && (
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Discussion
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Discussion Topic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newDiscussion.title}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                        placeholder="Discussion title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newDiscussion.description}
                        onChange={(e) => setNewDiscussion({ ...newDiscussion, description: e.target.value })}
                        placeholder="Provide context or instructions"
                        rows={4}
                      />
                    </div>
                    <Button onClick={createDiscussion} className="w-full">Create Discussion</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {discussions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No discussions yet. {isTeacher && 'Create your first discussion to get started.'}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <Link key={discussion.id} href={`/courses/${courseId}/discussions/${discussion.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {discussion.pinned && (
                                  <Pin className="h-4 w-4 text-blue-600" />
                                )}
                                <h3 className="font-semibold text-lg">{discussion.title}</h3>
                                {discussion.locked && (
                                  <Badge variant="secondary">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Locked
                                  </Badge>
                                )}
                              </div>
                              {discussion.description && (
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                  {discussion.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Started by {discussion.author?.full_name}</span>
                                <span>{format(new Date(discussion.created_at), 'MMM d, yyyy')}</span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  {discussion.post_count} {discussion.post_count === 1 ? 'reply' : 'replies'}
                                </span>
                              </div>
                            </div>
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
