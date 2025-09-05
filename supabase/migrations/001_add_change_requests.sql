-- Migration: Add change requests system
-- Run this in Supabase SQL Editor

-- Add new custom types
CREATE TYPE change_request_status AS ENUM ('open', 'accepted', 'rejected', 'resolved');
CREATE TYPE change_request_type AS ENUM ('suggestion', 'issue', 'question', 'improvement');

-- Create change requests table
CREATE TABLE public.change_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feature_spec_id UUID REFERENCES public.feature_specs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type change_request_type DEFAULT 'suggestion',
  status change_request_status DEFAULT 'open',
  section TEXT, -- Which section of the spec this relates to (e.g., 'success_criteria', 'use_cases')
  section_id UUID, -- ID of the specific item being commented on
  suggested_change TEXT, -- The proposed change
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create change request comments table
CREATE TABLE public.change_request_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  change_request_id UUID REFERENCES public.change_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_request_comments ENABLE ROW LEVEL SECURITY;

-- Change requests policies
CREATE POLICY "Users can view all change requests" ON public.change_requests FOR SELECT USING (true);
CREATE POLICY "Users can create change requests" ON public.change_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own change requests" ON public.change_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Spec owners can update change requests on their specs" ON public.change_requests FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs 
    WHERE id = change_requests.feature_spec_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete own change requests" ON public.change_requests FOR DELETE USING (auth.uid() = user_id);

-- Change request comments policies
CREATE POLICY "Users can view all change request comments" ON public.change_request_comments FOR SELECT USING (true);
CREATE POLICY "Users can create change request comments" ON public.change_request_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own change request comments" ON public.change_request_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own change request comments" ON public.change_request_comments FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON public.change_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
