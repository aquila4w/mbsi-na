'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface Question {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  answers: Answer[];
}

interface Answer {
  answer_text: string;
  is_correct: boolean;
}

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    quiz_type: 'graded' as 'practice' | 'graded' | 'survey',
    time_limit: '',
    points_possible: 100,
    allowed_attempts: 1,
    shuffle_answers: false,
    show_correct_answers: true,
    due_date: '',
    status: 'draft' as 'draft' | 'published'
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      answers: [
        { answer_text: '', is_correct: false },
        { answer_text: '', is_correct: false }
      ]
    }
  ]);

  const [submitting, setSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        answers: [
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false }
        ]
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers.push({ answer_text: '', is_correct: false });
    setQuestions(updated);
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answers = updated[questionIndex].answers.filter((_, i) => i !== answerIndex);
    setQuestions(updated);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value
    };
    setQuestions(updated);
  };

  const saveQuiz = async () => {
    if (!quiz.title.trim()) {
      toast({ title: 'Error', description: 'Quiz title is required', variant: 'destructive' });
      return;
    }

    if (questions.some(q => !q.question_text.trim())) {
      toast({ title: 'Error', description: 'All questions must have text', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        course_id: courseId,
        title: quiz.title,
        description: quiz.description,
        quiz_type: quiz.quiz_type,
        time_limit: quiz.time_limit ? parseInt(quiz.time_limit) : null,
        points_possible: quiz.points_possible,
        allowed_attempts: quiz.allowed_attempts,
        shuffle_answers: quiz.shuffle_answers,
        show_correct_answers: quiz.show_correct_answers,
        due_date: quiz.due_date || null,
        status: quiz.status,
        created_by: user!.id
      })
      .select()
      .single();

    if (quizError) {
      toast({ title: 'Error', description: 'Failed to create quiz', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizData.id,
          question_text: question.question_text,
          question_type: question.question_type,
          points: question.points,
          position: i
        })
        .select()
        .single();

      if (questionError) continue;

      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        for (let j = 0; j < question.answers.length; j++) {
          await supabase.from('quiz_answers').insert({
            question_id: questionData.id,
            answer_text: question.answers[j].answer_text,
            is_correct: question.answers[j].is_correct,
            position: j
          });
        }
      }
    }

    toast({ title: 'Success', description: 'Quiz created successfully' });
    router.push(`/courses/${courseId}/quizzes`);
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
      <DashboardLayout>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold">Create Quiz</h1>

          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="Quiz title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={quiz.description}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                  placeholder="Quiz instructions"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quiz Type</Label>
                  <Select value={quiz.quiz_type} onValueChange={(value: any) => setQuiz({ ...quiz, quiz_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice Quiz</SelectItem>
                      <SelectItem value="graded">Graded Quiz</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={quiz.time_limit}
                    onChange={(e) => setQuiz({ ...quiz, time_limit: e.target.value })}
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Points Possible</Label>
                  <Input
                    type="number"
                    value={quiz.points_possible}
                    onChange={(e) => setQuiz({ ...quiz, points_possible: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Allowed Attempts</Label>
                  <Input
                    type="number"
                    value={quiz.allowed_attempts}
                    onChange={(e) => setQuiz({ ...quiz, allowed_attempts: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Due Date</Label>
                <Input
                  type="datetime-local"
                  value={quiz.due_date}
                  onChange={(e) => setQuiz({ ...quiz, due_date: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={quiz.shuffle_answers}
                  onCheckedChange={(checked) => setQuiz({ ...quiz, shuffle_answers: checked })}
                />
                <Label>Shuffle answer order</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={quiz.show_correct_answers}
                  onCheckedChange={(checked) => setQuiz({ ...quiz, show_correct_answers: checked })}
                />
                <Label>Show correct answers after submission</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={quiz.status === 'published'}
                  onCheckedChange={(checked) => setQuiz({ ...quiz, status: checked ? 'published' : 'draft' })}
                />
                <Label>Publish immediately</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Questions</h2>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={question.question_type}
                        onValueChange={(value) => updateQuestion(qIndex, 'question_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="short_answer">Short Answer</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>

                  {(question.question_type === 'multiple_choice' || question.question_type === 'true_false') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Answer Choices</Label>
                        {question.question_type === 'multiple_choice' && (
                          <Button size="sm" variant="outline" onClick={() => addAnswer(qIndex)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add Answer
                          </Button>
                        )}
                      </div>

                      {question.answers.map((answer, aIndex) => (
                        <div key={aIndex} className="flex items-center gap-2">
                          <Switch
                            checked={answer.is_correct}
                            onCheckedChange={(checked) => updateAnswer(qIndex, aIndex, 'is_correct', checked)}
                          />
                          <Input
                            value={answer.answer_text}
                            onChange={(e) => updateAnswer(qIndex, aIndex, 'answer_text', e.target.value)}
                            placeholder="Answer text"
                          />
                          {question.question_type === 'multiple_choice' && question.answers.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAnswer(qIndex, aIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={saveQuiz} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Quiz'}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
