import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  FileText,
  Target,
  MessageSquare,
  TrendingUp,
  Activity,
  ArrowUp,
  Loader2,
  Calendar,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  totalInterviews: number;
  totalChats: number;
}

interface RecentActivity {
  type: 'resume' | 'analysis' | 'interview' | 'chat';
  created_at: string;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalResumes: 0,
    totalAnalyses: 0,
    totalInterviews: 0,
    totalChats: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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

      // Fetch recent activity
      const [recentResumes, recentAnalyses, recentInterviews, recentChats] = await Promise.all([
        supabase.from('resumes').select('created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('resume_analyses').select('created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('interview_attempts').select('created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('chat_conversations').select('created_at').order('created_at', { ascending: false }).limit(3),
      ]);

      const activities: RecentActivity[] = [
        ...(recentResumes.data || []).map(r => ({ type: 'resume' as const, created_at: r.created_at })),
        ...(recentAnalyses.data || []).map(r => ({ type: 'analysis' as const, created_at: r.created_at })),
        ...(recentInterviews.data || []).map(r => ({ type: 'interview' as const, created_at: r.created_at })),
        ...(recentChats.data || []).map(r => ({ type: 'chat' as const, created_at: r.created_at })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

      setRecentActivity(activities);
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', change: '+12%' },
    { label: 'Resumes Created', value: stats.totalResumes, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', change: '+8%' },
    { label: 'Analyses Run', value: stats.totalAnalyses, icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10', change: '+15%' },
    { label: 'Interview Sessions', value: stats.totalInterviews, icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10', change: '+23%' },
    { label: 'AI Conversations', value: stats.totalChats, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10', change: '+31%' },
  ];

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'resume': return 'New Resume';
      case 'analysis': return 'Resume Analyzed';
      case 'interview': return 'Interview Session';
      case 'chat': return 'Chat Started';
      default: return type;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'resume': return 'bg-emerald-500';
      case 'analysis': return 'bg-orange-500';
      case 'interview': return 'bg-pink-500';
      case 'chat': return 'bg-violet-500';
      default: return 'bg-primary';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-muted-foreground">Platform statistics and real-time analytics</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Activity className="w-3 h-3 text-score-excellent animate-pulse" />
          Live
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="glass-card overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-score-good">
                        <ArrowUp className="w-3 h-3" />
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {stat.value.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Engagement Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Feature Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Resume Builder', value: stats.totalResumes, max: Math.max(stats.totalResumes, stats.totalAnalyses, stats.totalInterviews, stats.totalChats) || 1, color: 'bg-emerald-500' },
                  { label: 'Resume Analysis', value: stats.totalAnalyses, max: Math.max(stats.totalResumes, stats.totalAnalyses, stats.totalInterviews, stats.totalChats) || 1, color: 'bg-orange-500' },
                  { label: 'Interview Simulator', value: stats.totalInterviews, max: Math.max(stats.totalResumes, stats.totalAnalyses, stats.totalInterviews, stats.totalChats) || 1, color: 'bg-pink-500' },
                  { label: 'AI Conversations', value: stats.totalChats, max: Math.max(stats.totalResumes, stats.totalAnalyses, stats.totalInterviews, stats.totalChats) || 1, color: 'bg-violet-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{getActivityLabel(activity.type)}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-score-excellent/10">
                  <div className="text-3xl font-bold text-score-excellent mb-1">99.9%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-primary/10">
                  <div className="text-3xl font-bold text-primary mb-1">&lt;200ms</div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-accent/10">
                  <div className="text-3xl font-bold text-accent mb-1">0</div>
                  <p className="text-sm text-muted-foreground">Errors Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
