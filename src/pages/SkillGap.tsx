import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useResume } from '@/lib/ResumeContext';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const experienceLevels = [
  { value: 'fresher', label: 'Fresher (0-1 years)' },
  { value: 'junior', label: 'Junior (1-2 years)' },
  { value: 'mid', label: 'Mid-Level (2-4 years)' },
];

const popularRoles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'DevOps Engineer',
  'ML Engineer',
  'Product Manager',
];

export default function SkillGap() {
  const { currentResume, skillGaps, saveSkillGap } = useResume();
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [analyzing, setAnalyzing] = useState(false);
  const latestGap = skillGaps[skillGaps.length - 1];
  const navigate = useNavigate();

  const analyzeSkillGap = async () => {
    if (!targetRole) {
      toast({
        title: 'Select a role',
        description: 'Please enter your target role.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const userSkills = currentResume?.skills || [];
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());

    const roleSkills: Record<string, { skill: string; importance: 'critical' | 'important' | 'optional' }[]> = {
      'software engineer': [
        { skill: 'Data Structures & Algorithms', importance: 'critical' },
        { skill: 'System Design', importance: 'critical' },
        { skill: 'Git/Version Control', importance: 'critical' },
        { skill: 'REST APIs', importance: 'important' },
        { skill: 'SQL Databases', importance: 'important' },
        { skill: 'Unit Testing', importance: 'important' },
        { skill: 'CI/CD', importance: 'optional' },
        { skill: 'Cloud Services (AWS/GCP)', importance: 'optional' },
      ],
      'frontend developer': [
        { skill: 'JavaScript/TypeScript', importance: 'critical' },
        { skill: 'React or Vue or Angular', importance: 'critical' },
        { skill: 'HTML/CSS', importance: 'critical' },
        { skill: 'Responsive Design', importance: 'important' },
        { skill: 'State Management', importance: 'important' },
        { skill: 'Testing (Jest/Cypress)', importance: 'important' },
        { skill: 'Webpack/Build Tools', importance: 'optional' },
        { skill: 'Performance Optimization', importance: 'optional' },
      ],
      'backend developer': [
        { skill: 'Node.js or Python or Java', importance: 'critical' },
        { skill: 'Database Design', importance: 'critical' },
        { skill: 'REST/GraphQL APIs', importance: 'critical' },
        { skill: 'Authentication/Security', importance: 'important' },
        { skill: 'Microservices', importance: 'important' },
        { skill: 'Message Queues', importance: 'optional' },
        { skill: 'Containerization (Docker)', importance: 'optional' },
      ],
      default: [
        { skill: 'Programming Fundamentals', importance: 'critical' },
        { skill: 'Problem Solving', importance: 'critical' },
        { skill: 'Communication', importance: 'important' },
        { skill: 'Team Collaboration', importance: 'important' },
        { skill: 'Continuous Learning', importance: 'optional' },
      ],
    };

    const roleLower = targetRole.toLowerCase();
    const requiredSkills = roleSkills[roleLower] || roleSkills.default;

    const missingSkills = requiredSkills
      .filter(
        ({ skill }) =>
          !userSkillsLower.some(
            (us) =>
              us.includes(skill.toLowerCase().split(' ')[0]) ||
              skill.toLowerCase().includes(us)
          )
      )
      .map(({ skill, importance }) => ({
        skill,
        importance,
        timeToLearn:
          importance === 'critical'
            ? '2-4 weeks'
            : importance === 'important'
            ? '1-2 weeks'
            : '3-5 days',
      }));

    const readinessScore = Math.round(
      ((requiredSkills.length - missingSkills.length) / requiredSkills.length) * 100
    );

    saveSkillGap({
      targetRole,
      experienceLevel,
      missingSkills,
      readinessScore,
    });

    setAnalyzing(false);
    toast({ title: 'Analysis Complete', description: `You're ${readinessScore}% ready for ${targetRole}` });
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'important':
        return 'bg-score-average/10 text-score-average border-score-average/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return AlertCircle;
      case 'important':
        return Zap;
      default:
        return CheckCircle2;
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Skill Gap Engine
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover exactly what skills you need for your target role
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                  <div className="flex flex-wrap gap-2">
                    {popularRoles.slice(0, 4).map((role) => (
                      <button
                        key={role}
                        onClick={() => setTargetRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          targetRole === role
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="experience">Experience Level</Label>
                  <select
                    id="experience"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={analyzeSkillGap} disabled={analyzing} className="w-full" size="lg">
                  {analyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {analyzing ? 'Analyzing...' : 'Analyze Skills'}
                </Button>
              </CardContent>
            </Card>

            {currentResume?.skills && currentResume.skills.length > 0 && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-score-good" />
                    Your Current Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResume.skills.slice(0, 10).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {currentResume.skills.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{currentResume.skills.length - 10} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!latestGap && !analyzing && (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6">
                    <Target className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Analyze Your Skill Gap</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter your target role and experience level to see what skills
                    you need to develop.
                  </p>
                </CardContent>
              </Card>
            )}

            {analyzing && (
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Analyzing Skills</h2>
                  <p className="text-muted-foreground">
                    Comparing your profile against industry requirements...
                  </p>
                </CardContent>
              </Card>
            )}

            {latestGap && !analyzing && (
              <div className="space-y-6 animate-fade-in">
                {/* Readiness Score */}
                <Card className="glass-card overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Readiness for {latestGap.targetRole}</h3>
                        <p className="text-sm text-muted-foreground">
                          Based on your current skill set
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-4xl font-bold bg-gradient-to-r ${getReadinessColor(latestGap.readinessScore)} bg-clip-text text-transparent`}>
                          {latestGap.readinessScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">Job Ready</p>
                      </div>
                    </div>
                    <Progress value={latestGap.readinessScore} className="h-3" />
                  </div>
                </Card>

                {/* Missing Skills */}
                {latestGap.missingSkills.length > 0 ? (
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <h3 className="font-semibold flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        Skills to Develop ({latestGap.missingSkills.length})
                      </h3>
                      <div className="space-y-3">
                        {latestGap.missingSkills.map((item, index) => {
                          const Icon = getImportanceIcon(item.importance);
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border ${getImportanceColor(item.importance)}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium">{item.skill}</p>
                                    <p className="text-sm opacity-80 capitalize">
                                      {item.importance} Skill
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="gap-1.5 flex-shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {item.timeToLearn}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="w-16 h-16 text-score-excellent mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        Excellent! You have all required skills
                      </h3>
                      <p className="text-muted-foreground">
                        Your skill set matches the requirements for {latestGap.targetRole}.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Critical - Must have
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-score-average" />
                    Important - Should have
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    Optional - Nice to have
                  </div>
                </div>

                {/* Next Steps */}
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Continue Your Journey</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Button variant="outline" className="justify-start gap-3" onClick={() => navigate('/interview')}>
                        <TrendingUp className="w-4 h-4" />
                        Practice Interview
                      </Button>
                      <Button variant="outline" className="justify-start gap-3" onClick={() => navigate('/career-verdict')}>
                        <Target className="w-4 h-4" />
                        Get Career Verdict
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
