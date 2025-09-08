import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
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
} from '@/types/feature'

export function useOrganizations() {
  const organizations = ref<Organization[]>([])
  const currentOrganization = ref<Organization | null>(null)
  const memberships = ref<OrganizationMembership[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get user's organizations
  const fetchUserOrganizations = async () => {
    try {
      loading.value = true
      error.value = null

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('organization_memberships')
        .select(
          `
          *,
          organization:organizations(*)
        `,
        )
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      organizations.value = data?.map((membership) => membership.organization) || []
      memberships.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch organizations'
      console.error('Error fetching organizations:', err)
    } finally {
      loading.value = false
    }
  }

  // Get organization details with members
  const fetchOrganizationDetails = async (organizationId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError

      return data as OrganizationWithMembers
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch organization details'
      console.error('Error fetching organization details:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new organization
  const createOrganization = async (data: CreateOrganizationData) => {
    try {
      loading.value = true
      error.value = null

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

      organizations.value.push(orgData)
      return orgData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create organization'
      console.error('Error creating organization:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update organization
  const updateOrganization = async (organizationId: string, data: UpdateOrganizationData) => {
    try {
      loading.value = true
      error.value = null

      const { data: orgData, error: updateError } = await supabase
        .from('organizations')
        .update({
          name: data.name,
          description: data.description,
          logo_url: data.logoUrl,
          settings: data.settings,
        })
        .eq('id', organizationId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = organizations.value.findIndex((org) => org.id === organizationId)
      if (index !== -1) {
        organizations.value[index] = orgData
      }

      if (currentOrganization.value?.id === organizationId) {
        currentOrganization.value = orgData
      }

      return orgData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update organization'
      console.error('Error updating organization:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Invite user to organization
  const inviteUserToOrganization = async (data: InviteUserToOrganizationData) => {
    try {
      loading.value = true
      error.value = null

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

      return membershipData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to invite user'
      console.error('Error inviting user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update membership role
  const updateMembershipRole = async (data: UpdateMembershipRoleData) => {
    try {
      loading.value = true
      error.value = null

      const { data: membershipData, error: updateError } = await supabase
        .from('organization_memberships')
        .update({ role: data.role })
        .eq('id', data.membershipId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = memberships.value.findIndex((m) => m.id === data.membershipId)
      if (index !== -1) {
        memberships.value[index] = membershipData
      }

      return membershipData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update membership role'
      console.error('Error updating membership role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Remove user from organization
  const removeUserFromOrganization = async (membershipId: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('organization_memberships')
        .delete()
        .eq('id', membershipId)

      if (deleteError) throw deleteError

      // Update local state
      memberships.value = memberships.value.filter((m) => m.id !== membershipId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove user'
      console.error('Error removing user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set current organization
  const setCurrentOrganization = (organization: Organization) => {
    currentOrganization.value = organization
  }

  // Get user's role in current organization
  const getUserRole = computed(() => {
    if (!currentOrganization.value) return null
    const membership = memberships.value.find(
      (m) => m.organizationId === currentOrganization.value?.id,
    )
    return membership?.role || null
  })

  // Check if user has permission
  const hasPermission = (permission: 'view' | 'edit' | 'admin' | 'owner') => {
    const role = getUserRole.value
    if (!role) return false

    switch (permission) {
      case 'view':
        return ['owner', 'admin', 'member', 'viewer'].includes(role)
      case 'edit':
        return ['owner', 'admin', 'member'].includes(role)
      case 'admin':
        return ['owner', 'admin'].includes(role)
      case 'owner':
        return role === 'owner'
      default:
        return false
    }
  }

  return {
    organizations: computed(() => organizations.value),
    currentOrganization: computed(() => currentOrganization.value),
    memberships: computed(() => memberships.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getUserRole,
    hasPermission,
    fetchUserOrganizations,
    fetchOrganizationDetails,
    createOrganization,
    updateOrganization,
    inviteUserToOrganization,
    updateMembershipRole,
    removeUserFromOrganization,
    setCurrentOrganization,
  }
}
