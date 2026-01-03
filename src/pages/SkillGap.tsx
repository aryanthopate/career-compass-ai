import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResume } from '@/lib/ResumeContext';
import {
  Target,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
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
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const userSkills = currentResume?.skills || [];
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());

    // Simulate skill requirements based on role
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
    const requiredSkills =
      roleSkills[roleLower] || roleSkills.default;

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
    toast({
      title: 'Analysis Complete',
      description: `You're ${readinessScore}% ready for ${targetRole}`,
    });
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'important':
        return 'bg-score-average/10 text-score-average border-score-average/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Skill Gap Engine</h1>
          <p className="text-muted-foreground mt-1">
            Discover what skills you need for your target role
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {popularRoles.slice(0, 4).map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`px-2 py-1 rounded-md text-xs transition-colors ${
                        targetRole === role
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
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

              <Button onClick={analyzeSkillGap} disabled={analyzing} className="w-full">
                {analyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                {analyzing ? 'Analyzing...' : 'Analyze Skill Gap'}
              </Button>

              {currentResume?.skills && currentResume.skills.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Your Current Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResume.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {currentResume.skills.length > 8 && (
                      <span className="px-2 py-0.5 text-muted-foreground text-xs">
                        +{currentResume.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {!latestGap && !analyzing && (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Analyze Your Skill Gap</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter your target role and experience level to see what skills
                  you need to develop.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="glass-card p-12 text-center animate-pulse-slow">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Analyzing Skills</h2>
                <p className="text-muted-foreground">
                  Comparing your profile against industry requirements...
                </p>
              </div>
            )}

            {latestGap && !analyzing && (
              <div className="space-y-6 animate-fade-in">
                {/* Readiness Score */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Readiness for {latestGap.targetRole}</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on your current skill set
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {latestGap.readinessScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Job Ready</p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${latestGap.readinessScore}%` }}
                    />
                  </div>
                </div>

                {/* Missing Skills */}
                {latestGap.missingSkills.length > 0 ? (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Skills to Develop ({latestGap.missingSkills.length})
                    </h3>
                    <div className="space-y-3">
                      {latestGap.missingSkills.map((item, index) => {
                        const Icon = getImportanceIcon(item.importance);
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${getImportanceColor(item.importance)}`}
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
                              <div className="flex items-center gap-1.5 text-sm opacity-80">
                                <Clock className="w-4 h-4" />
                                {item.timeToLearn}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center">
                    <CheckCircle2 className="w-12 h-12 text-score-excellent mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">
                      Excellent! You have all required skills
                    </h3>
                    <p className="text-muted-foreground">
                      Your skill set matches the requirements for {latestGap.targetRole}.
                    </p>
                  </div>
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
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
