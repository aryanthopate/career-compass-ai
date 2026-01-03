-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  summary TEXT,
  education JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resume policies
CREATE POLICY "Users can view their own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own resumes" ON public.resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" ON public.resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" ON public.resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create resume analyses table
CREATE TABLE public.resume_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  ats_score INTEGER NOT NULL DEFAULT 0,
  strength_areas TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  skill_inflation TEXT[] DEFAULT '{}',
  role_mismatch TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Analysis policies
CREATE POLICY "Users can view their own analyses" ON public.resume_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" ON public.resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create skill gaps table
CREATE TABLE public.skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  readiness_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;

-- Skill gap policies
CREATE POLICY "Users can view their own skill gaps" ON public.skill_gaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skill gaps" ON public.skill_gaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create interview attempts table
CREATE TABLE public.interview_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  evaluation JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_attempts ENABLE ROW LEVEL SECURITY;

-- Interview policies
CREATE POLICY "Users can view their own interviews" ON public.interview_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interviews" ON public.interview_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON public.interview_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create career verdicts table
CREATE TABLE public.career_verdicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hiring_probability INTEGER NOT NULL DEFAULT 0,
  resume_readiness INTEGER NOT NULL DEFAULT 0,
  interview_readiness INTEGER NOT NULL DEFAULT 0,
  skill_readiness INTEGER NOT NULL DEFAULT 0,
  salary_range JSONB DEFAULT '{"min": 0, "max": 0}'::jsonb,
  top_risks TEXT[] DEFAULT '{}',
  next_actions TEXT[] DEFAULT '{}',
  recommended_roles TEXT[] DEFAULT '{}',
  roles_to_avoid TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_verdicts ENABLE ROW LEVEL SECURITY;

-- Verdict policies
CREATE POLICY "Users can view their own verdict" ON public.career_verdicts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verdict" ON public.career_verdicts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verdict" ON public.career_verdicts
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();