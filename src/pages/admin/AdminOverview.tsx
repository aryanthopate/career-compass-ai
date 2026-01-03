import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Target, MessageSquare, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  totalInterviews: number;
  totalChats: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalResumes: 0,
    totalAnalyses: 0,
    totalInterviews: 0,
    totalChats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [users, resumes, analyses, interviews, chats] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('resumes').select('id', { count: 'exact', head: true }),
        supabase.from('resume_analyses').select('id', { count: 'exact', head: true }),
        supabase.from('interview_attempts').select('id', { count: 'exact', head: true }),
        supabase.from('chat_conversations').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: users.count || 0,
        totalResumes: resumes.count || 0,
        totalAnalyses: analyses.count || 0,
        totalInterviews: interviews.count || 0,
        totalChats: chats.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Resumes Created', value: stats.totalResumes, icon: FileText, color: 'text-accent' },
    { label: 'Analyses Run', value: stats.totalAnalyses, icon: Target, color: 'text-score-good' },
    { label: 'Interview Attempts', value: stats.totalInterviews, icon: MessageSquare, color: 'text-score-average' },
    { label: 'AI Conversations', value: stats.totalChats, icon: TrendingUp, color: 'text-score-excellent' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Platform statistics and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Activity feed coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
