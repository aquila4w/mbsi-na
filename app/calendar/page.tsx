'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CalendarEvent {
  id: string;
  title: string;
  due_date: string;
  type: 'assignment' | 'quiz';
  course_id: string;
  course_name: string;
  course_code: string;
  points_possible: number;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentMonth]);

  const loadEvents = async () => {
    if (!user) return;

    setLoading(true);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const courseIds = enrollments.map(e => e.course_id);

    const [assignmentsResponse, quizzesResponse] = await Promise.all([
      supabase
        .from('assignments')
        .select('id, title, due_date, course_id, points_possible, courses(name, code)')
        .in('course_id', courseIds)
        .eq('status', 'published')
        .gte('due_date', monthStart.toISOString())
        .lte('due_date', monthEnd.toISOString())
        .order('due_date'),
      supabase
        .from('quizzes')
        .select('id, title, due_date, course_id, points_possible, courses(name, code)')
        .in('course_id', courseIds)
        .eq('status', 'published')
        .gte('due_date', monthStart.toISOString())
        .lte('due_date', monthEnd.toISOString())
        .order('due_date')
    ]);

    const allEvents: CalendarEvent[] = [
      ...(assignmentsResponse.data || []).map(a => ({
        id: a.id,
        title: a.title,
        due_date: a.due_date,
        type: 'assignment' as const,
        course_id: a.course_id,
        course_name: (a.courses as any)?.name || '',
        course_code: (a.courses as any)?.code || '',
        points_possible: a.points_possible
      })),
      ...(quizzesResponse.data || []).map(q => ({
        id: q.id,
        title: q.title,
        due_date: q.due_date,
        type: 'quiz' as const,
        course_id: q.course_id,
        course_name: (q.courses as any)?.name || '',
        course_code: (q.courses as any)?.code || '',
        points_possible: q.points_possible
      }))
    ];

    allEvents.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    setEvents(allEvents);
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.due_date), date)
    );
  };

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Calendar</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    Previous
                  </Button>
                  <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm py-2">
                      {day}
                    </div>
                  ))}
                  {days.map((day, idx) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          min-h-20 p-2 border rounded-lg text-left transition-colors
                          ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
                          ${isSelected ? 'ring-2 ring-blue-500' : ''}
                          ${isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-200'}
                        `}
                      >
                        <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                event.type === 'assignment'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map(event => (
                        <Link
                          key={event.id}
                          href={event.type === 'assignment' ? `/assignments/${event.id}` : `/courses/${event.course_id}/quizzes/${event.id}`}
                        >
                          <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant={event.type === 'assignment' ? 'default' : 'secondary'}>
                                {event.type}
                              </Badge>
                              <span className="text-sm font-medium">{event.points_possible} pts</span>
                            </div>
                            <h4 className="font-medium mb-1">{event.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{event.course_code}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(event.due_date), 'h:mm a')}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No events on this date</p>
                  )
                ) : (
                  <p className="text-gray-500 text-center py-8">Click a date to view events</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading...</p>
              ) : events.length > 0 ? (
                <div className="space-y-2">
                  {events.slice(0, 10).map(event => (
                    <Link
                      key={event.id}
                      href={event.type === 'assignment' ? `/assignments/${event.id}` : `/courses/${event.course_id}/quizzes/${event.id}`}
                    >
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={event.type === 'assignment' ? 'default' : 'secondary'}>
                              {event.type}
                            </Badge>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <p className="text-sm text-gray-600">{event.course_code} - {event.course_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{format(new Date(event.due_date), 'MMM d')}</div>
                          <div className="text-xs text-gray-500">{format(new Date(event.due_date), 'h:mm a')}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No upcoming deadlines this month</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
