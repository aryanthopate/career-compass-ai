import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useResume, Resume, Education, Experience, Project, Link as ResumeLink, Certification } from '@/lib/ResumeContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Save,
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
  ArrowRight,
  Download,
  Link,
  Award,
  Globe,
  ExternalLink,
  Eye,
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
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<Partial<Resume>>(
    currentResume || {
      name: '',
      email: '',
      phone: '',
      location: '',
      portfolioLink: '',
      links: [],
      summary: '',
      education: [],
      experience: [],
      projects: [],
      skills: [],
      achievements: [],
      certifications: [],
    }
  );

  const updateField = (field: keyof Resume, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const normalizeUrl = (url?: string) => {
    const raw = (url || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  };

  const displayUrl = (url: string) =>
    url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const splitLinesPreserve = (value: string) => value.split(/\r?\n/);

  const compactStringArray = (arr?: (string | null)[]) =>
    (arr || []).map((s) => (s || '').trim()).filter((s) => s.length > 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleaned: Partial<Resume> = {
        ...formData,
        skills: compactStringArray(formData.skills),
        achievements: compactStringArray(formData.achievements),
        links: (formData.links || [])
          .map((l) => ({ ...l, label: (l.label || '').trim(), url: (l.url || '').trim() }))
          .filter((l) => l.label || l.url),
        experience: (formData.experience || []).map((exp) => ({
          ...exp,
          highlights: compactStringArray(exp.highlights),
        })),
        projects: (formData.projects || []).map((p) => ({
          ...p,
          technologies: compactStringArray(p.technologies),
        })),
        certifications: (formData.certifications || [])
          .map((c) => ({
            ...c,
            name: (c.name || '').trim(),
            issuer: (c.issuer || '').trim(),
            date: (c.date || '').trim(),
            url: (c.url || '').trim(),
          }))
          .filter((c) => c.name || c.issuer || c.date || c.url),
      };

      const saved = await saveResume(cleaned);
      if (saved) {
        setFormData(cleaned);
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
        setFormData({ name: '', email: '', phone: '', location: '', portfolioLink: '', links: [], summary: '', education: [], experience: [], projects: [], skills: [], achievements: [], certifications: [] });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete resume.', variant: 'destructive' });
    }
    setDeleting(null);
  };

  const handleExportText = async () => {
    const contactParts = [formData.email, formData.phone, formData.location, formData.portfolioLink].filter(Boolean);
    const text = `${formData.name || 'Your Name'}\n${contactParts.join(' | ')}\n\nPROFESSIONAL SUMMARY\n${formData.summary || 'No summary provided.'}\n\nWORK EXPERIENCE\n${formData.experience?.map(exp => `${exp.position}\n${exp.company} | ${exp.startDate} - ${exp.endDate}\n${exp.description}\n${exp.highlights?.map(h => `• ${h}`).join('\n') || ''}`).join('\n\n') || 'No experience listed.'}\n\nEDUCATION\n${formData.education?.map(edu => `${edu.degree} in ${edu.field}\n${edu.institution} | Graduated: ${edu.endDate}`).join('\n\n') || 'No education listed.'}\n\nSKILLS\n${formData.skills?.map(s => `• ${s}`).join('\n') || 'No skills listed.'}\n\nPROJECTS\n${formData.projects?.map(proj => `${proj.name}${proj.link ? ` (${proj.link})` : ''}\n${proj.description}\nTechnologies: ${proj.technologies?.join(', ')}`).join('\n\n') || 'No projects listed.'}\n\nCERTIFICATIONS\n${formData.certifications?.map(cert => `• ${cert.name} - ${cert.issuer} (${cert.date})`).join('\n') || 'No certifications listed.'}\n\nACHIEVEMENTS\n${formData.achievements?.map(a => `• ${a}`).join('\n') || 'No achievements listed.'}`.trim();
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
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;
    const fontNormal = 'helvetica';

    const pdfSkills = compactStringArray(formData.skills);
    const pdfAchievements = compactStringArray(formData.achievements);

    const ensureSpace = (needed: number) => {
      if (y > pageHeight - margin - needed) {
        doc.addPage();
        y = margin;
      }
    };

    const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
      const paragraphs = String(text || '').split(/\r?\n/);
      paragraphs.forEach((p) => {
        if (p === '') {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          y += lineHeight;
          return;
        }

        const lines = doc.splitTextToSize(p, maxWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, x, y);
          y += lineHeight;
        });
      });
    };

    // Header - Name (large, bold, centered)
    doc.setFont(fontNormal, 'bold');
    doc.setFontSize(24);
    doc.text(formData.name?.toUpperCase() || 'YOUR NAME', pageWidth / 2, y, { align: 'center' });
    y += 28;

    // Professional title/tagline if skills exist
    if (pdfSkills.length >= 3) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(11);
      const tagline = pdfSkills.slice(0, 3).join(' | ');
      doc.text(tagline, pageWidth / 2, y, { align: 'center' });
      y += 18;
    }

    // Contact info (single line, centered) with clickable links
    doc.setFont(fontNormal, 'normal');
    doc.setFontSize(10);
    const contactParts = [formData.location, formData.email, formData.phone].filter(Boolean);
    const contactText = contactParts.join(' | ');
    doc.text(contactText, pageWidth / 2, y, { align: 'center' });
    y += 14;

    // Portfolio Link (clickable)
    const portfolioUrl = normalizeUrl(formData.portfolioLink);
    if (portfolioUrl) {
      doc.setTextColor(0, 102, 204); // Link color
      const portfolioDisplay = displayUrl(portfolioUrl);
      const textWidth = doc.getTextWidth(portfolioDisplay);
      const linkX = (pageWidth - textWidth) / 2;
      doc.textWithLink(portfolioDisplay, linkX, y, { url: portfolioUrl });
      y += 14;
      doc.setTextColor(0, 0, 0);
    }

    // Additional Links (clickable + label + url)
    if (formData.links && formData.links.length > 0) {
      doc.setFontSize(9);
      const validLinks = formData.links
        .map((l) => ({
          label: (l.label || '').trim(),
          url: normalizeUrl(l.url),
        }))
        .filter((l) => Boolean(l.url));

      if (validLinks.length > 0) {
        // Render as: Label: domain.com | Label2: domain.com
        doc.setTextColor(0, 0, 0);
        const separator = ' | ';
        const parts = validLinks.map((l) => {
          const shown = displayUrl(l.url);
          const text = l.label ? `${l.label}: ${shown}` : shown;
          return { text, url: l.url, width: doc.getTextWidth(text) };
        });

        const separatorWidth = doc.getTextWidth(separator);
        const totalWidth = parts.reduce((acc, p, i) => acc + p.width + (i > 0 ? separatorWidth : 0), 0);
        let currentX = (pageWidth - totalWidth) / 2;

        parts.forEach((p, i) => {
          if (i > 0) {
            doc.setTextColor(0, 0, 0);
            doc.text(separator, currentX, y);
            currentX += separatorWidth;
          }
          doc.setTextColor(0, 102, 204);
          doc.textWithLink(p.text, currentX, y, { url: p.url });
          currentX += p.width;
        });

        doc.setTextColor(0, 0, 0);
        y += 14;
      }
    }
    doc.setTextColor(0, 0, 0);

    // Divider
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Professional Summary
    if (formData.summary) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 5;
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + 140, y);
      y += 15;
      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      addWrappedText(formData.summary, margin, contentWidth, 14);
      y += 10;
    }

    // Work Experience
    if (formData.experience && formData.experience.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('WORK EXPERIENCE', margin, y);
      y += 5;
      doc.line(margin, y, margin + 110, y);
      y += 15;

      formData.experience.forEach((exp) => {
        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(11);
        doc.text(exp.position, margin, y);
        const dateText = `${exp.startDate} – ${exp.endDate || 'Present'}`;
        doc.setFont(fontNormal, 'normal');
        doc.setFontSize(10);
        doc.text(dateText, pageWidth - margin, y, { align: 'right' });
        y += 14;
        doc.setFont(fontNormal, 'normal');
        doc.text(`${exp.company}`, margin, y);
        y += 14;
        if (exp.description) {
          addWrappedText(`• ${exp.description}`, margin + 10, contentWidth - 10, 13);
        }
        exp.highlights?.forEach((h) => {
          if (h) addWrappedText(`• ${h}`, margin + 10, contentWidth - 10, 13);
        });
        y += 8;
      });
    }

    // Education
    if (formData.education && formData.education.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('EDUCATION', margin, y);
      y += 5;
      doc.line(margin, y, margin + 70, y);
      y += 15;

      formData.education.forEach((edu) => {
        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(11);
        doc.text(`${edu.degree} in ${edu.field}`, margin, y);
        doc.setFont(fontNormal, 'normal');
        doc.setFontSize(10);
        doc.text(`Graduated: ${edu.endDate}`, pageWidth - margin, y, { align: 'right' });
        y += 14;
        doc.text(`${edu.institution}`, margin, y);
        y += 16;
      });
    }

    // Skills
    if (pdfSkills.length > 0) {
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('SKILLS', margin, y);
      y += 5;
      doc.line(margin, y, margin + 45, y);
      y += 15;
      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      pdfSkills.forEach((skill) => {
        addWrappedText(`• ${skill}`, margin, contentWidth, 13);
      });
      y += 8;
    }

    // Projects
    if (formData.projects && formData.projects.length > 0) {
      ensureSpace(40);
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('PROJECTS', margin, y);
      y += 5;
      doc.line(margin, y, margin + 70, y);
      y += 15;

      formData.projects.forEach((proj) => {
        ensureSpace(40);
        const projectName = proj.name || 'Project';

        doc.setFont(fontNormal, 'bold');
        doc.setFontSize(11);
        doc.text(projectName, margin, y);

        const projectUrl = normalizeUrl(proj.link || '');
        if (projectUrl) {
          const linkText = displayUrl(projectUrl);
          doc.setFont(fontNormal, 'normal');
          doc.setFontSize(9);
          doc.setTextColor(0, 102, 204);
          const nameWidth = doc.getTextWidth(projectName);
          const linkWidth = doc.getTextWidth(linkText);
          const x = Math.min(pageWidth - margin - linkWidth, margin + nameWidth + 10);
          doc.textWithLink(linkText, x, y, { url: projectUrl });
          doc.setTextColor(0, 0, 0);
        }

        y += 14;
        doc.setFont(fontNormal, 'normal');
        doc.setFontSize(10);

        if (proj.description) {
          addWrappedText(`• ${proj.description}`, margin + 10, contentWidth - 10, 13);
        }
        const tech = compactStringArray(proj.technologies);
        if (tech.length > 0) {
          addWrappedText(`Tech: ${tech.join(', ')}`, margin + 10, contentWidth - 10, 13);
        }
        y += 6;
      });

      y += 6;
    }
    // Certifications
    if (formData.certifications && formData.certifications.length > 0) {
      ensureSpace(40);
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('CERTIFICATIONS', margin, y);
      y += 5;
      doc.line(margin, y, margin + 100, y);
      y += 15;
      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      formData.certifications
        .filter((cert) => cert.name || cert.issuer || cert.date)
        .forEach((cert) => {
          addWrappedText(`• ${cert.name} - ${cert.issuer} (${cert.date})`, margin, contentWidth, 13);
        });
      y += 8;
    }

    // Achievements
    if (pdfAchievements.length > 0) {
      ensureSpace(40);
      doc.setFont(fontNormal, 'bold');
      doc.setFontSize(12);
      doc.text('ACHIEVEMENTS', margin, y);
      y += 5;
      doc.line(margin, y, margin + 95, y);
      y += 15;
      doc.setFont(fontNormal, 'normal');
      doc.setFontSize(10);
      pdfAchievements.forEach((ach) => {
        addWrappedText(`• ${ach}`, margin, contentWidth, 13);
      });
      y += 8;
    }

    doc.save(`${formData.name || 'resume'}-ATS-Friendly.pdf`);
    toast({ title: 'PDF Exported!', description: 'ATS-friendly resume downloaded successfully.' });
  };

  const handleImprove = async (section: string) => {
    setImproving(section);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (section === 'summary') {
      const improved = formData.summary
        ? `${formData.summary} Demonstrated ability to deliver high-quality solutions under tight deadlines while collaborating effectively with cross-functional teams.`
        : 'Results-driven professional with a proven track record of driving brand growth, increasing online engagement, and delivering data-driven results. Expert in utilizing digital tools and analytics to optimize campaigns and achieve business objectives.';
      updateField('summary', improved);
    }
    toast({ title: 'AI Improvement Applied', description: `Your ${section} section has been enhanced.` });
    setImproving(null);
  };

  // Section CRUD helpers
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

  const addLink = () => {
    const newLink: ResumeLink = { id: crypto.randomUUID(), label: '', url: '' };
    updateField('links', [...(formData.links || []), newLink]);
  };
  const updateLink = (id: string, field: keyof ResumeLink, value: string) => {
    const updated = formData.links?.map((link) => link.id === id ? { ...link, [field]: value } : link);
    updateField('links', updated);
  };
  const removeLink = (id: string) => updateField('links', formData.links?.filter((link) => link.id !== id));

  const addCertification = () => {
    const newCert: Certification = { id: crypto.randomUUID(), name: '', issuer: '', date: '' };
    updateField('certifications', [...(formData.certifications || []), newCert]);
  };
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    const updated = formData.certifications?.map((cert) => cert.id === id ? { ...cert, [field]: value } : cert);
    updateField('certifications', updated);
  };
  const removeCertification = (id: string) => updateField('certifications', formData.certifications?.filter((cert) => cert.id !== id));

  const loadResume = (resume: Resume) => {
    setFormData(resume);
    setCurrentResume(resume);
    toast({ title: 'Resume Loaded', description: `Loaded version ${resume.version}` });
  };

  const createNewResume = async () => {
    await saveResume({ name: '', email: '', phone: '', location: '', portfolioLink: '', links: [], summary: '', education: [], experience: [], projects: [], skills: [], achievements: [], certifications: [] });
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'links', label: 'Links & Portfolio', icon: Link },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              Resume Builder
            </h1>
            <p className="text-muted-foreground mt-1">Create ATS-friendly professional resumes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-2">
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:border-primary">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportText} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-2">
              <FileDown className="w-4 h-4" />
              JSON
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-md">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Versions */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><History className="w-4 h-4" />Versions</span>
                  <Button variant="ghost" size="sm" onClick={createNewResume}><Plus className="w-4 h-4" /></Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[140px] pr-2">
                  {resumes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No saved resumes</p>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map((resume) => (
                        <div key={resume.id} className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${currentResume?.id === resume.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => loadResume(resume)}>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{resume.name || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">v{resume.version}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Delete?</AlertDialogTitle>
                                <AlertDialogDescription>Delete "{resume.name || 'Untitled'}" permanently?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(resume.id)} className="bg-destructive text-destructive-foreground">
                                  {deleting === resume.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Sections Nav */}
            <Card className="glass-card">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Sections</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeSection === section.id ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                      <Icon className="w-4 h-4" />{section.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className={`${showPreview ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
            <Card className="glass-card">
              <CardContent className="p-6">
                {/* Personal Info */}
                {activeSection === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Personal Information</h2><p className="text-sm text-muted-foreground">Your contact details</p></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2"><Label>Full Name</Label><Input value={formData.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="Michael Harris" className="text-lg font-medium" /></div>
                      <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} placeholder="michael.harris@email.com" /></div>
                      <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="+61 412 345 678" /></div>
                      <div className="space-y-2 sm:col-span-2"><Label>Location</Label><Input value={formData.location || ''} onChange={(e) => updateField('location', e.target.value)} placeholder="Sydney, Australia" /></div>
                    </div>
                  </div>
                )}

                {/* Links & Portfolio */}
                {activeSection === 'links' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Globe className="w-5 h-5 text-accent" /></div>
                      <div><h2 className="text-lg font-semibold">Links & Portfolio</h2><p className="text-sm text-muted-foreground">Your online presence</p></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                        <Label className="text-primary font-medium">Portfolio Link</Label>
                        <Input value={formData.portfolioLink || ''} onChange={(e) => updateField('portfolioLink', e.target.value)} placeholder="https://yourportfolio.com" className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">Your main portfolio or personal website</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Additional Links</Label>
                        <Button variant="outline" size="sm" onClick={addLink}><Plus className="w-4 h-4 mr-2" />Add Link</Button>
                      </div>

                      {formData.links?.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                          <Link className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">Add links to LinkedIn, GitHub, etc.</p>
                        </div>
                      )}

                      {formData.links?.map((link, index) => (
                        <div key={link.id} className="flex gap-3 items-start p-4 rounded-xl border border-border bg-secondary/20">
                          <div className="flex-1 grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Label</Label>
                              <Input value={link.label} onChange={(e) => updateLink(link.id, 'label', e.target.value)} placeholder="LinkedIn" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">URL</Label>
                              <Input value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} placeholder="https://linkedin.com/in/..." />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeLink(link.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {activeSection === 'summary' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Professional Summary</h2><p className="text-sm text-muted-foreground">Brief overview of your expertise</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleImprove('summary')} disabled={improving === 'summary'}>
                        {improving === 'summary' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}Improve with AI
                      </Button>
                    </div>
                    <Textarea value={formData.summary || ''} onChange={(e) => updateField('summary', e.target.value)} placeholder="Results-oriented professional with over 5 years of experience in digital marketing, brand strategy, and content creation. Proven ability to drive brand growth, increase online engagement, and deliver data-driven results..." rows={6} className="resize-none" />
                  </div>
                )}

                {/* Experience */}
                {activeSection === 'experience' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Work Experience</h2><p className="text-sm text-muted-foreground">Your professional history</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addExperience}><Plus className="w-4 h-4 mr-2" />Add</Button>
                    </div>
                    {formData.experience?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Briefcase className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No experience added yet</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={addExperience}><Plus className="w-4 h-4 mr-2" />Add Experience</Button>
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
                          <div className="space-y-2"><Label>Position/Title</Label><Input value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} placeholder="Marketing Manager" /></div>
                          <div className="space-y-2"><Label>Company</Label><Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="XYZ Corporation, Sydney" /></div>
                          <div className="space-y-2"><Label>Start Date</Label><Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="January 2022" /></div>
                          <div className="space-y-2"><Label>End Date</Label><Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" /></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description & Achievements (bullet points)</Label>
                          <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Lead a team of 5 in creating and executing digital marketing strategies across multiple platforms, including social media, SEO, and email campaigns." rows={4} />
                        </div>
                        <div className="space-y-2">
                          <Label>Additional Highlights (one per line)</Label>
                          <Textarea value={exp.highlights?.join('\n') || ''} onChange={(e) => updateExperience(exp.id, 'highlights', splitLinesPreserve(e.target.value))} placeholder="Achieved a 35% increase in website traffic...&#10;Managed a marketing budget of $200,000..." rows={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
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
                        <Button variant="outline" size="sm" className="mt-3" onClick={addEducation}><Plus className="w-4 h-4 mr-2" />Add Education</Button>
                      </div>
                    )}
                    {formData.education?.map((edu, index) => (
                      <div key={edu.id} className="p-5 rounded-xl border border-border bg-secondary/20 space-y-4">
                        <div className="flex items-center justify-between"><Badge variant="outline">Education {index + 1}</Badge><Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor" /></div>
                          <div className="space-y-2"><Label>Field of Study</Label><Input value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="Marketing" /></div>
                          <div className="space-y-2 sm:col-span-2"><Label>Institution</Label><Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="University of Sydney, Sydney, NSW" /></div>
                          <div className="space-y-2"><Label>Start Date</Label><Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="2014" /></div>
                          <div className="space-y-2"><Label>Graduation Date</Label><Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="2018" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {activeSection === 'skills' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Code className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Skills</h2><p className="text-sm text-muted-foreground">Technical and professional skills</p></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Skills (one per line or comma-separated)</Label>
                      <Textarea value={formData.skills?.join('\n') || ''} onChange={(e) => updateField('skills', e.target.value.split(/[\n,]/))} placeholder="Digital Marketing Strategy&#10;SEO & SEM, Google Analytics&#10;Social Media Marketing&#10;Content Creation & Copywriting" rows={6} />
                    </div>
                    {compactStringArray(formData.skills).length > 0 && (
                      <div className="flex flex-wrap gap-2">{compactStringArray(formData.skills).map((skill, i) => <Badge key={i} variant="secondary" className="text-sm">{skill}</Badge>)}</div>
                    )}
                  </div>
                )}

                {/* Projects */}
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
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Project Name</Label><Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="E-commerce Platform" /></div>
                          <div className="space-y-2"><Label>Project Link</Label><Input value={proj.link || ''} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} placeholder="https://github.com/..." /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="Describe the project, your role, and key achievements..." rows={3} /></div>
                        <div className="space-y-2"><Label>Technologies (comma-separated)</Label><Input value={proj.technologies?.join(', ') || ''} onChange={(e) => updateProject(proj.id, 'technologies', e.target.value.split(',').map(t => t.trim()))} placeholder="React, Node.js, PostgreSQL" /></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {activeSection === 'certifications' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Award className="w-5 h-5 text-primary" /></div>
                        <div><h2 className="text-lg font-semibold">Certifications</h2><p className="text-sm text-muted-foreground">Professional certifications</p></div>
                      </div>
                      <Button variant="outline" size="sm" onClick={addCertification}><Plus className="w-4 h-4 mr-2" />Add</Button>
                    </div>
                    {formData.certifications?.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <Award className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No certifications added yet</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={addCertification}><Plus className="w-4 h-4 mr-2" />Add Certification</Button>
                      </div>
                    )}
                    {formData.certifications?.map((cert, index) => (
                      <div key={cert.id} className="p-5 rounded-xl border border-border bg-secondary/20 space-y-4">
                        <div className="flex items-center justify-between"><Badge variant="outline">Certification {index + 1}</Badge><Button variant="ghost" size="sm" onClick={() => removeCertification(cert.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div>
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2"><Label>Name</Label><Input value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)} placeholder="Google Analytics Certified" /></div>
                          <div className="space-y-2"><Label>Issuer</Label><Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Google" /></div>
                          <div className="space-y-2"><Label>Date</Label><Input value={cert.date} onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} placeholder="2023" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {activeSection === 'achievements' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-primary" /></div>
                      <div><h2 className="text-lg font-semibold">Achievements</h2><p className="text-sm text-muted-foreground">Awards and recognition</p></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements (one per line)</Label>
                      <Textarea value={formData.achievements?.join('\n') || ''} onChange={(e) => updateField('achievements', splitLinesPreserve(e.target.value))} placeholder="Employee of the Year 2023&#10;Best Marketing Campaign Award&#10;Published in Forbes 30 Under 30" rows={6} />
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
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><Code className="w-5 h-5 text-orange-500" /></div>
                    <div className="text-left"><p className="font-medium">Check Skills</p><p className="text-xs text-muted-foreground">Find gaps</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                  <Button variant="outline" className="h-auto py-4 justify-start gap-3" onClick={() => navigate('/interview')}>
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-pink-500" /></div>
                    <div className="text-left"><p className="font-medium">Practice Interview</p><p className="text-xs text-muted-foreground">AI mock interview</p></div>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="lg:col-span-4">
              <Card className="glass-card sticky top-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-background border border-border rounded-lg p-6 text-xs space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Name */}
                    <div className="text-center border-b border-border pb-4">
                      <h1 className="text-lg font-bold tracking-wide uppercase">{formData.name || 'YOUR NAME'}</h1>
                      {compactStringArray(formData.skills).length >= 3 && (
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">
                          {compactStringArray(formData.skills).slice(0, 3).join(' | ')}
                        </p>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-1">
                        {[formData.location, formData.email, formData.phone].filter(Boolean).join(' | ')}
                      </p>

                      {(() => {
                        const portfolioUrl = normalizeUrl(formData.portfolioLink);
                        if (!portfolioUrl) return null;
                        return (
                          <p className="text-[10px] mt-1">
                            <a
                              href={portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {displayUrl(portfolioUrl)}
                            </a>
                          </p>
                        );
                      })()}

                      {(() => {
                        const links = (formData.links || [])
                          .map((l) => ({ label: (l.label || '').trim(), url: normalizeUrl(l.url) }))
                          .filter((l) => Boolean(l.url));

                        if (links.length === 0) return null;

                        return (
                          <p className="text-[9px] mt-2">
                            {links.map((l, idx) => {
                              const shown = displayUrl(l.url);
                              const text = l.label ? `${l.label}: ${shown}` : shown;
                              return (
                                <span key={`${l.url}-${idx}`}>
                                  {idx > 0 && <span className="text-muted-foreground"> | </span>}
                                  <a
                                    href={l.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {text}
                                  </a>
                                </span>
                              );
                            })}
                          </p>
                        );
                      })()}
                    </div>

                    {/* Summary */}
                    {formData.summary && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
                        <p className="text-[10px] leading-relaxed whitespace-pre-line">{formData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {formData.experience && formData.experience.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">WORK EXPERIENCE</h2>
                        {formData.experience.map((exp) => (
                          <div key={exp.id} className="mb-3">
                            <div className="flex justify-between">
                              <span className="font-bold">{exp.position || 'Position'}</span>
                              <span className="text-muted-foreground">{exp.startDate} – {exp.endDate || 'Present'}</span>
                            </div>
                            <p className="text-muted-foreground italic">{exp.company}</p>
                            {exp.description && <p className="mt-1 whitespace-pre-line">• {exp.description}</p>}
                            {exp.highlights?.map((h, i) => h && <p key={i}>• {h}</p>)}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {formData.education && formData.education.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">EDUCATION</h2>
                        {formData.education.map((edu) => (
                          <div key={edu.id} className="mb-2">
                            <div className="flex justify-between">
                              <span className="font-bold">{edu.degree} in {edu.field}</span>
                              <span className="text-muted-foreground">Graduated: {edu.endDate}</span>
                            </div>
                            <p className="text-muted-foreground italic">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skills */}
                    {compactStringArray(formData.skills).length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">SKILLS</h2>
                        <div className="space-y-0.5">
                          {compactStringArray(formData.skills).map((skill, i) => <p key={i}>• {skill}</p>)}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {formData.projects && formData.projects.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">PROJECTS</h2>
                        {formData.projects.map((proj) => (
                          <div key={proj.id} className="mb-2">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-bold">{proj.name || 'Project'}</span>
                              {proj.link && (
                                <a
                                  href={normalizeUrl(proj.link)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-[9px] inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  {displayUrl(normalizeUrl(proj.link))}
                                </a>
                              )}
                            </div>
                            {proj.description && <p className="text-[10px] whitespace-pre-line">{proj.description}</p>}
                            {compactStringArray(proj.technologies).length > 0 && (
                              <p className="text-[9px] text-muted-foreground">Tech: {compactStringArray(proj.technologies).join(', ')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {formData.certifications && formData.certifications.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">CERTIFICATIONS</h2>
                        <div className="space-y-0.5">
                          {formData.certifications.map((cert) => <p key={cert.id}>• {cert.name} - {cert.issuer} ({cert.date})</p>)}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {compactStringArray(formData.achievements).length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold border-b border-foreground/30 pb-1 mb-2">ACHIEVEMENTS</h2>
                        <div className="space-y-0.5">
                          {compactStringArray(formData.achievements).map((ach, i) => <p key={i}>• {ach}</p>)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}