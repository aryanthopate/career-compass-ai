import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useResume } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Compass,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Award,
  Zap,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function CareerVerdict() {
  const navigate = useNavigate();
  const {
    currentResume,
    analyses,
    skillGaps,
    interviewAttempts,
    careerVerdict,
    saveCareerVerdict,
  } = useResume();
  const [generating, setGenerating] = useState(false);

  const generateVerdict = async () => {
    setGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('career-verdict', {
        body: {
          resume: currentResume,
          analyses: analyses.slice(0, 3),
          skillGaps: skillGaps.slice(0, 3),
          interviewAttempts: interviewAttempts.slice(0, 3),
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const verdict = {
        hiringProbability: data.hiringProbability,
        resumeReadiness: data.resumeReadiness,
        interviewReadiness: data.interviewReadiness,
        skillReadiness: data.skillReadiness,
        salaryRange: data.salaryRange,
        topRisks: data.topRisks,
        nextActions: data.nextActions,
        recommendedRoles: data.recommendedRoles,
        rolesToAvoid: data.rolesToAvoid,
      };

      await saveCareerVerdict(verdict);
      toast({ 
        title: 'AI Verdict Generated', 
        description: `Your hiring probability is ${verdict.hiringProbability}%` 
      });
    } catch (error) {
      console.error('Career verdict error:', error);
      toast({ 
        title: 'Generation Failed', 
        description: 'Could not generate verdict. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-score-excellent';
    if (score >= 60) return 'text-score-good';
    if (score >= 40) return 'text-score-average';
    return 'text-score-poor';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 40) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  const dataPoints = [
    { label: 'Resumes', value: analyses.length, icon: GraduationCap, available: analyses.length > 0 },
    { label: 'Skill Checks', value: skillGaps.length, icon: Target, available: skillGaps.length > 0 },
    { label: 'Interviews', value: interviewAttempts.length, icon: Briefcase, available: interviewAttempts.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              Career Verdict Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Your complete career readiness assessment powered by AI
            </p>
          </div>
          <Button onClick={generateVerdict} disabled={generating} size="lg" className="shadow-md">
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : careerVerdict ? (
              <RefreshCw className="w-5 h-5 mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {generating ? 'Analyzing...' : careerVerdict ? 'Refresh' : 'Generate Verdict'}
          </Button>
        </div>

        {/* Data Status */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {dataPoints.map((point) => {
            const Icon = point.icon;
            return (
              <Card key={point.label} className={`glass-card ${!point.available && 'opacity-50'}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    point.available ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${point.available ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{point.value}</div>
                    <div className="text-xs text-muted-foreground">{point.label}</div>
                  </div>
                  {point.available && <CheckCircle2 className="w-4 h-4 text-score-good ml-auto" />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!careerVerdict && !generating && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-12 h-12 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Generate Your Career Verdict</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Get a comprehensive assessment of your hiring probability based on your resume, skills, and interview performance.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Resume Analysis
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Skill Assessment
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Interview Evaluation
                </Badge>
              </div>
              <Button onClick={generateVerdict} size="lg" className="shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Get My Verdict
              </Button>
            </CardContent>
          </Card>
        )}

        {generating && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Calculating Your Verdict</h2>
              <p className="text-muted-foreground">
                AI is analyzing your resume, skills, and interview data...
              </p>
            </CardContent>
          </Card>
        )}

        {careerVerdict && !generating && (
          <div className="space-y-6 animate-fade-in">
            {/* Main Score Card */}
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  {/* Hiring Probability */}
                  <div className="flex-shrink-0 text-center">
                    <div className="relative w-44 h-44 mx-auto">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${careerVerdict.hiringProbability * 2.64} 264`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold bg-gradient-to-r ${getScoreGradient(careerVerdict.hiringProbability)} bg-clip-text text-transparent`}>
                          {careerVerdict.hiringProbability}%
                        </span>
                        <span className="text-sm text-muted-foreground mt-1">Hiring Probability</span>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Scores */}
                  <div className="flex-1 grid sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Resume', score: careerVerdict.resumeReadiness, icon: GraduationCap, link: '/resume-analysis' },
                      { label: 'Skills', score: careerVerdict.skillReadiness, icon: Target, link: '/skill-gap' },
                      { label: 'Interview', score: careerVerdict.interviewReadiness, icon: Briefcase, link: '/interview' },
                    ].map(({ label, score, icon: Icon, link }) => (
                      <button
                        key={label}
                        onClick={() => navigate(link)}
                        className="group p-5 rounded-2xl bg-card/80 border border-border hover:border-primary/50 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {Math.round(score)}%
                        </div>
                        <p className="text-sm text-muted-foreground">{label} Ready</p>
                        <Progress value={score} className="h-1.5 mt-3" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Salary Range */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    Realistic Salary Range
                  </h3>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      ${careerVerdict.salaryRange.min.toLocaleString()}
                    </span>
                    <span className="text-2xl text-muted-foreground">—</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                      ${careerVerdict.salaryRange.max.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Annual salary based on your current readiness level</p>
                </CardContent>
              </Card>

              {/* Top Risks */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    Top Risks Blocking You
                  </h3>
                  {careerVerdict.topRisks.length > 0 ? (
                    <ul className="space-y-3">
                      {careerVerdict.topRisks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                          <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-score-good" />
                      No major risks identified!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Next Actions */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    Clear Next Actions
                  </h3>
                  <ul className="space-y-3">
                    {careerVerdict.nextActions.map((action, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Role Recommendations */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-score-good/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-score-good" />
                    </div>
                    Recommended Roles
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Best fit for you:</p>
                      <div className="flex flex-wrap gap-2">
                        {careerVerdict.recommendedRoles.map((role, index) => (
                          <Badge key={index} className="bg-score-good/10 text-score-good border-score-good/20 hover:bg-score-good/20">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Consider avoiding:</p>
                      <div className="flex flex-wrap gap-2">
                        {careerVerdict.rolesToAvoid.map((role, index) => (
                          <Badge key={index} variant="outline" className="text-muted-foreground">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card className={`glass-card border-l-4 ${
              careerVerdict.hiringProbability >= 70
                ? 'border-l-score-excellent'
                : careerVerdict.hiringProbability >= 50
                ? 'border-l-score-average'
                : 'border-l-destructive'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    careerVerdict.hiringProbability >= 70
                      ? 'bg-score-excellent/10'
                      : careerVerdict.hiringProbability >= 50
                      ? 'bg-score-average/10'
                      : 'bg-destructive/10'
                  }`}>
                    <Award className={`w-5 h-5 ${
                      careerVerdict.hiringProbability >= 70
                        ? 'text-score-excellent'
                        : careerVerdict.hiringProbability >= 50
                        ? 'text-score-average'
                        : 'text-destructive'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">The Reality</h3>
                    <p className="text-muted-foreground">
                      {careerVerdict.hiringProbability >= 70
                        ? "You're in a strong position. Focus on applying to roles and continue refining your skills. Your preparation is paying off."
                        : careerVerdict.hiringProbability >= 50
                        ? "You have potential but need focused improvement. Address the identified gaps before mass applying. Quality over quantity in your applications."
                        : "Significant preparation is needed. Focus on building skills and projects before actively job hunting. This is honest feedback to help you succeed."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
