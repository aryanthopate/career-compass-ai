import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useResume } from '@/lib/ResumeContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Target,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ResumeAnalysis() {
  const { currentResume, analyses, saveAnalysis } = useResume();
  const [analyzing, setAnalyzing] = useState(false);
  const latestAnalysis = analyses[analyses.length - 1];
  const navigate = useNavigate();

  const runAnalysis = async () => {
    if (!currentResume) {
      toast({
        title: 'No resume found',
        description: 'Please create a resume first.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const hasExperience = (currentResume.experience?.length || 0) > 0;
    const hasProjects = (currentResume.projects?.length || 0) > 0;
    const hasSkills = (currentResume.skills?.length || 0) > 0;
    const hasSummary = !!currentResume.summary;

    let score = 50;
    if (hasExperience) score += 15;
    if (hasProjects) score += 15;
    if (hasSkills) score += 10;
    if (hasSummary) score += 10;

    const mockAnalysis = {
      resumeId: currentResume.id,
      score,
      atsScore: Math.max(40, score - 10),
      strengthAreas: [
        hasSkills ? 'Technical skills are clearly listed' : null,
        hasProjects ? 'Project section demonstrates hands-on experience' : null,
        currentResume.education?.length ? 'Education credentials are properly formatted' : null,
      ].filter(Boolean) as string[],
      weaknesses: [
        !hasSummary ? 'Missing professional summary - critical for first impressions' : null,
        !hasExperience ? 'No work experience listed - consider adding internships or part-time work' : null,
        (currentResume.skills?.length || 0) < 5 ? 'Skills section could be more comprehensive' : null,
        !hasProjects ? 'No projects listed - crucial for fresh graduates' : null,
      ].filter(Boolean) as string[],
      suggestions: [
        'Add quantifiable achievements (e.g., "Improved performance by 40%")',
        'Include relevant keywords for ATS optimization',
        'Consider adding a GitHub or portfolio link',
        'Use action verbs at the start of each bullet point',
      ],
      skillInflation: hasSkills && (currentResume.skills?.length || 0) > 15
        ? ['You list many skills - ensure you can demonstrate proficiency in interviews']
        : [],
      roleMismatch: [],
    };

    saveAnalysis(mockAnalysis);
    setAnalyzing(false);
    toast({ title: 'Analysis Complete', description: `Your resume scored ${score}/100` });
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Resume Reality Analyzer
            </h1>
            <p className="text-muted-foreground mt-2">
              Get brutally honest AI feedback on your resume
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={analyzing || !currentResume} size="lg" className="gap-2">
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : latestAnalysis ? (
              <RefreshCw className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {analyzing ? 'Analyzing...' : latestAnalysis ? 'Re-Analyze' : 'Analyze Resume'}
          </Button>
        </div>

        {!currentResume && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
              <p className="text-muted-foreground mb-6">
                Create a resume first to analyze it.
              </p>
              <Button onClick={() => navigate('/resume-builder')}>
                Go to Resume Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {currentResume && !latestAnalysis && !analyzing && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Ready to Analyze</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Click "Analyze Resume" to get AI-powered feedback on your resume's
                strengths, weaknesses, and ATS compatibility.
              </p>
              <Button onClick={runAnalysis} size="lg" className="gap-2 shadow-lg">
                <Sparkles className="w-5 h-5" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {analyzing && (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Analyzing Your Resume</h2>
              <p className="text-muted-foreground">
                AI is reviewing your content, format, and ATS compatibility...
              </p>
            </CardContent>
          </Card>
        )}

        {latestAnalysis && !analyzing && (
          <div className="space-y-6 animate-fade-in">
            {/* Score Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <Card className="glass-card md:row-span-2">
                <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                  <div className="relative w-36 h-36 mx-auto mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${latestAnalysis.score * 2.64} 264`}
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--accent))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold bg-gradient-to-r ${getScoreGradient(latestAnalysis.score)} bg-clip-text text-transparent`}>
                        {latestAnalysis.score}
                      </span>
                      <span className="text-sm text-muted-foreground">out of 100</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {latestAnalysis.score >= 80
                      ? 'Excellent! Your resume is competitive.'
                      : latestAnalysis.score >= 60
                      ? 'Good foundation, but room for improvement.'
                      : latestAnalysis.score >= 40
                      ? 'Needs significant improvements.'
                      : 'Major revisions required.'}
                  </p>
                </CardContent>
              </Card>

              {/* ATS Score */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">ATS Compatibility</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(latestAnalysis.atsScore)}`}>
                      {latestAnalysis.atsScore}%
                    </span>
                  </div>
                  <Progress value={latestAnalysis.atsScore} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Likelihood of passing automated screening
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-score-good/10">
                      <div className="text-lg font-bold text-score-good">{latestAnalysis.strengthAreas.length}</div>
                      <div className="text-xs text-muted-foreground">Strengths</div>
                    </div>
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <div className="text-lg font-bold text-destructive">{latestAnalysis.weaknesses.length}</div>
                      <div className="text-xs text-muted-foreground">Issues</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Strengths */}
              {latestAnalysis.strengthAreas.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-score-good/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-score-good" />
                      </div>
                      Strengths
                    </h3>
                    <ul className="space-y-3">
                      {latestAnalysis.strengthAreas.map((strength, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <TrendingUp className="w-4 h-4 text-score-good mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {latestAnalysis.weaknesses.length > 0 && (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-destructive" />
                      </div>
                      Critical Issues
                    </h3>
                    <ul className="space-y-3">
                      {latestAnalysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Suggestions */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-score-average/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-score-average" />
                  </div>
                  Improvement Suggestions
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {latestAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                      <span className="w-6 h-6 rounded-full bg-score-average/20 text-score-average text-xs flex items-center justify-center flex-shrink-0 font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Inflation Warning */}
            {latestAnalysis.skillInflation.length > 0 && (
              <Card className="glass-card border-l-4 border-l-score-average">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-score-average" />
                    Skill Inflation Warning
                  </h3>
                  <ul className="space-y-2">
                    {latestAnalysis.skillInflation.map((warning, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start gap-3" onClick={() => navigate('/resume-builder')}>
                    <FileText className="w-4 h-4" />
                    Edit Resume
                  </Button>
                  <Button variant="outline" className="justify-start gap-3" onClick={() => navigate('/skill-gap')}>
                    <Target className="w-4 h-4" />
                    Check Skill Gaps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
