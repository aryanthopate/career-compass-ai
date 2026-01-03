import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useResume, Resume, Education, Experience, Project } from '@/lib/ResumeContext';
import {
  Plus,
  Trash2,
  Sparkles,
  Save,
  Download,
  GripVertical,
  User,
  Briefcase,
  GraduationCap,
  Folder,
  Trophy,
  Code,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const sectionIcons = {
  personal: User,
  summary: Sparkles,
  education: GraduationCap,
  experience: Briefcase,
  projects: Folder,
  skills: Code,
  achievements: Trophy,
};

export function ResumeEditor() {
  const { currentResume, saveResume } = useResume();
  const [activeSection, setActiveSection] = useState<string>('personal');
  const [improving, setImproving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        toast({
          title: 'Resume saved!',
          description: `Version ${saved.version} saved successfully.`,
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Error saving resume',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const handleImprove = async (section: string) => {
    setImproving(section);
    // Simulate AI improvement
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (section === 'summary') {
      const improved = formData.summary
        ? `${formData.summary} Demonstrated ability to deliver high-quality solutions under tight deadlines while collaborating effectively with cross-functional teams.`
        : 'Results-driven professional with a passion for technology and innovation. Skilled in problem-solving and committed to continuous learning and professional growth.';
      updateField('summary', improved);
    }
    
    toast({
      title: 'AI Improvement Applied',
      description: `Your ${section} section has been enhanced.`,
    });
    setImproving(null);
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    updateField('education', [...(formData.education || []), newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updated = formData.education?.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateField('education', updated);
  };

  const removeEducation = (id: string) => {
    updateField(
      'education',
      formData.education?.filter((edu) => edu.id !== id)
    );
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: [],
    };
    updateField('experience', [...(formData.experience || []), newExp]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const updated = formData.experience?.map((exp) =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    updateField('experience', updated);
  };

  const removeExperience = (id: string) => {
    updateField(
      'experience',
      formData.experience?.filter((exp) => exp.id !== id)
    );
  };

  const addProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
    };
    updateField('projects', [...(formData.projects || []), newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updated = formData.projects?.map((proj) =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    updateField('projects', updated);
  };

  const removeProject = (id: string) => {
    updateField(
      'projects',
      formData.projects?.filter((proj) => proj.id !== id)
    );
  };

  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'achievements', label: 'Achievements' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Section Navigation */}
      <div className="lg:w-48 flex-shrink-0">
        <div className="glass-card p-2 lg:sticky lg:top-24">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {sections.map((section) => {
              const Icon = sectionIcons[section.id as keyof typeof sectionIcons] || Sparkles;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 min-w-0">
        <div className="glass-card p-6">
          {/* Personal Info */}
          {activeSection === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {activeSection === 'summary' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Professional Summary
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImprove('summary')}
                  disabled={improving === 'summary'}
                >
                  {improving === 'summary' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Improve with AI
                </Button>
              </div>
              <Textarea
                value={formData.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Write a compelling summary of your professional background, key achievements, and career goals..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Keep it concise (2-3 sentences) and highlight your unique value proposition.
              </p>
            </div>
          )}

          {/* Education */}
          {activeSection === 'education' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education
                </h2>
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>

              {formData.education?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No education added yet. Click "Add Education" to get started.
                </p>
              )}

              {formData.education?.map((edu, index) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-lg border border-border bg-secondary/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium">Education {index + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(edu.id, 'institution', e.target.value)
                        }
                        placeholder="MIT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(edu.id, 'degree', e.target.value)
                        }
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) =>
                          updateEducation(edu.id, 'field', e.target.value)
                        }
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={edu.gpa || ''}
                        onChange={(e) =>
                          updateEducation(edu.id, 'gpa', e.target.value)
                        }
                        placeholder="3.8/4.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(edu.id, 'startDate', e.target.value)
                        }
                        placeholder="Aug 2019"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(edu.id, 'endDate', e.target.value)
                        }
                        placeholder="May 2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {activeSection === 'experience' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Work Experience
                </h2>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              {formData.experience?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No experience added yet. Internships and part-time work count too!
                </p>
              )}

              {formData.experience?.map((exp, index) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-lg border border-border bg-secondary/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium">Experience {index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImprove(`experience-${exp.id}`)}
                        disabled={improving === `experience-${exp.id}`}
                      >
                        {improving === `experience-${exp.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, 'company', e.target.value)
                        }
                        placeholder="Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(exp.id, 'position', e.target.value)
                        }
                        placeholder="Software Engineer Intern"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(exp.id, 'startDate', e.target.value)
                        }
                        placeholder="Jun 2022"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) =>
                          updateExperience(exp.id, 'endDate', e.target.value)
                        }
                        placeholder="Aug 2022"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(exp.id, 'description', e.target.value)
                      }
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {activeSection === 'projects' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Folder className="w-5 h-5 text-primary" />
                  Projects
                </h2>
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              {formData.projects?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No projects added yet. Showcase your best work!
                </p>
              )}

              {formData.projects?.map((proj, index) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-lg border border-border bg-secondary/30 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-medium">Project {index + 1}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(proj.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={proj.name}
                        onChange={(e) =>
                          updateProject(proj.id, 'name', e.target.value)
                        }
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link (Optional)</Label>
                      <Input
                        value={proj.link || ''}
                        onChange={(e) =>
                          updateProject(proj.id, 'link', e.target.value)
                        }
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={proj.description}
                      onChange={(e) =>
                        updateProject(proj.id, 'description', e.target.value)
                      }
                      placeholder="Describe the project, your role, and impact..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technologies (comma-separated)</Label>
                    <Input
                      value={proj.technologies.join(', ')}
                      onChange={(e) =>
                        updateProject(
                          proj.id,
                          'technologies',
                          e.target.value.split(',').map((t) => t.trim())
                        )
                      }
                      placeholder="React, Node.js, PostgreSQL"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {activeSection === 'skills' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Skills
                </h2>
              </div>
              <div className="space-y-2">
                <Label>Technical Skills (comma-separated)</Label>
                <Textarea
                  value={formData.skills?.join(', ') || ''}
                  onChange={(e) =>
                    updateField(
                      'skills',
                      e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="JavaScript, Python, React, Node.js, SQL, Git, AWS, Docker..."
                  rows={4}
                />
              </div>
              {formData.skills && formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Achievements */}
          {activeSection === 'achievements' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Achievements & Awards
                </h2>
              </div>
              <div className="space-y-2">
                <Label>Achievements (one per line)</Label>
                <Textarea
                  value={formData.achievements?.join('\n') || ''}
                  onChange={(e) =>
                    updateField(
                      'achievements',
                      e.target.value.split('\n').filter(Boolean)
                    )
                  }
                  placeholder="Dean's List 2022-2023&#10;First Place at University Hackathon&#10;Published research paper in IEEE..."
                  rows={5}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Resume
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
