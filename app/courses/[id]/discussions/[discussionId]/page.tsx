'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, User, Send } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  };
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const discussionId = params.discussionId as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussion, setDiscussion] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadDiscussion();
      loadPosts();
    }
  }, [user, discussionId]);

  const loadDiscussion = async () => {
    const { data } = await supabase
      .from('discussions')
      .select('*, author:profiles!discussions_created_by_fkey(full_name, avatar_url)')
      .eq('id', discussionId)
      .single();

    if (data) {
      setDiscussion({
        ...data,
        author: Array.isArray(data.author) ? data.author[0] : data.author
      });
    }
    setLoading(false);
  };

  const loadPosts = async () => {
    const { data } = await supabase
      .from('discussion_posts')
      .select('*, author:profiles!discussion_posts_author_id_fkey(full_name, avatar_url)')
      .eq('discussion_id', discussionId)
      .is('parent_post_id', null)
      .order('created_at', { ascending: true });

    if (data) {
      setPosts(data.map(post => ({
        ...post,
        author: Array.isArray(post.author) ? post.author[0] : post.author
      })));
    }
  };

  const submitPost = async () => {
    if (!newPost.trim()) {
      toast({ title: 'Error', description: 'Post content is required', variant: 'destructive' });
      return;
    }

    if (discussion?.locked) {
      toast({ title: 'Error', description: 'This discussion is locked', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('discussion_posts').insert({
      discussion_id: discussionId,
      author_id: user!.id,
      content: newPost
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to post', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Posted successfully' });
      setNewPost('');
      loadPosts();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading discussion...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!discussion) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-center py-12">
            <p className="text-gray-500">Discussion not found</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseId}/discussions`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discussions
          </Button>

          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
                  {discussion.description && (
                    <p className="text-gray-700 mb-3">{discussion.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Started by {discussion.author?.full_name} on {format(new Date(discussion.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}</h2>

            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{post.author?.full_name}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!discussion.locked && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Post a Reply</h3>
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="mb-3"
                />
                <Button onClick={submitPost} disabled={submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
