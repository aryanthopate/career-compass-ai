import { Header } from '@/components/layout/Header';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { useResume } from '@/lib/ResumeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResumeBuilder() {
  const { resumes, currentResume, setCurrentResume, saveResume } = useResume();
  const navigate = useNavigate();

  const createNewResume = async () => {
    await saveResume({
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      education: [],
      experience: [],
      projects: [],
      skills: [],
      achievements: [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              AI Resume Builder
            </h1>
            <p className="text-muted-foreground mt-2">
              Build a professional resume with AI-powered suggestions
            </p>
          </div>
          <div className="flex gap-2">
            {resumes.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={currentResume?.id || ''}
                  onChange={(e) => {
                    const selected = resumes.find((r) => r.id === e.target.value);
                    setCurrentResume(selected || null);
                  }}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm min-w-[180px]"
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      Version {resume.version} - {resume.name || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button onClick={createNewResume} className="gap-2">
              <Plus className="w-4 h-4" />
              New Version
            </Button>
          </div>
        </div>

        {currentResume ? (
          <>
            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
              <Badge variant="secondary" className="gap-1.5">
                <FileText className="w-3 h-3" />
                Version {currentResume.version}
              </Badge>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Last saved: {new Date(currentResume.updatedAt).toLocaleString()}
              </span>
            </div>
            <ResumeEditor />

            {/* Quick Actions */}
            <Card className="glass-card mt-8">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Next Steps
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3"
                    onClick={() => navigate('/resume-analysis')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Analyze Resume</p>
                      <p className="text-xs text-muted-foreground">Get AI feedback</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3"
                    onClick={() => navigate('/skill-gap')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Check Skills</p>
                      <p className="text-xs text-muted-foreground">Find skill gaps</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 justify-start gap-3"
                    onClick={() => navigate('/interview')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Practice Interview</p>
                      <p className="text-xs text-muted-foreground">AI mock interview</p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Create Your First Resume</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start building your professional resume with AI-powered suggestions
                for each section.
              </p>
              <Button onClick={createNewResume} size="lg" className="gap-2 shadow-lg">
                <Plus className="w-5 h-5" />
                Create Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
