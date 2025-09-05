-- Add field-level change tracking
CREATE TYPE field_change_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE field_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_spec_id UUID NOT NULL REFERENCES feature_specs(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL, -- e.g., 'featureName', 'userGoals.0.description', 'coreInteractions.1.actionName'
  field_type TEXT NOT NULL, -- 'string', 'array', 'object'
  old_value JSONB,
  new_value JSONB NOT NULL,
  change_description TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_email TEXT NOT NULL,
  status field_change_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX idx_field_changes_feature_spec_id ON field_changes(feature_spec_id);
CREATE INDEX idx_field_changes_field_path ON field_changes(feature_spec_id, field_path);
CREATE INDEX idx_field_changes_status ON field_changes(status);
CREATE INDEX idx_field_changes_author_id ON field_changes(author_id);

-- RLS policies
ALTER TABLE field_changes ENABLE ROW LEVEL SECURITY;

-- Anyone can read field changes for a feature spec
CREATE POLICY "Anyone can read field changes" ON field_changes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Anyone can create field changes
CREATE POLICY "Anyone can create field changes" ON field_changes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only the author or spec owner can update field changes
CREATE POLICY "Author or spec owner can update field changes" ON field_changes
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    auth.uid() IN (
      SELECT author_id FROM feature_specs WHERE id = field_changes.feature_spec_id
    )
  );

-- Only the spec owner can delete field changes
CREATE POLICY "Spec owner can delete field changes" ON field_changes
  FOR DELETE USING (
    auth.uid() IN (
      SELECT author_id FROM feature_specs WHERE id = field_changes.feature_spec_id
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_field_changes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_field_changes_updated_at
  BEFORE UPDATE ON field_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_field_changes_updated_at();
