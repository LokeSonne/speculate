-- Migration: Add Organizations and Multi-tier Architecture Support
-- This migration adds organization support to enable multi-tenant architecture

-- Create organization role enum
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}', -- Organization-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organization memberships table
CREATE TABLE public.organization_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role organization_role DEFAULT 'member' NOT NULL,
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique membership per user per organization
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to feature_specs table
ALTER TABLE public.feature_specs 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to profiles table for default organization
ALTER TABLE public.profiles 
ADD COLUMN default_organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON public.organizations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization owners can update their organization" ON public.organizations 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

CREATE POLICY "Organization owners can delete their organization" ON public.organizations 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Organization memberships policies
CREATE POLICY "Users can view memberships in organizations they belong to" ON public.organization_memberships 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om2 
    WHERE om2.organization_id = organization_memberships.organization_id 
    AND om2.user_id = auth.uid()
  )
);

CREATE POLICY "Organization admins and owners can manage memberships" ON public.organization_memberships 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships om2 
    WHERE om2.organization_id = organization_memberships.organization_id 
    AND om2.user_id = auth.uid() 
    AND om2.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can update their own membership status" ON public.organization_memberships 
FOR UPDATE USING (user_id = auth.uid());

-- Update feature_specs policies to be organization-aware
DROP POLICY IF EXISTS "Users can view all feature specs" ON public.feature_specs;
DROP POLICY IF EXISTS "Users can create feature specs" ON public.feature_specs;
DROP POLICY IF EXISTS "Users can update own feature specs" ON public.feature_specs;
DROP POLICY IF EXISTS "Users can delete own feature specs" ON public.feature_specs;

CREATE POLICY "Users can view feature specs in their organizations" ON public.feature_specs 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = feature_specs.organization_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can create feature specs" ON public.feature_specs 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = feature_specs.organization_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Feature spec authors can update their specs" ON public.feature_specs 
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = feature_specs.organization_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Feature spec authors and org admins can delete specs" ON public.feature_specs 
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_id = feature_specs.organization_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Update change requests policies to be organization-aware
DROP POLICY IF EXISTS "Users can view all change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Users can create change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Users can update own change requests" ON public.change_requests;
DROP POLICY IF EXISTS "Spec owners can update change requests on their specs" ON public.change_requests;
DROP POLICY IF EXISTS "Users can delete own change requests" ON public.change_requests;

CREATE POLICY "Users can view change requests in their organizations" ON public.change_requests 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = change_requests.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can create change requests" ON public.change_requests 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = change_requests.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Change request authors can update their requests" ON public.change_requests 
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = change_requests.feature_spec_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Change request authors and org admins can delete requests" ON public.change_requests 
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = change_requests.feature_spec_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

-- Update change request comments policies
DROP POLICY IF EXISTS "Users can view all change request comments" ON public.change_request_comments;
DROP POLICY IF EXISTS "Users can create change request comments" ON public.change_request_comments;
DROP POLICY IF EXISTS "Users can update own change request comments" ON public.change_request_comments;
DROP POLICY IF EXISTS "Users can delete own change request comments" ON public.change_request_comments;

CREATE POLICY "Users can view comments in their organizations" ON public.change_request_comments 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.change_requests cr
    JOIN public.feature_specs fs ON cr.feature_spec_id = fs.id
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE cr.id = change_request_comments.change_request_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can create comments" ON public.change_request_comments 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.change_requests cr
    JOIN public.feature_specs fs ON cr.feature_spec_id = fs.id
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE cr.id = change_request_comments.change_request_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Comment authors can update their comments" ON public.change_request_comments 
FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.change_requests cr
    JOIN public.feature_specs fs ON cr.feature_spec_id = fs.id
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE cr.id = change_request_comments.change_request_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Comment authors and org admins can delete comments" ON public.change_request_comments 
FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.change_requests cr
    JOIN public.feature_specs fs ON cr.feature_spec_id = fs.id
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE cr.id = change_request_comments.change_request_id 
    AND om.user_id = auth.uid() 
    AND om.role IN ('owner', 'admin')
  )
);

-- Update related tables policies to be organization-aware
-- Success criteria
DROP POLICY IF EXISTS "Users can view all success criteria" ON public.success_criteria;
DROP POLICY IF EXISTS "Users can manage success criteria for collaborative editing" ON public.success_criteria;

CREATE POLICY "Users can view success criteria in their organizations" ON public.success_criteria 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = success_criteria.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage success criteria" ON public.success_criteria 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = success_criteria.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- Reviewers
DROP POLICY IF EXISTS "Users can view all reviewers" ON public.reviewers;
DROP POLICY IF EXISTS "Users can manage reviewers for collaborative editing" ON public.reviewers;

CREATE POLICY "Users can view reviewers in their organizations" ON public.reviewers 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = reviewers.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage reviewers" ON public.reviewers 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = reviewers.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- Target users
DROP POLICY IF EXISTS "Users can view all target users" ON public.target_users;
DROP POLICY IF EXISTS "Users can manage target users for collaborative editing" ON public.target_users;

CREATE POLICY "Users can view target users in their organizations" ON public.target_users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = target_users.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage target users" ON public.target_users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = target_users.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- User goals
DROP POLICY IF EXISTS "Users can view all user goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can manage user goals for collaborative editing" ON public.user_goals;

CREATE POLICY "Users can view user goals in their organizations" ON public.user_goals 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = user_goals.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage user goals" ON public.user_goals 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = user_goals.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- Use cases
DROP POLICY IF EXISTS "Users can view all use cases" ON public.use_cases;
DROP POLICY IF EXISTS "Users can manage use cases for collaborative editing" ON public.use_cases;

CREATE POLICY "Users can view use cases in their organizations" ON public.use_cases 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = use_cases.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage use cases" ON public.use_cases 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = use_cases.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- Core interactions
DROP POLICY IF EXISTS "Users can view all core interactions" ON public.core_interactions;
DROP POLICY IF EXISTS "Users can manage core interactions for collaborative editing" ON public.core_interactions;

CREATE POLICY "Users can view core interactions in their organizations" ON public.core_interactions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = core_interactions.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can manage core interactions" ON public.core_interactions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.feature_specs fs
    JOIN public.organization_memberships om ON fs.organization_id = om.organization_id
    WHERE fs.id = core_interactions.feature_spec_id 
    AND om.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at 
  BEFORE UPDATE ON public.organization_memberships 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION public.create_default_organization_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a personal organization for the user
  INSERT INTO public.organizations (name, slug, description)
  VALUES (
    COALESCE(NEW.full_name, NEW.email) || '''s Organization',
    'user-' || NEW.id,
    'Personal organization for ' || COALESCE(NEW.full_name, NEW.email)
  )
  RETURNING id INTO new_org_id;
  
  -- Set as default organization
  UPDATE public.profiles 
  SET default_organization_id = new_org_id 
  WHERE id = NEW.id;
  
  -- Add user as owner of the organization
  INSERT INTO public.organization_memberships (organization_id, user_id, role, joined_at)
  VALUES (new_org_id, NEW.id, 'owner', NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default organization for new users
CREATE TRIGGER on_profile_created_create_default_org
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_organization_for_user();

-- Function to generate organization slug
CREATE OR REPLACE FUNCTION public.generate_organization_slug(org_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(org_name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique organization slug
CREATE OR REPLACE FUNCTION public.ensure_unique_organization_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := public.generate_organization_slug(NEW.name);
  final_slug := base_slug;
  
  -- Check if slug exists and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure unique organization slug
CREATE TRIGGER ensure_unique_organization_slug_trigger
  BEFORE INSERT OR UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.ensure_unique_organization_slug();
