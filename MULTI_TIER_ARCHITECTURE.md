# Multi-Tier Architecture Implementation

This document outlines the implementation of a multi-tier architecture for the Speculate application, where users and specifications belong to organizations.

## Overview

The data model has been extended to support a multi-tenant architecture with the following key concepts:

- **Organizations**: Top-level entities that contain users and specifications
- **Users**: Belong to one or more organizations with specific roles
- **Specifications**: Belong to a specific organization and are accessible to organization members
- **Roles**: Define permissions within organizations (owner, admin, member, viewer)

## Database Schema Changes

### New Tables

#### Organizations Table

```sql
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
```

#### Organization Memberships Table

```sql
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
  UNIQUE(organization_id, user_id)
);
```

### Modified Tables

#### Feature Specifications

- Added `organization_id` column to link specs to organizations
- Updated RLS policies to be organization-aware

#### Profiles

- Added `default_organization_id` column for user's primary organization

### Organization Roles

The system supports four role levels:

1. **Owner**: Full control over the organization
   - Can update/delete organization
   - Can manage all memberships
   - Can access all specifications

2. **Admin**: Administrative privileges
   - Can manage memberships
   - Can access all specifications
   - Cannot delete organization

3. **Member**: Standard user privileges
   - Can create/edit specifications
   - Can participate in collaborative editing
   - Cannot manage memberships

4. **Viewer**: Read-only access
   - Can view specifications
   - Cannot create or edit content

## Row Level Security (RLS) Policies

All tables now have organization-aware RLS policies that ensure:

- Users can only access data from organizations they belong to
- Feature specifications are scoped to the user's organization memberships
- Change requests and comments follow the same organization boundaries
- Collaborative editing works within organization boundaries

### Key Policy Examples

```sql
-- Users can view feature specs in their organizations
CREATE POLICY "Users can view feature specs in their organizations" ON public.feature_specs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE organization_id = feature_specs.organization_id
    AND user_id = auth.uid()
  )
);

-- Organization members can create feature specs
CREATE POLICY "Organization members can create feature specs" ON public.feature_specs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE organization_id = feature_specs.organization_id
    AND user_id = auth.uid()
  )
);
```

## TypeScript Interface Updates

### New Organization Types

```typescript
export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface OrganizationMembership {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  invitedBy?: string
  invitedAt: Date
  joinedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Updated Feature Specification Interface

```typescript
export interface FrontendFeatureSpec {
  id: string
  organizationId: string // New field
  featureName: string
  // ... rest of the fields
}
```

## New Composables

### useOrganizations

Provides comprehensive organization management functionality:

- `fetchUserOrganizations()`: Get user's organizations
- `createOrganization(data)`: Create new organization
- `updateOrganization(id, data)`: Update organization details
- `inviteUserToOrganization(data)`: Invite users to organization
- `updateMembershipRole(data)`: Change user roles
- `removeUserFromOrganization(membershipId)`: Remove users
- `hasPermission(permission)`: Check user permissions

### useOrganizationContext

Manages the current organization context:

- `setCurrentOrganization(id)`: Set active organization
- `currentOrganization`: Reactive current organization
- `currentOrganizationId`: Reactive current organization ID

## Automatic Organization Creation

When a new user signs up, the system automatically:

1. Creates a personal organization named "{User's Name}'s Organization"
2. Sets the user as the owner of this organization
3. Sets it as the user's default organization

This ensures every user has at least one organization to work with.

## Migration Strategy

The implementation includes a comprehensive migration (`004_add_organizations.sql`) that:

1. Creates new tables and types
2. Adds organization columns to existing tables
3. Updates all RLS policies to be organization-aware
4. Creates helper functions and triggers
5. Maintains backward compatibility

## TanStack Query Integration

The implementation uses TanStack Query for efficient data management and caching:

### Query Keys Structure

```typescript
// Organization query keys
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (userId?: string) => [...organizationKeys.lists(), { userId }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  memberships: (organizationId: string) =>
    [...organizationKeys.detail(organizationId), 'memberships'] as const,
  userMemberships: (userId: string) =>
    [...organizationKeys.all, 'userMemberships', userId] as const,
}

// Feature spec query keys
export const featureSpecKeys = {
  all: ['featureSpecs'] as const,
  lists: () => [...featureSpecKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...featureSpecKeys.lists(), { filters }] as const,
  listByOrganization: (organizationId: string) =>
    [...featureSpecKeys.lists(), { organizationId }] as const,
  details: () => [...featureSpecKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureSpecKeys.details(), id] as const,
}
```

### Composable Usage

```typescript
// Organizations
const { organizations, isLoading, createOrganizationAsync, updateOrganizationAsync } =
  useOrganizations()

// Organization context
const { currentOrganization, setCurrentOrganization, getOrganizationById } =
  useOrganizationContext()

// Feature specs with organization filtering
const { featureSpecs, createSpecAsync, updateSpecAsync } = useFeatureSpecs('org-123') // Filter by organization

// Individual organization details
const { organization, memberships, updateOrganizationAsync } = useOrganization('org-123')
```

### Automatic Cache Management

TanStack Query automatically handles:

- **Cache invalidation**: When creating/updating/deleting resources
- **Optimistic updates**: Immediate UI updates with rollback on error
- **Background refetching**: Keeping data fresh
- **Deduplication**: Preventing duplicate requests
- **Error handling**: Automatic retry and error states

## Usage Examples

### Creating a Feature Specification

```typescript
const { createSpecAsync } = useFeatureSpecs('org-123')
const { currentOrganizationId } = useOrganizationContext()

const formData: FeatureSpecFormData = {
  organizationId: currentOrganizationId.value!,
  featureName: 'New Feature',
  // ... other fields
}

await createSpecAsync(formData)
```

### Managing Organization Members

```typescript
const { inviteUserToOrganizationAsync, updateMembershipRoleAsync } = useOrganizations()

// Invite a user
await inviteUserToOrganizationAsync({
  organizationId: 'org-id',
  email: 'user@example.com',
  role: 'member',
})

// Update user role
await updateMembershipRoleAsync({
  membershipId: 'membership-id',
  role: 'admin',
})
```

### Organization Context Management

```typescript
const { organizations, setCurrentOrganization } = useOrganizations()

const { currentOrganization, setCurrentOrganizationByObject } = useOrganizationContext()

// Switch between organizations
setCurrentOrganizationByObject(organizations.value[0])

// Fetch specs for current organization
const { featureSpecs } = useFeatureSpecs(currentOrganization.value?.id)
```

## Benefits

1. **Multi-tenancy**: Complete data isolation between organizations
2. **Scalability**: Organizations can grow independently
3. **Security**: RLS ensures users only access their organization's data
4. **Collaboration**: Team-based workflows within organizations
5. **Flexibility**: Role-based permissions for different access levels
6. **Backward Compatibility**: Existing users get personal organizations automatically

## Next Steps

To fully implement this architecture, you may want to consider:

1. **UI Components**: Organization switcher, member management interface
2. **Invitation System**: Email invitations for new members
3. **Organization Settings**: Customizable organization preferences
4. **Audit Logging**: Track organization-level activities
5. **Billing Integration**: Organization-based subscription management
