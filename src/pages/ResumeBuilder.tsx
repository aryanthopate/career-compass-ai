import { Header } from '@/components/layout/Header';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { useResume } from '@/lib/ResumeContext';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Clock } from 'lucide-react';

export default function ResumeBuilder() {
  const { resumes, currentResume, setCurrentResume, saveResume } = useResume();

  const createNewResume = () => {
    saveResume({
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
            <h1 className="text-2xl sm:text-3xl font-bold">AI Resume Builder</h1>
            <p className="text-muted-foreground mt-1">
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
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      Version {resume.version} - {resume.name || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button onClick={createNewResume}>
              <Plus className="w-4 h-4 mr-2" />
              New Version
            </Button>
          </div>
        </div>

        {currentResume ? (
          <>
            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Version {currentResume.version}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Last saved: {new Date(currentResume.updatedAt).toLocaleString()}
              </span>
            </div>
            <ResumeEditor />
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create Your First Resume</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your professional resume with AI-powered suggestions
              for each section.
            </p>
            <Button onClick={createNewResume} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Resume
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
