-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE feature_status AS ENUM ('Draft', 'In Review', 'Approved', 'Locked');
CREATE TYPE reviewer_role AS ENUM ('Product', 'Design', 'Engineering');
CREATE TYPE reviewer_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE criteria_type AS ENUM ('Primary', 'Key');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature specifications table
CREATE TABLE public.feature_specs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  author TEXT NOT NULL,
  date DATE NOT NULL,
  status feature_status DEFAULT 'Draft',
  feature_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Success criteria table
CREATE TABLE public.success_criteria (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  type criteria_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviewers table
CREATE TABLE public.reviewers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role reviewer_role NOT NULL,
  status reviewer_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Target users table
CREATE TABLE public.target_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  user_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User goals table
CREATE TABLE public.user_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Use cases table
CREATE TABLE public.use_cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  expected_outcome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core interactions table
CREATE TABLE public.core_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Feature specs policies
CREATE POLICY "Users can view all feature specs" ON public.feature_specs FOR SELECT USING (true);
CREATE POLICY "Users can create feature specs" ON public.feature_specs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feature specs" ON public.feature_specs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feature specs" ON public.feature_specs FOR DELETE USING (auth.uid() = user_id);

-- Related tables policies (inherit from feature_specs)
CREATE POLICY "Users can view all success criteria" ON public.success_criteria FOR SELECT USING (true);
CREATE POLICY "Users can manage success criteria for own specs" ON public.success_criteria FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = success_criteria.feature_spec_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all reviewers" ON public.reviewers FOR SELECT USING (true);
CREATE POLICY "Users can manage reviewers for own specs" ON public.reviewers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = reviewers.feature_spec_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all target users" ON public.target_users FOR SELECT USING (true);
CREATE POLICY "Users can manage target users for own specs" ON public.target_users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = target_users.feature_spec_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all user goals" ON public.user_goals FOR SELECT USING (true);
CREATE POLICY "Users can manage user goals for own specs" ON public.user_goals FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = user_goals.feature_spec_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all use cases" ON public.use_cases FOR SELECT USING (true);
CREATE POLICY "Users can manage use cases for own specs" ON public.use_cases FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = use_cases.feature_spec_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view all core interactions" ON public.core_interactions FOR SELECT USING (true);
CREATE POLICY "Users can manage core interactions for own specs" ON public.core_interactions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = core_interactions.feature_spec_id 
    AND user_id = auth.uid()
  )
);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_specs_updated_at BEFORE UPDATE ON public.feature_specs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
