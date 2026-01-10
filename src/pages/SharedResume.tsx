import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Resume, Education, Experience, Project, Link as ResumeLink, Certification, EducationDateType } from '@/lib/ResumeContext';

const getEducationDateLabel = (dateType?: EducationDateType) => {
  switch (dateType) {
    case 'passed': return 'Passed';
    case 'expected': return 'Expected';
    case 'pursuing': return 'Pursuing';
    default: return 'Graduated';
  }
};

export default function SharedResume() {
  const { token } = useParams<{ token: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeUrl = (url?: string) => {
    const raw = (url || '').trim();
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  };

  const displayUrl = (url: string) =>
    url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

  const compactStringArray = (arr?: (string | null)[]) =>
    (arr || []).map((s) => (s || '').trim()).filter((s) => s.length > 0);

  useEffect(() => {
    const fetchResume = async () => {
      if (!token) {
        setError('Invalid share link.');
        setLoading(false);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('resumes')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();

      if (dbError || !data) {
        setError('Resume not found or link expired.');
        setLoading(false);
        return;
      }

      setResume({
        id: data.id,
        version: data.version,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        portfolioLink: (data as any).portfolio_link || '',
        links: ((data as any).links as unknown as ResumeLink[]) || [],
        summary: data.summary || '',
        education: (data.education as unknown as Education[]) || [],
        experience: (data.experience as unknown as Experience[]) || [],
        projects: (data.projects as unknown as Project[]) || [],
        skills: data.skills || [],
        achievements: data.achievements || [],
        certifications: ((data as any).certifications as unknown as Certification[]) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
      setLoading(false);
    };

    fetchResume();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-center p-6">
        <h1 className="text-2xl font-bold">{error}</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const pdfSkills = compactStringArray(resume.skills);
  const pdfAchievements = compactStringArray(resume.achievements);

  const topSkills = pdfSkills.slice(0, 3);
  const remainingSkills = pdfSkills.slice(3);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4">
      {/* Resume Card */}
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl p-8 md:p-12 shadow-lg print:shadow-none print:border-none space-y-5 text-sm">
        {/* Header */}
        <header className="text-center border-b border-border pb-4 space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">{resume.name || 'Resume'}</h1>
          {topSkills.length > 0 && (
            <p className="text-sm font-semibold text-muted-foreground">
              {topSkills.join('  •  ')}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {resume.location && <span>{resume.location}</span>}
            {resume.location && resume.email && <span className="mx-1">|</span>}
            {resume.email && (
              <a href={`mailto:${resume.email}`} className="text-primary hover:underline">
                {resume.email}
              </a>
            )}
            {(resume.location || resume.email) && resume.phone && <span className="mx-1">|</span>}
            {resume.phone && (
              <a href={`tel:${resume.phone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                {resume.phone}
              </a>
            )}
          </p>
          {(() => {
            const portfolioUrl = normalizeUrl(resume.portfolioLink);
            if (!portfolioUrl) return null;
            return (
              <p className="text-sm">
                <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {displayUrl(portfolioUrl)}
                </a>
              </p>
            );
          })()}
          {(() => {
            const links = (resume.links || [])
              .map((l) => ({ label: (l.label || '').trim(), url: normalizeUrl(l.url) }))
              .filter((l) => l.url);
            if (links.length === 0) return null;
            return (
              <p className="text-sm">
                {links.map((l, idx) => {
                  const text = l.label ? `${l.label}: ${displayUrl(l.url)}` : displayUrl(l.url);
                  return (
                    <span key={idx}>
                      {idx > 0 && <span className="text-muted-foreground mx-1">|</span>}
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {text}
                      </a>
                    </span>
                  );
                })}
              </p>
            );
          })()}
        </header>

        {/* Summary */}
        {resume.summary && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
            <p className="text-sm whitespace-pre-line leading-relaxed">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">WORK EXPERIENCE</h2>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between flex-wrap gap-2 text-sm">
                  <span className="font-bold">{exp.position}</span>
                  <span className="text-muted-foreground">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
                {exp.description && <p className="text-sm mt-1 whitespace-pre-line">• {exp.description}</p>}
                {compactStringArray(exp.highlights).map((h, i) => (
                  <p key={i} className="text-sm">• {h}</p>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">EDUCATION</h2>
            {resume.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between flex-wrap gap-2 text-sm">
                  <span className="font-bold">{edu.field ? `${edu.degree} in ${edu.field}` : edu.degree}</span>
                  <span className="text-muted-foreground">
                    {edu.endDate && `${getEducationDateLabel(edu.dateType)}: ${edu.endDate}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {remainingSkills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">SKILLS</h2>
            <p className="text-sm">{remainingSkills.join('  •  ')}</p>
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">PROJECTS</h2>
            {resume.projects.map((proj) => (
              <div key={proj.id} className="mb-2">
                <div className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-bold">{proj.name || 'Project'}</span>
                  {proj.link && (
                    <a
                      href={normalizeUrl(proj.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      ({displayUrl(normalizeUrl(proj.link))})
                    </a>
                  )}
                </div>
                {proj.description && <p className="text-sm whitespace-pre-line">{proj.description}</p>}
                {compactStringArray(proj.technologies).length > 0 && (
                  <p className="text-xs text-muted-foreground">Technologies: {compactStringArray(proj.technologies).join(', ')}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {(resume.certifications || []).filter((c) => c.name).length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">CERTIFICATIONS</h2>
            <div className="space-y-0.5 text-sm">
              {resume.certifications.map((cert) => (
                <p key={cert.id}>• {cert.name} - {cert.issuer} ({cert.date})</p>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {pdfAchievements.length > 0 && (
          <section>
            <h2 className="text-sm font-bold border-b border-foreground/30 pb-1 mb-2">ACHIEVEMENTS</h2>
            <div className="space-y-0.5 text-sm">
              {pdfAchievements.map((ach, i) => (
                <p key={i}>• {ach}</p>
              ))}
            </div>
          </section>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-8">Shared via Career Reality Engine</p>
    </div>
  );
}
