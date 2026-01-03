import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useResume } from '@/lib/ResumeContext';
import {
  Compass,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Target,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CareerVerdict() {
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
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const latestAnalysis = analyses[analyses.length - 1];
    const latestSkillGap = skillGaps[skillGaps.length - 1];
    const latestInterview = interviewAttempts[interviewAttempts.length - 1];

    // Calculate scores based on available data
    const resumeScore = latestAnalysis?.score || 50;
    const skillScore = latestSkillGap?.readinessScore || 60;
    const interviewScore = latestInterview?.evaluation
      ? (latestInterview.evaluation.confidenceScore +
          latestInterview.evaluation.clarityScore +
          latestInterview.evaluation.technicalScore) /
        3
      : 55;

    const overallScore = Math.round((resumeScore + skillScore + interviewScore) / 3);

    // Generate risks based on weaknesses
    const risks: string[] = [];
    if (resumeScore < 60) risks.push('Resume needs significant improvement');
    if (skillScore < 60) risks.push('Critical skill gaps need addressing');
    if (interviewScore < 60) risks.push('Interview performance needs work');
    if (!currentResume?.experience?.length) risks.push('Lack of professional experience');
    if (!currentResume?.projects?.length) risks.push('No projects to demonstrate skills');

    // Generate next actions
    const actions: string[] = [];
    if (resumeScore < 70) actions.push('Enhance resume with quantifiable achievements');
    if (skillScore < 70) actions.push('Focus on learning critical missing skills');
    if (interviewScore < 70) actions.push('Practice mock interviews regularly');
    actions.push('Network with professionals in your target field');
    actions.push('Apply to positions matching your skill level');

    // Recommended roles based on skills
    const roles = currentResume?.skills?.includes('React')
      ? ['Frontend Developer', 'Full Stack Developer', 'UI Engineer']
      : currentResume?.skills?.includes('Python')
      ? ['Backend Developer', 'Data Analyst', 'DevOps Engineer']
      : ['Software Engineer', 'Web Developer', 'Technical Support'];

    // Roles to avoid
    const avoid =
      skillScore < 50
        ? ['Senior positions', 'Lead roles', 'Architect positions']
        : ['Highly specialized roles without relevant experience'];

    // Salary range based on experience and readiness
    const baseSalary = 50000;
    const multiplier = overallScore / 100;
    const salaryMin = Math.round(baseSalary * multiplier * 0.8);
    const salaryMax = Math.round(baseSalary * multiplier * 1.2);

    const verdict = {
      hiringProbability: overallScore,
      resumeReadiness: resumeScore,
      interviewReadiness: interviewScore,
      skillReadiness: skillScore,
      salaryRange: { min: salaryMin, max: salaryMax },
      topRisks: risks.slice(0, 3),
      nextActions: actions.slice(0, 4),
      recommendedRoles: roles,
      rolesToAvoid: avoid,
    };

    saveCareerVerdict(verdict);
    setGenerating(false);
    toast({
      title: 'Verdict Generated',
      description: `Your hiring probability is ${overallScore}%`,
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

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Career Verdict Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Your complete career readiness assessment
            </p>
          </div>
          <Button onClick={generateVerdict} disabled={generating}>
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : careerVerdict ? (
              <RefreshCw className="w-4 h-4 mr-2" />
            ) : (
              <Compass className="w-4 h-4 mr-2" />
            )}
            {generating ? 'Analyzing...' : careerVerdict ? 'Refresh Verdict' : 'Generate Verdict'}
          </Button>
        </div>

        {!careerVerdict && !generating && (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Generate Your Career Verdict</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get a comprehensive assessment of your hiring probability based on your
              resume, skills, and interview performance.
            </p>
            <Button onClick={generateVerdict} size="lg">
              <Compass className="w-5 h-5 mr-2" />
              Get My Verdict
            </Button>
          </div>
        )}

        {generating && (
          <div className="glass-card p-12 text-center animate-pulse-slow">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Calculating Your Verdict</h2>
            <p className="text-muted-foreground">
              AI is analyzing your resume, skills, and interview data...
            </p>
          </div>
        )}

        {careerVerdict && !generating && (
          <div className="space-y-6 animate-fade-in">
            {/* Main Score Card */}
            <div className="glass-card p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                {/* Hiring Probability */}
                <div className="flex-shrink-0 text-center">
                  <div className="relative w-40 h-40 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${careerVerdict.hiringProbability * 2.83} 283`}
                        className={getScoreColor(careerVerdict.hiringProbability)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(careerVerdict.hiringProbability)}`}>
                        {careerVerdict.hiringProbability}%
                      </span>
                      <span className="text-sm text-muted-foreground">Hiring Probability</span>
                    </div>
                  </div>
                </div>

                {/* Readiness Scores */}
                <div className="flex-1 grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Resume', score: careerVerdict.resumeReadiness },
                    { label: 'Skills', score: careerVerdict.skillReadiness },
                    { label: 'Interview', score: careerVerdict.interviewReadiness },
                  ].map(({ label, score }) => (
                    <div key={label} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className={`font-semibold ${getScoreColor(score)}`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getScoreBg(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(score)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Salary Range */}
              <div className="glass-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-accent" />
                  Realistic Salary Range
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-foreground">
                    ${careerVerdict.salaryRange.min.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-3xl font-bold text-foreground">
                    ${careerVerdict.salaryRange.max.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual salary based on your current readiness level
                </p>
              </div>

              {/* Top Risks */}
              <div className="glass-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Top Risks Blocking You
                </h3>
                {careerVerdict.topRisks.length > 0 ? (
                  <ul className="space-y-2">
                    {careerVerdict.topRisks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No major risks identified. Keep up the good work!
                  </p>
                )}
              </div>

              {/* Next Actions */}
              <div className="glass-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  Clear Next Actions
                </h3>
                <ul className="space-y-3">
                  {careerVerdict.nextActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Role Recommendations */}
              <div className="glass-card p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-score-good" />
                  Recommended Roles
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Best fit for you:</p>
                    <div className="flex flex-wrap gap-2">
                      {careerVerdict.recommendedRoles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-score-good/10 text-score-good text-sm font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Consider avoiding:</p>
                    <div className="flex flex-wrap gap-2">
                      {careerVerdict.rolesToAvoid.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Message */}
            <div
              className={`glass-card p-6 border-l-4 ${
                careerVerdict.hiringProbability >= 70
                  ? 'border-score-excellent'
                  : careerVerdict.hiringProbability >= 50
                  ? 'border-score-average'
                  : 'border-destructive'
              }`}
            >
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
        )}
      </main>
    </div>
  );
}
