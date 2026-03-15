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
import { Plus, Users, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  description: string;
  max_members: number | null;
  members: GroupMember[];
}

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  user: {
    full_name: string;
    email: string;
  };
}

export default function CourseGroupsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', max_members: '' });

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

    await loadGroups();
  };

  const loadGroups = async () => {
    const { data: groupsData } = await supabase
      .from('groups')
      .select('*')
      .eq('course_id', courseId)
      .order('name');

    if (groupsData) {
      const groupsWithMembers = await Promise.all(
        groupsData.map(async (group) => {
          const { data: members } = await supabase
            .from('group_members')
            .select('*, user:profiles(full_name, email)')
            .eq('group_id', group.id);

          return {
            ...group,
            members: members?.map(m => ({
              ...m,
              user: Array.isArray(m.user) ? m.user[0] : m.user
            })) || []
          };
        })
      );

      setGroups(groupsWithMembers);
    }

    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({ title: 'Error', description: 'Group name is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('groups').insert({
      course_id: courseId,
      name: newGroup.name,
      description: newGroup.description,
      max_members: newGroup.max_members ? parseInt(newGroup.max_members) : null
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create group', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Group created successfully' });
      setShowNewDialog(false);
      setNewGroup({ name: '', description: '', max_members: '' });
      loadGroups();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading groups...</p>
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
              <h1 className="text-3xl font-bold">{course?.name} - Groups</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            {isTeacher && (
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Group Name</Label>
                      <Input
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="Group name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="Group description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Max Members (optional)</Label>
                      <Input
                        type="number"
                        value={newGroup.max_members}
                        onChange={(e) => setNewGroup({ ...newGroup, max_members: e.target.value })}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                    <Button onClick={createGroup} className="w-full">Create Group</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No groups yet. {isTeacher && 'Create your first group to get started.'}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {group.members.length}
                        {group.max_members && `/${group.max_members}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {group.members.length === 0 ? (
                        <p className="text-sm text-gray-500">No members yet</p>
                      ) : (
                        group.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="flex-1">{member.user.full_name}</span>
                            {member.role === 'leader' && (
                              <Badge variant="outline" className="text-xs">Leader</Badge>
                            )}
                          </div>
                        ))
                      )}
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
