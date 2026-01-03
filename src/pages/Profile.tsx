import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useResume } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Calendar,
  TrendingUp,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Star,
  ChevronRight,
  Edit3,
  CheckCircle2,
  Clock,
  Zap,
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
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
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
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
    } else if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
      });
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
      setEditing(false);
      loadProfile();
    }
    setSaving(false);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const latestResume = resumes[0];
  const latestAnalysis = analyses[analyses.length - 1];
  const latestSkillGap = skillGaps[skillGaps.length - 1];

  const stats = [
    { 
      label: 'Resumes', 
      value: resumes.length, 
      icon: FileText, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Analyses', 
      value: analyses.length, 
      icon: BarChart3, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Skill Checks', 
      value: skillGaps.length, 
      icon: Target, 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10' 
    },
    { 
      label: 'Interviews', 
      value: interviewAttempts.length, 
      icon: MessageSquare, 
      color: 'text-pink-500',
      bg: 'bg-pink-500/10' 
    },
  ];

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
      
      <main className="container py-8 max-w-6xl">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover */}
          <div className="h-48 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-accent overflow-hidden">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLThoLTJ2LTRoMnY0em0tOCAwaC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6bTggMTZoLTJ2LTRoMnY0em0tOCAwaC0ydi00aDJ2NHptLTggMGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
          </div>
          
          {/* Avatar & Name */}
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {getInitials(formData.full_name, profile?.email)}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setEditing(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="pb-2">
              <h1 className="text-2xl font-bold">
                {formData.full_name || 'Set your name'}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {profile?.email}
              </p>
            </div>
          </div>
          
          {/* Edit Button */}
          <div className="absolute top-4 right-4">
            <Button 
              variant={editing ? 'default' : 'secondary'}
              onClick={() => setEditing(!editing)}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="glass-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <User className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <FileText className="w-4 h-4" />
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
                          <Badge variant="outline" className="text-score-good">
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

            {/* Recent Activity */}
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

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={!editing}
                  />
                </div>

                {editing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">User ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id?.slice(0, 8)}...</code>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Member Since</span>
                  <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {/* All Resumes */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Resumes ({resumes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resumes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No resumes created yet</p>
                ) : (
                  <div className="space-y-3">
                    {resumes.map((resume) => (
                      <div key={resume.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{resume.name || 'Untitled Resume'}</p>
                            <p className="text-sm text-muted-foreground">
                              Version {resume.version} • {resume.skills?.length || 0} skills • {resume.experience?.length || 0} experiences
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Analyses */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  All Analyses ({analyses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No analyses performed yet</p>
                ) : (
                  <div className="space-y-3">
                    {analyses.map((analysis, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="font-bold text-emerald-500">{analysis.score}</span>
                          </div>
                          <div>
                            <p className="font-medium">Resume Analysis #{index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              ATS: {analysis.atsScore}% • {analysis.strengthAreas.length} strengths • {analysis.weaknesses.length} issues
                            </p>
                          </div>
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
                  <Target className="w-5 h-5" />
                  Skill Gap Analyses ({skillGaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skillGaps.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No skill gap analyses yet</p>
                ) : (
                  <div className="space-y-3">
                    {skillGaps.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <span className="font-bold text-orange-500">{gap.readinessScore}%</span>
                          </div>
                          <div>
                            <p className="font-medium">{gap.targetRole}</p>
                            <p className="text-sm text-muted-foreground">
                              {gap.experienceLevel} • {gap.missingSkills.length} skills to learn
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
