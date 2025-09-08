import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type {
  Organization,
  OrganizationMembership,
  OrganizationRole,
  CreateOrganizationData,
  UpdateOrganizationData,
  InviteUserToOrganizationData,
  UpdateMembershipRoleData,
  OrganizationWithMembers,
  UserWithOrganizations,
} from '../types/feature'

// Query keys for consistent cache management
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

// Transform database data to frontend format
const transformDbToOrganization = (dbData: any): Organization => {
  return {
    id: dbData.id,
    name: dbData.name,
    slug: dbData.slug,
    description: dbData.description,
    logoUrl: dbData.logo_url,
    settings: dbData.settings || {},
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  }
}

const transformDbToMembership = (dbData: any): OrganizationMembership => {
  return {
    id: dbData.id,
    organizationId: dbData.organization_id,
    userId: dbData.user_id,
    role: dbData.role,
    invitedBy: dbData.invited_by,
    invitedAt: dbData.invited_at ? new Date(dbData.invited_at) : null,
    joinedAt: dbData.joined_at ? new Date(dbData.joined_at) : undefined,
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  }
}

const transformDbToOrganizationWithMembers = (dbData: any): OrganizationWithMembers => {
  const organization = transformDbToOrganization(dbData)
  const members =
    dbData.members?.map((member: any) => ({
      ...transformDbToMembership(member),
      user: {
        id: member.user.id,
        email: member.user.email,
        fullName: member.user.full_name,
        avatarUrl: member.user.avatar_url,
        role: member.user.role,
        defaultOrganizationId: member.user.default_organization_id,
        createdAt: new Date(member.user.created_at),
        updatedAt: new Date(member.user.updated_at),
      },
    })) || []

  return {
    ...organization,
    members,
    memberCount: members.length,
  }
}

// API functions
const fetchUserOrganizations = async (): Promise<Organization[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      *,
      organization:organizations(*)
    `,
    )
    .eq('user_id', user.id)

  if (error) throw error

  return data?.map((membership) => transformDbToOrganization(membership.organization)) || []
}

const fetchOrganizationDetails = async (
  organizationId: string,
): Promise<OrganizationWithMembers> => {
  const { data, error } = await supabase
    .from('organizations')
    .select(
      `
      *,
      members:organization_memberships(
        *,
        user:profiles(*)
      )
    `,
    )
    .eq('id', organizationId)
    .single()

  if (error) throw error
  return transformDbToOrganizationWithMembers(data)
}

const createOrganization = async (data: CreateOrganizationData): Promise<Organization> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: orgData, error: createError } = await supabase
    .from('organizations')
    .insert({
      name: data.name,
      description: data.description,
      logo_url: data.logoUrl,
      settings: data.settings || {},
    })
    .select()
    .single()

  if (createError) throw createError

  // Add user as owner
  const { error: membershipError } = await supabase.from('organization_memberships').insert({
    organization_id: orgData.id,
    user_id: user.id,
    role: 'owner',
    joined_at: new Date().toISOString(),
  })

  if (membershipError) throw membershipError

  // Update user's default organization if they don't have one
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ default_organization_id: orgData.id })
    .eq('id', user.id)
    .is('default_organization_id', null)

  if (updateError) throw updateError

  return transformDbToOrganization(orgData)
}

const updateOrganization = async ({
  id,
  data,
}: {
  id: string
  data: UpdateOrganizationData
}): Promise<Organization> => {
  const { data: orgData, error: updateError } = await supabase
    .from('organizations')
    .update({
      name: data.name,
      description: data.description,
      logo_url: data.logoUrl,
      settings: data.settings,
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw updateError
  return transformDbToOrganization(orgData)
}

const inviteUserToOrganization = async (
  data: InviteUserToOrganizationData,
): Promise<OrganizationMembership> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .single()

  if (!existingUser) {
    throw new Error('User with this email does not exist')
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('organization_id', data.organizationId)
    .eq('user_id', existingUser.id)
    .single()

  if (existingMembership) {
    throw new Error('User is already a member of this organization')
  }

  const { data: membershipData, error: inviteError } = await supabase
    .from('organization_memberships')
    .insert({
      organization_id: data.organizationId,
      user_id: existingUser.id,
      role: data.role,
      invited_by: user.id,
    })
    .select()
    .single()

  if (inviteError) throw inviteError
  return transformDbToMembership(membershipData)
}

const updateMembershipRole = async (
  data: UpdateMembershipRoleData,
): Promise<OrganizationMembership> => {
  const { data: membershipData, error: updateError } = await supabase
    .from('organization_memberships')
    .update({ role: data.role })
    .eq('id', data.membershipId)
    .select()
    .single()

  if (updateError) throw updateError
  return transformDbToMembership(membershipData)
}

const removeUserFromOrganization = async (membershipId: string): Promise<void> => {
  const { error: deleteError } = await supabase
    .from('organization_memberships')
    .delete()
    .eq('id', membershipId)

  if (deleteError) throw deleteError
}

// Composable for user's organizations
export function useOrganizations() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query for fetching user's organizations
  const {
    data: organizations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: organizationKeys.list(),
    queryFn: fetchUserOrganizations,
    enabled: computed(() => isAuthenticated.value),
  })

  // Mutation for creating a new organization
  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })

  // Mutation for updating an organization
  const updateMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.setQueryData(organizationKeys.detail(data.id), data)
    },
  })

  // Mutation for inviting users
  const inviteMutation = useMutation({
    mutationFn: inviteUserToOrganization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(data.organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.memberships(data.organizationId) })
    },
  })

  // Mutation for updating membership roles
  const updateRoleMutation = useMutation({
    mutationFn: updateMembershipRole,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(data.organizationId) })
      queryClient.invalidateQueries({ queryKey: organizationKeys.memberships(data.organizationId) })
    },
  })

  // Mutation for removing users
  const removeMutation = useMutation({
    mutationFn: removeUserFromOrganization,
    onSuccess: (_, membershipId) => {
      // We need to find which organization this membership belonged to
      // For now, invalidate all organization details
      queryClient.invalidateQueries({ queryKey: organizationKeys.details() })
    },
  })

  return {
    // Data
    organizations,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isInviting: inviteMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isRemoving: removeMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    inviteError: inviteMutation.error,
    updateRoleError: updateRoleMutation.error,
    removeError: removeMutation.error,

    // Actions
    refetch,
    createOrganization: createMutation.mutate,
    updateOrganization: updateMutation.mutate,
    inviteUserToOrganization: inviteMutation.mutate,
    updateMembershipRole: updateRoleMutation.mutate,
    removeUserFromOrganization: removeMutation.mutate,

    // Async actions
    createOrganizationAsync: createMutation.mutateAsync,
    updateOrganizationAsync: updateMutation.mutateAsync,
    inviteUserToOrganizationAsync: inviteMutation.mutateAsync,
    updateMembershipRoleAsync: updateRoleMutation.mutateAsync,
    removeUserFromOrganizationAsync: removeMutation.mutateAsync,
  }
}

// Composable for individual organization
export function useOrganization(id: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: organization,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => fetchOrganizationDetails(id),
    enabled: computed(() => isAuthenticated.value && !!id),
  })

  // Mutation for updating this specific organization
  const updateMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKeys.detail(id), data)
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
    },
  })

  return {
    organization,
    isLoading,
    error,
    refetch,
    updateOrganization: updateMutation.mutate,
    updateOrganizationAsync: (data: UpdateOrganizationData) =>
      updateMutation.mutateAsync({ id, data }),
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  }
}

// Composable for organization memberships
export function useOrganizationMemberships(organizationId: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: memberships,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: organizationKeys.memberships(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_memberships')
        .select(
          `
          *,
          user:profiles(*)
        `,
        )
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (
        data?.map((membership) => ({
          ...transformDbToMembership(membership),
          user: {
            id: membership.user.id,
            email: membership.user.email,
            fullName: membership.user.full_name,
            avatarUrl: membership.user.avatar_url,
            role: membership.user.role,
            defaultOrganizationId: membership.user.default_organization_id,
            createdAt: new Date(membership.user.created_at),
            updatedAt: new Date(membership.user.updated_at),
          },
        })) || []
      )
    },
    enabled: computed(() => isAuthenticated.value && !!organizationId),
  })

  // Mutation for updating membership roles
  const updateRoleMutation = useMutation({
    mutationFn: updateMembershipRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.memberships(organizationId) })
    },
  })

  // Mutation for removing users
  const removeMutation = useMutation({
    mutationFn: removeUserFromOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.memberships(organizationId) })
    },
  })

  return {
    memberships,
    isLoading,
    error,
    refetch,
    updateMembershipRole: updateRoleMutation.mutate,
    removeUserFromOrganization: removeMutation.mutate,
    updateMembershipRoleAsync: updateRoleMutation.mutateAsync,
    removeUserFromOrganizationAsync: removeMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
    isRemoving: removeMutation.isPending,
    updateRoleError: updateRoleMutation.error,
    removeError: removeMutation.error,
  }
}
