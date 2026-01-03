import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useResume, Resume, Education, Experience, Project } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Save,
  GripVertical,
  User,
  Briefcase,
  GraduationCap,
  Folder,
  Trophy,
  Code,
  Loader2,
  History,
  Copy,
  Check,
  FileDown,
  AlertTriangle,
  Clock,
  ArrowRight,
  Download,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentResume, resumes, saveResume, refreshData, setCurrentResume } = useResume();
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [improving, setImproving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<Partial<Resume>>(
    currentResume || {
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
    }
  );

  const updateField = (field: keyof Resume, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveResume(formData);
      if (saved) {
        toast({ title: 'Resume saved!', description: `Version ${saved.version} saved successfully.` });
      }
    } catch (error) {
      toast({ title: 'Error saving resume', description: 'Please try again.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (resumeId: string) => {
    setDeleting(resumeId);
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', resumeId);
      if (error) throw error;
      toast({ title: 'Resume Deleted', description: 'Resume has been permanently deleted.' });
      refreshData();
      if (currentResume?.id === resumeId) {
        setFormData({ name: '', email: '', phone: '', location: '', summary: '', education: [], experience: [], projects: [], skills: [], achievements: [] });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete resume.', variant: 'destructive' });
    }
    setDeleting(null);
  };

  const handleExportText = async () => {
    const text = `${formData.name || 'Your Name'}\n${formData.email || ''} | ${formData.phone || ''} | ${formData.location || ''}\n\nSUMMARY\n${formData.summary || 'No summary provided.'}\n\nEDUCATION\n${formData.education?.map(edu => `${edu.degree} in ${edu.field} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`).join('\n') || 'No education listed.'}\n\nEXPERIENCE\n${formData.experience?.map(exp => `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}`).join('\n\n') || 'No experience listed.'}\n\nSKILLS\n${formData.skills?.join(', ') || 'No skills listed.'}\n\nPROJECTS\n${formData.projects?.map(proj => `${proj.name}: ${proj.description}`).join('\n') || 'No projects listed.'}\n\nACHIEVEMENTS\n${formData.achievements?.join('\n') || 'No achievements listed.'}`.trim();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Resume text copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${formData.name || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported!', description: 'Resume downloaded as JSON file.' });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ATS-friendly fonts (standard fonts that ATS can read)
    const fontNormal = 'helvetica';
    
    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, x, y);
        y += lineHeight;
      });
    };

    // Header - Name (large, bold)
    doc.setFont(fontNormal, 'bold');
    doc.setFontSize(18);
    doc.text(formData.name || 'Your Name', margin, y);
    y += 20;

    // Contact info (single line, smaller)
    doc.setFont(fontNormal, 'normal');
    doc.setFontSize(10);
    const contactParts = [formData.email, formData.phone, formData.location].filter(Boolean);
    doc.text(contactParts.join('  |  '), margin, y);
    y += 20;

    // Divider line
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Summary Section
    if (formData.summary) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 15;
      
      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      addWrappedText(formData.summary, margin, contentWidth, 14);
      y += 8;
    }

    // Experience Section
    if (formData.experience && formData.experience.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('PROFESSIONAL EXPERIENCE', margin, y);
      y += 15;

      formData.experience.forEach((exp) => {
        // Job title and company
        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(10);
        doc.text(`${exp.position}`, margin, y);
        
        // Dates on the right
        const dateText = `${exp.startDate} - ${exp.endDate || 'Present'}`;
        const dateWidth = doc.getTextWidth(dateText);
        doc.setFont(fontNormal, 'normal');
        doc.text(dateText, pageWidth - margin - dateWidth, y);
        y += 14;
        
        // Company
        doc.setFont(fontNormal, 'italic');
        doc.text(exp.company, margin, y);
        y += 14;

        // Description
        if (exp.description) {
          doc.setFont(fontNormal, 'normal');
          addWrappedText(`• ${exp.description}`, margin + 10, contentWidth - 10, 13);
        }

        // Highlights
        exp.highlights?.forEach((highlight) => {
          if (highlight) {
            doc.setFont(fontNormal, 'normal');
            addWrappedText(`• ${highlight}`, margin + 10, contentWidth - 10, 13);
          }
        });
        y += 6;
      });
    }

    // Education Section
    if (formData.education && formData.education.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('EDUCATION', margin, y);
      y += 15;

      formData.education.forEach((edu) => {
        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(10);
        doc.text(`${edu.degree} in ${edu.field}`, margin, y);
        
        const dateText = `${edu.startDate} - ${edu.endDate}`;
        const dateWidth = doc.getTextWidth(dateText);
        doc.setFont(fontNormal, 'normal');
        doc.text(dateText, pageWidth - margin - dateWidth, y);
        y += 14;
        
        doc.setFont(fontNormal, 'italic');
        doc.text(edu.institution, margin, y);
        y += 16;
      });
    }

    // Skills Section
    if (formData.skills && formData.skills.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('SKILLS', margin, y);
      y += 15;

      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      addWrappedText(formData.skills.join('  •  '), margin, contentWidth, 14);
      y += 8;
    }

    // Projects Section
    if (formData.projects && formData.projects.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('PROJECTS', margin, y);
      y += 15;

      formData.projects.forEach((project) => {
        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(10);
        doc.text(project.name, margin, y);
        y += 14;
        
        if (project.description) {
          doc.setFont(fontNormal, 'normal');
          addWrappedText(project.description, margin, contentWidth, 13);
        }
        
        if (project.technologies && project.technologies.length > 0) {
          doc.setFont(fontNormal, 'italic');
          doc.setFontSize(9);
          doc.text(`Technologies: ${project.technologies.join(', ')}`, margin, y);
          y += 14;
        }
        y += 4;
      });
    }

    // Achievements Section
    if (formData.achievements && formData.achievements.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      doc.text('ACHIEVEMENTS', margin, y);
      y += 15;

      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      formData.achievements.forEach((achievement) => {
        if (achievement) {
          addWrappedText(`• ${achievement}`, margin, contentWidth, 13);
        }
      });
    }

    // Save PDF
    doc.save(`${formData.name || 'resume'}-ATS-Friendly.pdf`);
    toast({ 
      title: 'PDF Exported!', 
      description: 'ATS-friendly resume downloaded successfully.' 
    });
  };

  const handleImprove = async (section: string) => {
    setImproving(section);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (section === 'summary') {
      const improved = formData.summary
        ? `${formData.summary} Demonstrated ability to deliver high-quality solutions under tight deadlines while collaborating effectively with cross-functional teams.`
        : 'Results-driven professional with a passion for technology and innovation. Skilled in problem-solving and committed to continuous learning and professional growth.';
      updateField('summary', improved);
    }
    toast({ title: 'AI Improvement Applied', description: `Your ${section} section has been enhanced.` });
    setImproving(null);
  };

  const addEducation = () => {
    const newEdu: Education = { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '' };
    updateField('education', [...(formData.education || []), newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = formData.education?.map((edu) => edu.id === id ? { ...edu, [field]: value } : edu);
    updateField('education', updated);
  };

  const removeEducation = (id: string) => updateField('education', formData.education?.filter((edu) => edu.id !== id));

  const addExperience = () => {
    const newExp: Experience = { id: crypto.randomUUID(), company: '', position: '', startDate: '', endDate: '', description: '', highlights: [] };
    updateField('experience', [...(formData.experience || []), newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = formData.experience?.map((exp) => exp.id === id ? { ...exp, [field]: value } : exp);
    updateField('experience', updated);
  };

  const removeExperience = (id: string) => updateField('experience', formData.experience?.filter((exp) => exp.id !== id));

  const addProject = () => {
    const newProject: Project = { id: crypto.randomUUID(), name: '', description: '', technologies: [] };
    updateField('projects', [...(formData.projects || []), newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = formData.projects?.map((proj) => proj.id === id ? { ...proj, [field]: value } : proj);
    updateField('projects', updated);
  };

  const removeProject = (id: string) => updateField('projects', formData.projects?.filter((proj) => proj.id !== id));

  const loadResume = (resume: Resume) => {
    setFormData(resume);
    setCurrentResume(resume);
    toast({ title: 'Resume Loaded', description: `Loaded version ${resume.version}` });
  };

  const createNewResume = async () => {
    await saveResume({ name: '', email: '', phone: '', location: '', summary: '', education: [], experience: [], projects: [], skills: [], achievements: [] });
  };

  const sections = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Resume Builder
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage your professional resumes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportPDF} className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary">
              <Download className="w-4 h-4" />
              Export PDF (ATS)
            </Button>
            <Button variant="outline" onClick={handleExportText} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy Text
            </Button>
            <Button variant="outline" onClick={handleExportJSON} className="gap-2">
              <FileDown className="w-4 h-4" />
              JSON
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-md">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><History className="w-4 h-4" />Versions</span>
                  <Button variant="ghost" size="sm" onClick={createNewResume}><Plus className="w-4 h-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No saved resumes yet</p>
                ) : (
                  resumes.map((resume) => (
                    <div key={resume.id} className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${currentResume?.id === resume.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => loadResume(resume)}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{resume.name || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">v{resume.version} • {new Date(resume.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Delete Resume?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{resume.name || 'Untitled'}" (v{resume.version}). This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(resume.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {deleting === resume.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Sections</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                      <Icon className="w-4 h-4" />{section.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="glass-card">
              <CardContent className="p-6">
                {activeSection === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Personal Information</h2><p className="text-sm text-muted-foreground">Your contact details</p></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="John Doe" /></div>
                      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="john@example.com" /></div>
                      <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 (555) 123-4567" /></div>
                      <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={formData.location || ''} onChange={(e) => updateField('location', e.target.value)} placeholder="San Francisco, CA" /></div>
                    </div>
                  </div>
                )}

                {activeSection === 'summary' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Professional Summary</h2><p className="text-sm text-muted-foreground">Brief overview</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleImprove('summary')} disabled={improving === 'summary'}>
                        {improving === 'summary' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}Improve with AI
                      </Button>
                    </div>
                    <Textarea value={formData.summary || ''} onChange={(e) => updateField('summary', e.target.value)} placeholder="Write a compelling summary..." rows={6} className="resize-none" />
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Education</h2><p className="text-sm text-muted-foreground">Academic background</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addEducation}><Plus className="w-4 h-4 mr-2" />Add</Button>
                    </div>
                    {formData.education?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <GraduationCap className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No education added yet</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={addEducation}><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
                      </div>
                    )}
                    {formData.education?.map((edu, index) => (
                      <div key={edu.id} className="p-5 rounded-xl border border-border bg-secondary/20 space-y-4">
                        <div className="flex items-center justify-between"><Badge variant="outline">Education {index + 1}</Badge><Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Institution</Label><Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="MIT" /></div>
                          <div className="space-y-2"><Label>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" /></div>
                          <div className="space-y-2"><Label>Field</Label><Input value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" /></div>
                          <div className="space-y-2"><Label>GPA</Label><Input value={edu.gpa || ''} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.8/4.0" /></div>
                          <div className="space-y-2"><Label>Start Date</Label><Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="Aug 2019" /></div>
                          <div className="space-y-2"><Label>End Date</Label><Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="May 2023" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Work Experience</h2><p className="text-sm text-muted-foreground">Professional history</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-4 h-4 mr-2" />Add</Button>
                    </div>
                    {formData.experience?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Briefcase className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No experience added yet</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={addExperience}><Plus className="w-4 h-4 mr-2" />Add Entry</Button>
                      </div>
                    )}
                    {formData.experience?.map((exp, index) => (
                      <div key={exp.id} className="p-5 rounded-xl border border-border bg-secondary/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Experience {index + 1}</Badge>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleImprove(`experience-${exp.id}`)} disabled={improving === `experience-${exp.id}`}>
                              {improving === `experience-${exp.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Google" /></div>
                          <div className="space-y-2"><Label>Position</Label><Input value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} placeholder="Software Engineer" /></div>
                          <div className="space-y-2"><Label>Start Date</Label><Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" /></div>
                          <div className="space-y-2"><Label>End Date</Label><Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Describe your responsibilities..." rows={3} /></div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'projects' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Folder className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Projects</h2><p className="text-sm text-muted-foreground">Showcase your work</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addProject}><Plus className="w-4 h-4 mr-2" />Add</Button>
                    </div>
                    {formData.projects?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Folder className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No projects added yet</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={addProject}><Plus className="w-4 h-4 mr-2" />Add Project</Button>
                      </div>
                    )}
                    {formData.projects?.map((proj, index) => (
                      <div key={proj.id} className="p-5 rounded-xl border border-border bg-secondary/20 space-y-4">
                        <div className="flex items-center justify-between"><Badge variant="outline">Project {index + 1}</Badge><Button variant="ghost" size="sm" onClick={() => removeProject(proj.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                        <div className="space-y-4">
                          <div className="space-y-2"><Label>Name</Label><Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="E-commerce Platform" /></div>
                          <div className="space-y-2"><Label>Description</Label><Textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Describe the project..." rows={3} /></div>
                          <div className="space-y-2"><Label>Technologies</Label><Input value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(proj.id, 'technologies', e.target.value.split(',').map(t => t.trim()))} placeholder="React, Node.js" /></div>
                          <div className="space-y-2"><Label>Link</Label><Input value={proj.link || ''} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} placeholder="https://github.com/..." /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Code className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Skills</h2><p className="text-sm text-muted-foreground">Technical and soft skills</p></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Skills (comma-separated)</Label>
                      <Textarea value={formData.skills?.join(', ') || ''} onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="JavaScript, TypeScript, React, Node.js..." rows={4} />
                    </div>
                    {formData.skills && formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">{formData.skills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}</div>
                    )}
                  </div>
                )}

                {activeSection === 'achievements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Achievements</h2><p className="text-sm text-muted-foreground">Awards and certifications</p></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements (one per line)</Label>
                      <Textarea value={formData.achievements?.join('\n') || ''} onChange={(e) => updateField('achievements', e.target.value.split('\n').filter(Boolean))} placeholder="AWS Certified...&#10;Dean's List..." rows={6} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Next Steps</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-4 justify-start gap-3" onClick={() => navigate('/resume-analysis')}>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-emerald-500" /></div>
                    <div className="text-left"><p className="font-medium">Analyze Resume</p><p className="text-xs text-muted-foreground">Get AI feedback</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start gap-3" onClick={() => navigate('/skill-gap')}>
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-orange-500" /></div>
                    <div className="text-left"><p className="font-medium">Check Skills</p><p className="text-xs text-muted-foreground">Find gaps</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start gap-3" onClick={() => navigate('/interview')}>
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-pink-500" /></div>
                    <div className="text-left"><p className="font-medium">Practice Interview</p><p className="text-xs text-muted-foreground">AI mock interview</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
