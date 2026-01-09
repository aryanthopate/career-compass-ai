import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type EducationDateType = 'graduated' | 'passed' | 'expected' | 'pursuing';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  dateType?: EducationDateType;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Resume {
  id: string;
  version: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  portfolioLink: string;
  links: Link[];
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  achievements: string[];
  certifications: Certification[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  resumeId: string | null;
  score: number;
  atsScore: number;
  strengthAreas: string[];
  weaknesses: string[];
  suggestions: string[];
  skillInflation: string[];
  roleMismatch: string[];
  createdAt: string;
}

export interface SkillGap {
  id: string;
  targetRole: string;
  experienceLevel: string;
  missingSkills: {
    skill: string;
    importance: 'critical' | 'important' | 'optional';
    timeToLearn: string;
  }[];
  readinessScore: number;
  createdAt: string;
}

export interface InterviewAttempt {
  id: string;
  role: string;
  experienceLevel: string;
  messages: { role: 'interviewer' | 'user'; content: string }[];
  evaluation: {
    confidenceScore: number;
    clarityScore: number;
    technicalScore: number;
    verdict: 'hire' | 'borderline' | 'reject';
    reasoning: string;
  } | null;
  createdAt: string;
}

export interface CareerVerdict {
  hiringProbability: number;
  resumeReadiness: number;
  interviewReadiness: number;
  skillReadiness: number;
  salaryRange: { min: number; max: number };
  topRisks: string[];
  nextActions: string[];
  recommendedRoles: string[];
  rolesToAvoid: string[];
  createdAt: string;
}

interface ResumeContextType {
  resumes: Resume[];
  currentResume: Resume | null;
  analyses: AnalysisResult[];
  skillGaps: SkillGap[];
  interviewAttempts: InterviewAttempt[];
  careerVerdict: CareerVerdict | null;
  loading: boolean;
  setCurrentResume: (resume: Resume | null) => void;
  saveResume: (resume: Partial<Resume>) => Promise<Resume | null>;
  saveAnalysis: (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>) => Promise<void>;
  saveSkillGap: (skillGap: Omit<SkillGap, 'id' | 'createdAt'>) => Promise<void>;
  saveInterviewAttempt: (attempt: Omit<InterviewAttempt, 'id' | 'createdAt'>) => Promise<InterviewAttempt | null>;
  updateInterviewAttempt: (id: string, updates: Partial<InterviewAttempt>) => Promise<void>;
  saveCareerVerdict: (verdict: Omit<CareerVerdict, 'createdAt'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [interviewAttempts, setInterviewAttempts] = useState<InterviewAttempt[]>([]);
  const [careerVerdict, setCareerVerdict] = useState<CareerVerdict | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!user) {
      setResumes([]);
      setCurrentResume(null);
      setAnalyses([]);
      setSkillGaps([]);
      setInterviewAttempts([]);
      setCareerVerdict(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('version', { ascending: false });

      if (resumesData) {
        const mapped: Resume[] = resumesData.map((r) => ({
          id: r.id,
          version: r.version,
          name: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          location: r.location || '',
          portfolioLink: (r as any).portfolio_link || '',
          links: ((r as any).links as unknown as Link[]) || [],
          summary: r.summary || '',
          education: (r.education as unknown as Education[]) || [],
          experience: (r.experience as unknown as Experience[]) || [],
          projects: (r.projects as unknown as Project[]) || [],
          skills: r.skills || [],
          achievements: r.achievements || [],
          certifications: ((r as any).certifications as unknown as Certification[]) || [],
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        setResumes(mapped);
        if (mapped.length > 0 && !currentResume) {
          setCurrentResume(mapped[0]);
        }
      }

      // Fetch analyses
      const { data: analysesData } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (analysesData) {
        setAnalyses(
          analysesData.map((a) => ({
            id: a.id,
            resumeId: a.resume_id,
            score: a.score,
            atsScore: a.ats_score,
            strengthAreas: a.strength_areas || [],
            weaknesses: a.weaknesses || [],
            suggestions: a.suggestions || [],
            skillInflation: a.skill_inflation || [],
            roleMismatch: a.role_mismatch || [],
            createdAt: a.created_at,
          }))
        );
      }

      // Fetch skill gaps
      const { data: skillGapsData } = await supabase
        .from('skill_gaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (skillGapsData) {
        setSkillGaps(
          skillGapsData.map((s) => ({
            id: s.id,
            targetRole: s.target_role,
            experienceLevel: s.experience_level,
            missingSkills: (s.missing_skills as unknown as SkillGap['missingSkills']) || [],
            readinessScore: s.readiness_score,
            createdAt: s.created_at,
          }))
        );
      }

      // Fetch interview attempts
      const { data: interviewsData } = await supabase
        .from('interview_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (interviewsData) {
        setInterviewAttempts(
          interviewsData.map((i) => ({
            id: i.id,
            role: i.role,
            experienceLevel: i.experience_level,
            messages: (i.messages as unknown as InterviewAttempt['messages']) || [],
            evaluation: i.evaluation as unknown as InterviewAttempt['evaluation'],
            createdAt: i.created_at,
          }))
        );
      }

      // Fetch career verdict
      const { data: verdictData } = await supabase
        .from('career_verdicts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (verdictData) {
        const salaryRange = verdictData.salary_range as { min: number; max: number } | null;
        setCareerVerdict({
          hiringProbability: verdictData.hiring_probability,
          resumeReadiness: verdictData.resume_readiness,
          interviewReadiness: verdictData.interview_readiness,
          skillReadiness: verdictData.skill_readiness,
          salaryRange: salaryRange || { min: 0, max: 0 },
          topRisks: verdictData.top_risks || [],
          nextActions: verdictData.next_actions || [],
          recommendedRoles: verdictData.recommended_roles || [],
          rolesToAvoid: verdictData.roles_to_avoid || [],
          createdAt: verdictData.created_at,
        });
      } else {
        setCareerVerdict(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }

    setLoading(false);
  }, [user, currentResume]);

  useEffect(() => {
    refreshData();
  }, [user]);

  const saveResume = async (resumeData: Partial<Resume>): Promise<Resume | null> => {
    if (!user) return null;

    try {
      if (resumeData.id) {
        // Update existing
        const { data, error } = await supabase
          .from('resumes')
          .update({
            name: resumeData.name,
            email: resumeData.email,
            phone: resumeData.phone,
            location: resumeData.location,
            portfolio_link: resumeData.portfolioLink,
            links: resumeData.links as unknown as Json,
            summary: resumeData.summary,
            education: resumeData.education as unknown as Json,
            experience: resumeData.experience as unknown as Json,
            projects: resumeData.projects as unknown as Json,
            skills: resumeData.skills,
            achievements: resumeData.achievements,
            certifications: resumeData.certifications as unknown as Json,
          })
          .eq('id', resumeData.id)
          .select()
          .single();

        if (error) throw error;

        const updated: Resume = {
          id: data.id,
          version: data.version,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          portfolioLink: (data as any).portfolio_link || '',
          links: ((data as any).links as unknown as Link[]) || [],
          summary: data.summary || '',
          education: (data.education as unknown as Education[]) || [],
          experience: (data.experience as unknown as Experience[]) || [],
          projects: (data.projects as unknown as Project[]) || [],
          skills: data.skills || [],
          achievements: data.achievements || [],
          certifications: ((data as any).certifications as unknown as Certification[]) || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setResumes((prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r))
        );
        if (currentResume?.id === updated.id) {
          setCurrentResume(updated);
        }

        return updated;
      } else {
        // Create new
        const nextVersion = resumes.length + 1;

        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: user.id,
            version: nextVersion,
            name: resumeData.name || '',
            email: resumeData.email || '',
            phone: resumeData.phone || '',
            location: resumeData.location || '',
            portfolio_link: resumeData.portfolioLink || '',
            links: (resumeData.links || []) as unknown as Json,
            summary: resumeData.summary || '',
            education: (resumeData.education || []) as unknown as Json,
            experience: (resumeData.experience || []) as unknown as Json,
            projects: (resumeData.projects || []) as unknown as Json,
            skills: resumeData.skills || [],
            achievements: resumeData.achievements || [],
            certifications: (resumeData.certifications || []) as unknown as Json,
          })
          .select()
          .single();

        if (error) throw error;

        const created: Resume = {
          id: data.id,
          version: data.version,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          portfolioLink: (data as any).portfolio_link || '',
          links: ((data as any).links as unknown as Link[]) || [],
          summary: data.summary || '',
          education: (data.education as unknown as Education[]) || [],
          experience: (data.experience as unknown as Experience[]) || [],
          projects: (data.projects as unknown as Project[]) || [],
          skills: data.skills || [],
          achievements: data.achievements || [],
          certifications: ((data as any).certifications as unknown as Certification[]) || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setResumes((prev) => [created, ...prev]);
        setCurrentResume(created);

        return created;
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      return null;
    }
  };

  const saveAnalysis = async (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resume_analyses')
        .insert({
          user_id: user.id,
          resume_id: analysis.resumeId,
          score: analysis.score,
          ats_score: analysis.atsScore,
          strength_areas: analysis.strengthAreas,
          weaknesses: analysis.weaknesses,
          suggestions: analysis.suggestions,
          skill_inflation: analysis.skillInflation,
          role_mismatch: analysis.roleMismatch,
        })
        .select()
        .single();

      if (error) throw error;

      const created: AnalysisResult = {
        id: data.id,
        resumeId: data.resume_id,
        score: data.score,
        atsScore: data.ats_score,
        strengthAreas: data.strength_areas || [],
        weaknesses: data.weaknesses || [],
        suggestions: data.suggestions || [],
        skillInflation: data.skill_inflation || [],
        roleMismatch: data.role_mismatch || [],
        createdAt: data.created_at,
      };

      setAnalyses((prev) => [created, ...prev]);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const saveSkillGap = async (skillGap: Omit<SkillGap, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('skill_gaps')
        .insert({
          user_id: user.id,
          target_role: skillGap.targetRole,
          experience_level: skillGap.experienceLevel,
          missing_skills: skillGap.missingSkills as unknown as Json,
          readiness_score: skillGap.readinessScore,
        })
        .select()
        .single();

      if (error) throw error;

      const created: SkillGap = {
        id: data.id,
        targetRole: data.target_role,
        experienceLevel: data.experience_level,
        missingSkills: (data.missing_skills as unknown as SkillGap['missingSkills']) || [],
        readinessScore: data.readiness_score,
        createdAt: data.created_at,
      };

      setSkillGaps((prev) => [created, ...prev]);
    } catch (error) {
      console.error('Error saving skill gap:', error);
    }
  };

  const saveInterviewAttempt = async (
    attempt: Omit<InterviewAttempt, 'id' | 'createdAt'>
  ): Promise<InterviewAttempt | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('interview_attempts')
        .insert({
          user_id: user.id,
          role: attempt.role,
          experience_level: attempt.experienceLevel,
          messages: attempt.messages as unknown as Json,
          evaluation: attempt.evaluation as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;

      const created: InterviewAttempt = {
        id: data.id,
        role: data.role,
        experienceLevel: data.experience_level,
        messages: (data.messages as unknown as InterviewAttempt['messages']) || [],
        evaluation: data.evaluation as unknown as InterviewAttempt['evaluation'],
        createdAt: data.created_at,
      };

      setInterviewAttempts((prev) => [created, ...prev]);
      return created;
    } catch (error) {
      console.error('Error saving interview:', error);
      return null;
    }
  };

  const updateInterviewAttempt = async (id: string, updates: Partial<InterviewAttempt>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('interview_attempts')
        .update({
          messages: updates.messages as unknown as Json,
          evaluation: updates.evaluation as unknown as Json,
        })
        .eq('id', id);

      if (error) throw error;

      setInterviewAttempts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
      );
    } catch (error) {
      console.error('Error updating interview:', error);
    }
  };

  const saveCareerVerdict = async (verdict: Omit<CareerVerdict, 'createdAt'>) => {
    if (!user) return;

    try {
      // Upsert - update if exists, insert if not
      const { data, error } = await supabase
        .from('career_verdicts')
        .upsert({
          user_id: user.id,
          hiring_probability: verdict.hiringProbability,
          resume_readiness: verdict.resumeReadiness,
          interview_readiness: verdict.interviewReadiness,
          skill_readiness: verdict.skillReadiness,
          salary_range: verdict.salaryRange as unknown as Json,
          top_risks: verdict.topRisks,
          next_actions: verdict.nextActions,
          recommended_roles: verdict.recommendedRoles,
          roles_to_avoid: verdict.rolesToAvoid,
        })
        .select()
        .single();

      if (error) throw error;

      const salaryRange = data.salary_range as { min: number; max: number } | null;
      setCareerVerdict({
        hiringProbability: data.hiring_probability,
        resumeReadiness: data.resume_readiness,
        interviewReadiness: data.interview_readiness,
        skillReadiness: data.skill_readiness,
        salaryRange: salaryRange || { min: 0, max: 0 },
        topRisks: data.top_risks || [],
        nextActions: data.next_actions || [],
        recommendedRoles: data.recommended_roles || [],
        rolesToAvoid: data.roles_to_avoid || [],
        createdAt: data.created_at,
      });
    } catch (error) {
      console.error('Error saving career verdict:', error);
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        resumes,
        currentResume,
        analyses,
        skillGaps,
        interviewAttempts,
        careerVerdict,
        loading,
        setCurrentResume,
        saveResume,
        saveAnalysis,
        saveSkillGap,
        saveInterviewAttempt,
        updateInterviewAttempt,
        saveCareerVerdict,
        refreshData,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
