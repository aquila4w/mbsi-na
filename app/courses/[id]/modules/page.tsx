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
import { Plus, FileText, Link as LinkIcon, BookOpen, MessageSquare, ClipboardList, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: string;
  title: string;
  description: string;
  position: number;
  published: boolean;
  unlock_at: string | null;
  items: ModuleItem[];
}

interface ModuleItem {
  id: string;
  type: 'assignment' | 'page' | 'file' | 'quiz' | 'discussion' | 'external_url';
  title: string;
  content: string;
  content_id: string | null;
  url: string | null;
  position: number;
}

export default function CourseModulesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewModuleDialog, setShowNewModuleDialog] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '', published: false });

  useEffect(() => {
    if (user) {
      loadCourseAndModules();
    }
  }, [user, courseId]);

  const loadCourseAndModules = async () => {
    const [courseResponse, enrollmentResponse, modulesResponse] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('enrollments').select('role').eq('course_id', courseId).eq('user_id', user!.id).single(),
      supabase.from('modules').select('*').eq('course_id', courseId).order('position')
    ]);

    if (courseResponse.data) setCourse(courseResponse.data);
    if (enrollmentResponse.data?.role === 'teacher' || profile?.role === 'admin') {
      setIsTeacher(true);
    }

    if (modulesResponse.data) {
      const modulesWithItems = await Promise.all(
        modulesResponse.data.map(async (module) => {
          const { data: items } = await supabase
            .from('module_items')
            .select('*')
            .eq('module_id', module.id)
            .order('position');
          return { ...module, items: items || [] };
        })
      );
      setModules(modulesWithItems);
    }

    setLoading(false);
  };

  const createModule = async () => {
    if (!newModule.title.trim()) {
      toast({ title: 'Error', description: 'Module title is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('modules').insert({
      course_id: courseId,
      title: newModule.title,
      description: newModule.description,
      published: newModule.published,
      position: modules.length
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create module', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Module created successfully' });
      setShowNewModuleDialog(false);
      setNewModule({ title: '', description: '', published: false });
      loadCourseAndModules();
    }
  };

  const toggleModulePublished = async (moduleId: string, published: boolean) => {
    const { error } = await supabase
      .from('modules')
      .update({ published: !published })
      .eq('id', moduleId);

    if (!error) {
      loadCourseAndModules();
      toast({ title: 'Success', description: `Module ${!published ? 'published' : 'unpublished'}` });
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <ClipboardList className="h-4 w-4" />;
      case 'quiz': return <FileText className="h-4 w-4" />;
      case 'page': return <BookOpen className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'external_url': return <LinkIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getItemLink = (item: ModuleItem) => {
    switch (item.type) {
      case 'assignment': return `/assignments/${item.content_id}`;
      case 'quiz': return `/courses/${courseId}/quizzes/${item.content_id}`;
      case 'discussion': return `/courses/${courseId}/discussions/${item.content_id}`;
      case 'page': return `/courses/${courseId}/pages/${item.id}`;
      case 'external_url': return item.url || '#';
      default: return '#';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading modules...</p>
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
              <h1 className="text-3xl font-bold">{course?.name} - Modules</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            {isTeacher && (
              <Dialog open={showNewModuleDialog} onOpenChange={setShowNewModuleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Module
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Module</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newModule.title}
                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        placeholder="Module title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newModule.description}
                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                        placeholder="Module description"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newModule.published}
                        onCheckedChange={(checked) => setNewModule({ ...newModule, published: checked })}
                      />
                      <Label>Publish immediately</Label>
                    </div>
                    <Button onClick={createModule} className="w-full">Create Module</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {modules.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">No modules yet. {isTeacher && 'Create your first module to get started.'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          {!module.published && (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Unpublished
                            </Badge>
                          )}
                        </div>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                        )}
                      </div>
                      {isTeacher && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleModulePublished(module.id, module.published)}
                        >
                          {module.published ? 'Unpublish' : 'Publish'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {module.items.length === 0 ? (
                      <p className="text-gray-500 text-sm">No items in this module yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {module.items.map((item) => (
                          <Link key={item.id} href={getItemLink(item)}>
                            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="text-gray-600">
                                {getItemIcon(item.type)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-xs text-gray-500 capitalize">{item.type.replace('_', ' ')}</div>
                              </div>
                              {item.type === 'external_url' && (
                                <LinkIcon className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </Link>
                        ))}
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
