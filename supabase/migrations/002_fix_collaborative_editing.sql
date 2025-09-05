-- Migration: Update RLS policies for collaborative editing
-- This allows any authenticated user to update related tables for collaborative editing

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can manage success criteria for own specs" ON public.success_criteria;
DROP POLICY IF EXISTS "Users can manage reviewers for own specs" ON public.reviewers;
DROP POLICY IF EXISTS "Users can manage target users for own specs" ON public.target_users;
DROP POLICY IF EXISTS "Users can manage user goals for own specs" ON public.user_goals;
DROP POLICY IF EXISTS "Users can manage use cases for own specs" ON public.use_cases;
DROP POLICY IF EXISTS "Users can manage core interactions for own specs" ON public.core_interactions;

-- Create new collaborative policies that allow any authenticated user to manage related data
-- This enables collaborative editing while still maintaining security

-- Success Criteria: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage success criteria for collaborative editing" ON public.success_criteria FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Reviewers: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage reviewers for collaborative editing" ON public.reviewers FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Target Users: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage target users for collaborative editing" ON public.target_users FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- User Goals: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage user goals for collaborative editing" ON public.user_goals FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Use Cases: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage use cases for collaborative editing" ON public.use_cases FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Core Interactions: Allow any authenticated user to manage (for collaborative editing)
CREATE POLICY "Users can manage core interactions for collaborative editing" ON public.core_interactions FOR ALL USING (
  auth.uid() IS NOT NULL
);

-- Note: The feature_specs table still maintains ownership-based policies for the main spec
-- This ensures only the original creator can delete the entire spec, but anyone can edit the content
