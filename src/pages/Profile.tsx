import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useResume } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  FileText,
  BarChart3,
  Target,
  MessageSquare,
  Compass,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Code,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Clock,
  Zap,
  Image,
  X,
  Upload,
  Gamepad2,
  Trophy,
  Flame,
  Star,
  Sparkles,
  Shield,
  Activity,
  Award,
  Cpu,
  Database,
  Terminal,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { resumes, analyses, skillGaps, interviewAttempts, careerVerdict } = useResume();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadGameStats();
      // Load banner from localStorage
      const savedBanner = localStorage.getItem(`banner_${user.id}`);
      if (savedBanner) setBannerUrl(savedBanner);
    }
  }, [user]);

  const loadGameStats = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_game_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setGameStats(data);
  };

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      return;
    }

    let nextProfile = data as ProfileData | null;

    // If the user doesn't have a profile row yet, create it so Profile page works.
    if (!nextProfile) {
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email || null,
          full_name: null,
          avatar_url: null,
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        setLoading(false);
        return;
      }

      nextProfile = created as ProfileData;
    }

    setProfile(nextProfile);
    setFormData({
      full_name: nextProfile.full_name || '',
      avatar_url: nextProfile.avatar_url || '',
    });

    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const payload = {
      full_name: formData.full_name || null,
      avatar_url: formData.avatar_url || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = profile
      ? await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', user.id)
          .select('*')
          .single()
      : await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || null,
            ...payload,
          })
          .select('*')
          .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setSaving(false);
      return;
    }

    setProfile(data as ProfileData);
    toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
    setEditDialogOpen(false);
    setSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setBannerUrl(url);
        localStorage.setItem(`banner_${user.id}`, url);
        toast({ title: 'Banner updated', description: 'Your banner has been changed.' });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    if (user) {
      setBannerUrl(null);
      localStorage.removeItem(`banner_${user.id}`);
      toast({ title: 'Banner removed' });
    }
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const latestResume = resumes[0];
  const latestAnalysis = analyses[0];

  const stats = [
    { label: 'Resumes', value: resumes.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Analyses', value: analyses.length, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Games XP', value: gameStats?.total_xp || 0, icon: Gamepad2, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Streak', value: gameStats?.current_streak || 0, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Cpu className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* High-tech background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <Header />
      
      <main className="container py-8 max-w-6xl relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header - Futuristic Design */}
          <motion.div variants={itemVariants} className="relative mb-8">
            {/* Cover Banner with Cyber Effect */}
            <div className="relative h-36 sm:h-48 md:h-60 rounded-3xl overflow-hidden group">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-accent relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0tOCAwaC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6bTggMTZoLTJ2LTRoMnY0em0tOCAwaC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                  {/* Animated scan line */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan" />
                  </div>
                  {/* Corner decorations */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30" />
                </div>
              )}
              
              {/* Banner Edit Controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                <Button variant="secondary" size="sm" onClick={() => bannerInputRef.current?.click()} className="gap-2 bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20">
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">Change Banner</span>
                </Button>
                {bannerUrl && (
                  <Button variant="destructive" size="sm" onClick={removeBanner} className="gap-2">
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Avatar & Profile Info - Enhanced */}
            <div className="absolute -bottom-14 sm:-bottom-16 left-4 sm:left-8 flex items-end gap-4 sm:gap-6">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Glowing ring effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-50 group-hover:opacity-75 transition" />
                <div className="relative w-24 h-24 sm:w-32 md:w-36 sm:h-32 md:h-36 rounded-2xl bg-card border-4 border-background shadow-2xl flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                      {getInitials(formData.full_name, profile?.email)}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setEditDialogOpen(true)}
                  className="absolute -bottom-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shadow-lg hover:shadow-primary/50 transition-all hover:scale-110"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </motion.div>
              
              <div className="pb-3 sm:pb-5 hidden sm:block">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {formData.full_name || 'Set your name'}
                  </h1>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 mt-2 text-sm">
                  <Mail className="w-4 h-4" />
                  {profile?.email || user?.email}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3 text-green-500" />
                    Active Now
                  </span>
                </div>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <Button 
                onClick={() => setEditDialogOpen(true)}
                className="gap-2 shadow-lg bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white"
                size="sm"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </Button>
            </div>
          </motion.div>
          
          {/* Mobile Profile Info */}
          <div className="sm:hidden mt-18 mb-4 px-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{formData.full_name || 'Set your name'}</h1>
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-xs">
                <Shield className="w-2.5 h-2.5 mr-0.5" />
                Verified
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
              <Mail className="w-4 h-4" />
              {profile?.email || user?.email}
            </p>
          </div>
          
          {/* Stats Grid - Futuristic Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 sm:mt-20 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl shadow-xl">
                    {/* Glowing top border */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
                      index === 0 ? 'from-blue-500 to-cyan-500' :
                      index === 1 ? 'from-emerald-500 to-green-500' :
                      index === 2 ? 'from-cyan-500 to-blue-500' :
                      'from-orange-500 to-red-500'
                    }`} />
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center relative`}>
                        <div className={`absolute inset-0 ${stat.bg} rounded-2xl blur-xl opacity-50`} />
                        <Icon className={`w-7 h-7 ${stat.color} relative z-10`} />
                      </div>
                      <div>
                        <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-xl p-1.5 border border-border/50">
                <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-foreground">
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-foreground">
                  <Database className="w-4 h-4" />
                  My Data
                </TabsTrigger>
              </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Career Readiness */}
            {careerVerdict && (
              <Card className="glass-card overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Compass className="w-5 h-5 text-primary" />
                        Career Verdict
                      </h3>
                      <p className="text-sm text-muted-foreground">Your overall career readiness</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">{careerVerdict.hiringProbability}%</div>
                      <p className="text-sm text-muted-foreground">Hiring Probability</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Resume</span>
                        <span className="font-semibold">{careerVerdict.resumeReadiness}%</span>
                      </div>
                      <Progress value={careerVerdict.resumeReadiness} className="h-2" />
                    </div>
                    <div className="p-4 rounded-xl bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Skills</span>
                        <span className="font-semibold">{careerVerdict.skillReadiness}%</span>
                      </div>
                      <Progress value={careerVerdict.skillReadiness} className="h-2" />
                    </div>
                    <div className="p-4 rounded-xl bg-card/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Interview</span>
                        <span className="font-semibold">{careerVerdict.interviewReadiness}%</span>
                      </div>
                      <Progress value={careerVerdict.interviewReadiness} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Latest Resume */}
              {latestResume && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      Latest Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{latestResume.name || 'Untitled Resume'}</p>
                        <p className="text-sm text-muted-foreground">Version {latestResume.version}</p>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(latestResume.updatedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <Briefcase className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-semibold">{latestResume.experience?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <Code className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-semibold">{latestResume.skills?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Skills</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50">
                        <GraduationCap className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <div className="text-lg font-semibold">{latestResume.education?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Education</div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate('/resume-builder')}>
                      Edit Resume
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Latest Analysis */}
              {latestAnalysis && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="w-5 h-5 text-emerald-500" />
                      Latest Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="40" fill="none"
                            stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                            strokeDasharray={`${latestAnalysis.score * 2.51} 251`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold">{latestAnalysis.score}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Overall Score</p>
                        <p className="text-sm text-muted-foreground">
                          ATS Score: {latestAnalysis.atsScore}%
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-emerald-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {latestAnalysis.strengthAreas.length} Strengths
                          </Badge>
                          <Badge variant="outline" className="text-destructive">
                            {latestAnalysis.weaknesses.length} Issues
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={() => navigate('/resume-analysis')}>
                      View Full Analysis
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/resume-builder')}>
                    <FileText className="w-5 h-5" />
                    <span>Build Resume</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/resume-analysis')}>
                    <BarChart3 className="w-5 h-5" />
                    <span>Analyze Resume</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/skill-gap')}>
                    <Target className="w-5 h-5" />
                    <span>Check Skills</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/interview')}>
                    <MessageSquare className="w-5 h-5" />
                    <span>Practice Interview</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <div className="grid gap-6">
              {/* Career Verdict Data */}
              {careerVerdict && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-violet-500" />
                      Career Verdict Data
                    </CardTitle>
                    <CardDescription>Your AI-generated career assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-secondary/50 text-center">
                        <div className="text-2xl font-bold text-primary">{careerVerdict.hiringProbability}%</div>
                        <div className="text-xs text-muted-foreground">Hiring Probability</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 text-center">
                        <div className="text-2xl font-bold">{careerVerdict.resumeReadiness}%</div>
                        <div className="text-xs text-muted-foreground">Resume Ready</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 text-center">
                        <div className="text-2xl font-bold">{careerVerdict.skillReadiness}%</div>
                        <div className="text-xs text-muted-foreground">Skills Ready</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/50 text-center">
                        <div className="text-2xl font-bold">{careerVerdict.interviewReadiness}%</div>
                        <div className="text-xs text-muted-foreground">Interview Ready</div>
                      </div>
                    </div>
                    {careerVerdict.salaryRange && (
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Expected Salary Range</p>
                        <p className="text-xl font-bold text-emerald-600">
                          ${careerVerdict.salaryRange.min?.toLocaleString()} — ${careerVerdict.salaryRange.max?.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {careerVerdict.recommendedRoles && careerVerdict.recommendedRoles.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Recommended Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {careerVerdict.recommendedRoles.map((role, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary">{role}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => navigate('/career-verdict')}>
                      View Full Verdict
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Resume History */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Resume History
                  </CardTitle>
                  <CardDescription>All your saved resume versions</CardDescription>
                </CardHeader>
                <CardContent>
                  {resumes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No resumes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{resume.name || `Resume v${resume.version}`}</p>
                              <p className="text-sm text-muted-foreground">
                                {resume.skills?.length || 0} skills • {resume.experience?.length || 0} jobs • {new Date(resume.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">v{resume.version}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis History */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Analysis History
                  </CardTitle>
                  <CardDescription>Your resume analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No analyses yet</p>
                  ) : (
                    <div className="space-y-3">
                      {analyses.map((analysis, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-emerald-500">{analysis.score}</span>
                            </div>
                            <div>
                              <p className="font-medium">Resume Analysis</p>
                              <p className="text-sm text-muted-foreground">ATS: {analysis.atsScore}%</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-emerald-500">{analysis.strengthAreas.length} strong</Badge>
                            <Badge variant="outline" className="text-destructive">{analysis.weaknesses.length} weak</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skill Gaps */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    Skill Gap Analyses
                  </CardTitle>
                  <CardDescription>Your skill assessments for target roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {skillGaps.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No skill gap analyses yet</p>
                  ) : (
                    <div className="space-y-3">
                      {skillGaps.map((gap, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <Target className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="font-medium">{gap.targetRole}</p>
                              <p className="text-sm text-muted-foreground">{gap.experienceLevel} level</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={gap.readinessScore >= 70 ? 'text-emerald-500' : gap.readinessScore >= 50 ? 'text-orange-500' : 'text-destructive'}>
                            {gap.readinessScore}% ready
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Interview Attempts */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-pink-500" />
                    Interview History
                  </CardTitle>
                  <CardDescription>Your mock interview sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {interviewAttempts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No interviews yet</p>
                  ) : (
                    <div className="space-y-3">
                      {interviewAttempts.map((interview, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-pink-500" />
                            </div>
                            <div>
                              <p className="font-medium">{interview.role}</p>
                              <p className="text-sm text-muted-foreground">{interview.experienceLevel} level</p>
                            </div>
                          </div>
                          {interview.evaluation && (
                            <Badge variant="outline">
                              Score: {(interview.evaluation as any).overallScore || 'N/A'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            
            {/* Avatar URL (optional) */}
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL (optional)</Label>
              <Input
                id="avatar-url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}