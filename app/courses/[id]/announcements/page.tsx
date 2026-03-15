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
import { Plus, Megaphone, Pin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  posted_by: string;
  posted_at: string;
  pinned: boolean;
  author: {
    full_name: string;
  };
}

export default function CourseAnnouncementsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', pinned: false });

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

    await loadAnnouncements();
  };

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*, author:profiles!announcements_posted_by_fkey(full_name)')
      .eq('course_id', courseId)
      .order('pinned', { ascending: false })
      .order('posted_at', { ascending: false });

    if (data) {
      setAnnouncements(data.map(a => ({
        ...a,
        author: Array.isArray(a.author) ? a.author[0] : a.author
      })));
    }
    setLoading(false);
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('announcements').insert({
      course_id: courseId,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      posted_by: user!.id,
      pinned: newAnnouncement.pinned
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create announcement', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Announcement posted' });
      setShowNewDialog(false);
      setNewAnnouncement({ title: '', content: '', pinned: false });
      loadAnnouncements();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading announcements...</p>
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
              <h1 className="text-3xl font-bold">{course?.name} - Announcements</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            {isTeacher && (
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        placeholder="Announcement content"
                        rows={6}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAnnouncement.pinned}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                        className="rounded"
                      />
                      <Label>Pin this announcement</Label>
                    </div>
                    <Button onClick={createAnnouncement} className="w-full">Post Announcement</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {announcements.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No announcements yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className={announcement.pinned ? 'border-l-4 border-l-blue-500' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Megaphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold">{announcement.title}</h3>
                              {announcement.pinned && (
                                <Badge variant="secondary">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Posted by {announcement.author?.full_name} on {format(new Date(announcement.posted_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                      </div>
                    </div>
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
