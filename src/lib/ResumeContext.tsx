import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
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

export interface Resume {
  id: string;
  version: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
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
  setCurrentResume: (resume: Resume | null) => void;
  saveResume: (resume: Partial<Resume>) => Resume;
  saveAnalysis: (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>) => void;
  saveSkillGap: (skillGap: Omit<SkillGap, 'id' | 'createdAt'>) => void;
  saveInterviewAttempt: (attempt: Omit<InterviewAttempt, 'id' | 'createdAt'>) => InterviewAttempt;
  updateInterviewAttempt: (id: string, updates: Partial<InterviewAttempt>) => void;
  saveCareerVerdict: (verdict: Omit<CareerVerdict, 'createdAt'>) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

const STORAGE_KEY = 'career_engine_data';

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [interviewAttempts, setInterviewAttempts] = useState<InterviewAttempt[]>([]);
  const [careerVerdict, setCareerVerdict] = useState<CareerVerdict | null>(null);

  // Load data from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setResumes(data.resumes || []);
        setCurrentResume(data.currentResume || null);
        setAnalyses(data.analyses || []);
        setSkillGaps(data.skillGaps || []);
        setInterviewAttempts(data.interviewAttempts || []);
        setCareerVerdict(data.careerVerdict || null);
      }
    } else {
      // Clear data when logged out
      setResumes([]);
      setCurrentResume(null);
      setAnalyses([]);
      setSkillGaps([]);
      setInterviewAttempts([]);
      setCareerVerdict(null);
    }
  }, [user]);

  // Save data to localStorage
  useEffect(() => {
    if (user) {
      const data = {
        resumes,
        currentResume,
        analyses,
        skillGaps,
        interviewAttempts,
        careerVerdict,
      };
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(data));
    }
  }, [user, resumes, currentResume, analyses, skillGaps, interviewAttempts, careerVerdict]);

  const saveResume = (resumeData: Partial<Resume>): Resume => {
    const now = new Date().toISOString();
    
    if (resumeData.id) {
      // Update existing
      const updated = resumes.map(r => 
        r.id === resumeData.id 
          ? { ...r, ...resumeData, updatedAt: now }
          : r
      );
      setResumes(updated);
      const updatedResume = updated.find(r => r.id === resumeData.id)!;
      if (currentResume?.id === resumeData.id) {
        setCurrentResume(updatedResume);
      }
      return updatedResume;
    } else {
      // Create new
      const newResume: Resume = {
        id: crypto.randomUUID(),
        version: resumes.length + 1,
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
        createdAt: now,
        updatedAt: now,
        ...resumeData,
      };
      setResumes([...resumes, newResume]);
      setCurrentResume(newResume);
      return newResume;
    }
  };

  const saveAnalysis = (analysis: Omit<AnalysisResult, 'id' | 'createdAt'>) => {
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setAnalyses([...analyses, newAnalysis]);
  };

  const saveSkillGap = (skillGap: Omit<SkillGap, 'id' | 'createdAt'>) => {
    const newSkillGap: SkillGap = {
      ...skillGap,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSkillGaps([...skillGaps, newSkillGap]);
  };

  const saveInterviewAttempt = (attempt: Omit<InterviewAttempt, 'id' | 'createdAt'>): InterviewAttempt => {
    const newAttempt: InterviewAttempt = {
      ...attempt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setInterviewAttempts([...interviewAttempts, newAttempt]);
    return newAttempt;
    return newAttempt;
  };

  const updateInterviewAttempt = (id: string, updates: Partial<InterviewAttempt>) => {
    setInterviewAttempts(attempts =>
      attempts.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  };

  const saveCareerVerdict = (verdict: Omit<CareerVerdict, 'createdAt'>) => {
    setCareerVerdict({
      ...verdict,
      createdAt: new Date().toISOString(),
    });
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
        setCurrentResume,
        saveResume,
        saveAnalysis,
        saveSkillGap,
        saveInterviewAttempt,
        updateInterviewAttempt,
        saveCareerVerdict,
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
