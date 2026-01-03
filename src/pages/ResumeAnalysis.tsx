import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useResume } from '@/lib/ResumeContext';
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
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ResumeAnalysis() {
  const { currentResume, analyses, saveAnalysis } = useResume();
  const [analyzing, setAnalyzing] = useState(false);
  const latestAnalysis = analyses[analyses.length - 1];

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
    
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

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
    
    toast({
      title: 'Analysis Complete',
      description: `Your resume scored ${score}/100`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-score-excellent';
    if (score >= 60) return 'text-score-good';
    if (score >= 40) return 'text-score-average';
    return 'text-score-poor';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-score-excellent';
    if (score >= 60) return 'bg-score-good';
    if (score >= 40) return 'bg-score-average';
    return 'bg-score-poor';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Resume Reality Analyzer</h1>
            <p className="text-muted-foreground mt-1">
              Get brutally honest AI feedback on your resume
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={analyzing || !currentResume}>
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>

        {!currentResume && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Resume Found</h2>
            <p className="text-muted-foreground mb-6">
              Create a resume first to analyze it.
            </p>
          </div>
        )}

        {currentResume && !latestAnalysis && !analyzing && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready to Analyze</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Click "Analyze Resume" to get AI-powered feedback on your resume's
              strengths, weaknesses, and ATS compatibility.
            </p>
          </div>
        )}

        {analyzing && (
          <div className="glass-card p-12 text-center animate-pulse-slow">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Resume</h2>
            <p className="text-muted-foreground">
              AI is reviewing your content, format, and ATS compatibility...
            </p>
          </div>
        )}

        {latestAnalysis && !analyzing && (
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Score Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Overall Score */}
              <div className="glass-card p-6 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Overall Score</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${latestAnalysis.score * 2.83} 283`}
                      className={getScoreColor(latestAnalysis.score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(latestAnalysis.score)}`}>
                      {latestAnalysis.score}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {latestAnalysis.score >= 80
                    ? 'Excellent! Your resume is competitive.'
                    : latestAnalysis.score >= 60
                    ? 'Good foundation, but room for improvement.'
                    : latestAnalysis.score >= 40
                    ? 'Needs significant improvements.'
                    : 'Major revisions required.'}
                </p>
              </div>

              {/* ATS Score */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">ATS Compatibility</h3>
                  <span className={`text-lg font-bold ${getScoreColor(latestAnalysis.atsScore)}`}>
                    {latestAnalysis.atsScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getScoreBg(latestAnalysis.atsScore)}`}
                    style={{ width: `${latestAnalysis.atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Likelihood of passing automated screening
                </p>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Strengths */}
              {latestAnalysis.strengthAreas.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-score-good" />
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
                </div>
              )}

              {/* Weaknesses */}
              {latestAnalysis.weaknesses.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-destructive" />
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
                </div>
              )}

              {/* Suggestions */}
              <div className="glass-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-score-average" />
                  Improvement Suggestions
                </h3>
                <ul className="space-y-3">
                  {latestAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-score-average/20 text-score-average text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skill Inflation Warning */}
              {latestAnalysis.skillInflation.length > 0 && (
                <div className="glass-card p-6 border-l-4 border-score-average">
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
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
