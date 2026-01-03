import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gamepad2,
  Trophy,
  Flame,
  Star,
  Zap,
  Target,
  Code,
  Palette,
  Globe,
  FileCode,
  Loader2,
  ChevronRight,
  Medal,
  Crown,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GameStats {
  total_xp: number;
  games_completed: number;
  current_streak: number;
  longest_streak: number;
  html_level: number;
  css_level: number;
  javascript_level: number;
  typescript_level: number;
  python_level: number;
  rust_level: number;
}

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  games_completed: number;
  profile?: { full_name: string | null; avatar_url: string | null };
}

const languages = [
  { id: 'html', name: 'HTML', icon: Globe, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', text: 'text-orange-500', description: 'Build web structure' },
  { id: 'css', name: 'CSS', icon: Palette, color: 'from-blue-500 to-purple-500', bg: 'bg-blue-500/10', text: 'text-blue-500', description: 'Style your designs' },
  { id: 'javascript', name: 'JavaScript', icon: Zap, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', text: 'text-yellow-500', description: 'Add interactivity' },
  { id: 'typescript', name: 'TypeScript', icon: Code, color: 'from-blue-600 to-blue-400', bg: 'bg-blue-600/10', text: 'text-blue-600', description: 'Type-safe coding' },
  { id: 'python', name: 'Python', icon: FileCode, color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-500', description: 'Versatile scripting' },
  { id: 'rust', name: 'Rust', icon: Target, color: 'from-rose-500 to-red-600', bg: 'bg-rose-500/10', text: 'text-rose-500', description: 'System programming' },
];

export default function Games() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('games');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    // Load user stats
    const { data: statsData } = await supabase
      .from('user_game_stats')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (statsData) {
      setStats(statsData);
    } else if (user) {
      // Create stats if not exists
      await supabase.from('user_game_stats').insert({ user_id: user.id });
      setStats({
        total_xp: 0,
        games_completed: 0,
        current_streak: 0,
        longest_streak: 0,
        html_level: 1,
        css_level: 1,
        javascript_level: 1,
        typescript_level: 1,
        python_level: 1,
        rust_level: 1,
      });
    }

    // Load leaderboard
    const { data: leaderboardData } = await supabase
      .from('user_game_stats')
      .select('user_id, total_xp, games_completed')
      .order('total_xp', { ascending: false })
      .limit(10);

    if (leaderboardData) {
      // Fetch profiles for leaderboard
      const userIds = leaderboardData.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
      setLeaderboard(leaderboardData.map(l => ({
        ...l,
        profile: profileMap.get(l.user_id),
      })));
    }

    setLoading(false);
  };

  const getLevelForLanguage = (lang: string): number => {
    if (!stats) return 1;
    switch (lang) {
      case 'html': return stats.html_level;
      case 'css': return stats.css_level;
      case 'javascript': return stats.javascript_level;
      case 'typescript': return stats.typescript_level;
      case 'python': return stats.python_level;
      case 'rust': return stats.rust_level;
      default: return 1;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 md:py-8 px-4 max-w-7xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 md:mb-12 p-6 md:p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2NHptMC04aC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6bS04IDBoLTJ2LTRoMnY0em04IDE2aC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6bS04IDBoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <Gamepad2 className="w-10 h-10 md:w-14 md:h-14 text-primary-foreground" />
              </div>
            </div>
            
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
                Learn Coding by <span className="gradient-text">Playing</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Master programming through interactive games. From HTML to Rust, level up your skills while having fun!
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3 md:gap-4 flex-wrap justify-center lg:justify-end">
              <div className="px-4 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stats?.total_xp || 0}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-emerald-500">{stats?.games_completed || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border text-center min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5" />
                  {stats?.current_streak || 0}
                </div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 p-1 flex-wrap h-auto">
            <TabsTrigger value="games" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Medal className="w-4 h-4" />
              <span className="hidden sm:inline">Achievements</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-8">
            {/* Language Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {languages.map((lang, index) => {
                const Icon = lang.icon;
                const level = getLevelForLanguage(lang.id);
                const xpProgress = (level % 1) * 100 || (level > 1 ? 100 : 0);
                
                return (
                  <motion.div
                    key={lang.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden"
                      onClick={() => navigate(`/games/${lang.id}`)}
                    >
                      <div className={`h-2 bg-gradient-to-r ${lang.color}`} />
                      <CardContent className="p-5 md:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl ${lang.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-7 h-7 ${lang.text}`} />
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            Level {level}
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-1">{lang.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{lang.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress to Level {level + 1}</span>
                            <span className="font-medium">{Math.round(xpProgress)}%</span>
                          </div>
                          <Progress value={xpProgress} className="h-2" />
                        </div>
                        
                        <Button className="w-full mt-4 gap-2 group-hover:bg-primary" variant="outline">
                          Play Now
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats?.longest_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{languages.filter(l => getLevelForLanguage(l.id) > 1).length}</p>
                    <p className="text-xs text-muted-foreground">Languages</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">∞</p>
                    <p className="text-xs text-muted-foreground">Games Available</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{leaderboard.length}</p>
                    <p className="text-xs text-muted-foreground">Players</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>Top players by XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No players yet. Be the first!</p>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <div 
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          entry.user_id === user?.id 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-secondary/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-yellow-950' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-amber-600 text-amber-50' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index === 0 ? <Crown className="w-5 h-5" /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{entry.profile?.full_name || 'Anonymous Coder'}</p>
                          <p className="text-sm text-muted-foreground">{entry.games_completed} games completed</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{entry.total_xp}</p>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsSection userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AchievementsSection({ userId }: { userId?: string }) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    const { data: allAchievements } = await supabase
      .from('game_achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (allAchievements) setAchievements(allAchievements);

    if (userId) {
      const { data: userAch } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      
      if (userAch) {
        setUserAchievements(new Set(userAch.map(a => a.achievement_id)));
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const unlocked = userAchievements.has(achievement.id);
        return (
          <Card 
            key={achievement.id}
            className={`glass-card transition-all ${unlocked ? 'border-primary/50' : 'opacity-60'}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  unlocked ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant="outline" className="mt-2 gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {achievement.xp_reward} XP
                  </Badge>
                </div>
                {unlocked && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}