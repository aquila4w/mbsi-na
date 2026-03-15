'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AssignmentGroup {
  id: string;
  name: string;
  weight: number;
  position: number;
  drop_lowest: number;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  grades: { [assignmentId: string]: number };
  categoryAverages: { [groupId: string]: number };
  totalGrade: number;
}

export default function GradebookPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [assignmentGroups, setAssignmentGroups] = useState<AssignmentGroup[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', weight: '0', drop_lowest: '0' });

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

    await loadGradebook();
  };

  const loadGradebook = async () => {
    const [groupsResponse, assignmentsResponse, enrollmentsResponse] = await Promise.all([
      supabase.from('assignment_groups').select('*').eq('course_id', courseId).order('position'),
      supabase.from('assignments').select('*').eq('course_id', courseId).eq('status', 'published').order('due_date'),
      supabase.from('enrollments').select('*, profiles(full_name, email)').eq('course_id', courseId).eq('role', 'student').eq('status', 'active')
    ]);

    const groups = groupsResponse.data || [];
    const assignments = assignmentsResponse.data || [];
    const enrollments = enrollmentsResponse.data || [];

    setAssignmentGroups(groups);
    setAssignments(assignments);

    const studentsData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentProfile = Array.isArray(enrollment.profiles) ? enrollment.profiles[0] : enrollment.profiles;

        const { data: submissions } = await supabase
          .from('submissions')
          .select('assignment_id, grade')
          .eq('student_id', enrollment.user_id)
          .eq('status', 'graded');

        const grades: { [key: string]: number } = {};
        submissions?.forEach(sub => {
          if (sub.grade !== null) {
            grades[sub.assignment_id] = sub.grade;
          }
        });

        const categoryAverages: { [key: string]: number } = {};
        groups.forEach(group => {
          const groupAssignments = assignments.filter(a => a.group_id === group.id);
          if (groupAssignments.length > 0) {
            const scores = groupAssignments.map(a => {
              const grade = grades[a.id];
              return grade !== undefined ? (grade / a.points_possible) * 100 : null;
            }).filter(s => s !== null) as number[];

            if (scores.length > 0) {
              if (group.drop_lowest > 0 && scores.length > group.drop_lowest) {
                scores.sort((a, b) => a - b);
                scores.splice(0, group.drop_lowest);
              }
              categoryAverages[group.id] = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
          }
        });

        let totalGrade = 0;
        let totalWeight = 0;
        groups.forEach(group => {
          if (categoryAverages[group.id] !== undefined) {
            totalGrade += categoryAverages[group.id] * (group.weight / 100);
            totalWeight += group.weight;
          }
        });

        return {
          id: enrollment.user_id,
          full_name: studentProfile?.full_name || '',
          email: studentProfile?.email || '',
          grades,
          categoryAverages,
          totalGrade: totalWeight > 0 ? totalGrade : 0
        };
      })
    );

    setStudents(studentsData);
    setLoading(false);
  };

  const createAssignmentGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({ title: 'Error', description: 'Group name is required', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('assignment_groups').insert({
      course_id: courseId,
      name: newGroup.name,
      weight: parseFloat(newGroup.weight),
      drop_lowest: parseInt(newGroup.drop_lowest),
      position: assignmentGroups.length
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create assignment group', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Assignment group created' });
      setShowNewGroupDialog(false);
      setNewGroup({ name: '', weight: '0', drop_lowest: '0' });
      loadGradebook();
    }
  };

  const exportGrades = () => {
    let csv = 'Student Name,Email';
    assignmentGroups.forEach(group => csv += `,${group.name} Average`);
    csv += ',Total Grade\n';

    students.forEach(student => {
      csv += `${student.full_name},${student.email}`;
      assignmentGroups.forEach(group => {
        const avg = student.categoryAverages[group.id];
        csv += `,${avg !== undefined ? avg.toFixed(2) : ''}`;
      });
      csv += `,${student.totalGrade.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course?.code}_gradebook.csv`;
    a.click();
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading gradebook...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course?.name} - Gradebook</h1>
              <p className="text-gray-600 mt-1">{course?.code}</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Assignment Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="e.g., Homework, Exams, Projects"
                      />
                    </div>
                    <div>
                      <Label>Weight (%)</Label>
                      <Input
                        type="number"
                        value={newGroup.weight}
                        onChange={(e) => setNewGroup({ ...newGroup, weight: e.target.value })}
                        placeholder="0-100"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label>Drop Lowest N Scores</Label>
                      <Input
                        type="number"
                        value={newGroup.drop_lowest}
                        onChange={(e) => setNewGroup({ ...newGroup, drop_lowest: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <Button onClick={createAssignmentGroup} className="w-full">Create Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={exportGrades}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {assignmentGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grading Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {assignmentGroups.map(group => (
                    <Badge key={group.id} variant="secondary" className="text-sm px-3 py-1">
                      {group.name}: {group.weight}%
                      {group.drop_lowest > 0 && ` (Drop ${group.drop_lowest})`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-48">Student</TableHead>
                      {assignmentGroups.map(group => (
                        <TableHead key={group.id}>{group.name}</TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </TableCell>
                        {assignmentGroups.map(group => (
                          <TableCell key={group.id}>
                            {student.categoryAverages[group.id] !== undefined
                              ? `${student.categoryAverages[group.id].toFixed(1)}%`
                              : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="font-semibold">
                          {student.totalGrade > 0 ? `${student.totalGrade.toFixed(1)}%` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
