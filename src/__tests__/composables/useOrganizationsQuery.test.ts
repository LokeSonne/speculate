import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { QueryClient } from '@tanstack/vue-query'
import {
  testComposable,
  waitForQueryResolve,
  waitFor,
  createMockSupabase,
} from '../utils/testHelpers'
import {
  useOrganizations,
  useOrganization,
  useOrganizationMemberships,
} from '../../composables/useOrganizationsQuery'
import type {
  Organization,
  OrganizationMembership,
  CreateOrganizationData,
} from '../../types/feature'
import { supabase } from '../../lib/supabase'

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: createMockSupabase(),
}))

// Mock the useAuth composable
vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: { value: true },
    user: { value: { id: 'test-user' } },
  }),
}))

describe('useOrganizationsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock implementation
    supabase.from.mockImplementation(() => ({}))
  })

  describe('useOrganizations', () => {
    it('should fetch user organizations successfully', async () => {
      const mockOrganization = {
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        description: 'A test organization',
        logoUrl: null,
        settings: {},
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      }

      const mockDbData = [
        {
          id: 'membership-1',
          organization_id: 'org-1',
          user_id: 'test-user',
          role: 'owner',
          organization: {
            id: 'org-1',
            name: 'Test Organization',
            slug: 'test-org',
            description: 'A test organization',
            logo_url: null,
            settings: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ]

      supabase.from.mockImplementation((table) => {
        if (table === 'organization_memberships') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: mockDbData,
                error: null,
              }),
            }),
          }
        }
        return {}
      })

      const wrapper = testComposable(() => {
        const { organizations, isLoading, error } = useOrganizations()
        return { organizations, isLoading, error }
      })

      // Wait for the query to finish loading
      await waitFor(() => !wrapper.vm.isLoading)

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.error).toBe(null)
      expect(wrapper.vm.organizations).toEqual([mockOrganization])
    })

    it.skip('should handle fetch error', async () => {
      const fetchError = new Error('Failed to fetch organizations')

      // Clear the query cache to ensure fresh execution
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0 },
          mutations: { retry: false },
        },
      })

      // Set up the error mock
      supabase.from.mockImplementation((table) => {
        if (table === 'organization_memberships') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: fetchError,
              }),
            }),
          }
        }
        return {}
      })

      const wrapper = testComposable(() => {
        const { organizations, isLoading, error } = useOrganizations()
        return { organizations, isLoading, error }
      })

      // Wait for all promises to resolve
      await flushPromises()

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.error).toBe(fetchError)
      expect(wrapper.vm.organizations).toBeUndefined()
    })

    it('should create organization successfully', async () => {
      const createData: CreateOrganizationData = {
        name: 'New Organization',
        description: 'A new organization',
      }

      const createdOrg = {
        id: 'org-2',
        name: createData.name,
        slug: 'new-organization',
        description: createData.description,
        logo_url: null,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      // Mock all the table operations needed for creating an organization
      supabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: createdOrg,
                  error: null,
                }),
              }),
            }),
          }
        } else if (table === 'organization_memberships') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }
        } else if (table === 'profiles') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const wrapper = testComposable(() => {
        const { createOrganizationAsync, isCreating, createError } = useOrganizations()
        return { createOrganizationAsync, isCreating, createError }
      })

      const result = await wrapper.vm.createOrganizationAsync(createData)

      expect(wrapper.vm.isCreating).toBe(false)
      expect(wrapper.vm.createError).toBe(null)
      expect(result).toEqual({
        id: 'org-2',
        name: 'New Organization',
        slug: 'new-organization',
        description: 'A new organization',
        logoUrl: null,
        settings: {},
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      })
    })

    it('should handle create organization error', async () => {
      const createData: CreateOrganizationData = {
        name: 'New Organization',
        description: 'A new organization',
      }

      const createError = new Error('Failed to create organization')

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: createError,
            }),
          }),
        }),
      })

      const wrapper = testComposable(() => {
        const { createOrganizationAsync, isCreating, createError } = useOrganizations()
        return { createOrganizationAsync, isCreating, createError }
      })

      await expect(wrapper.vm.createOrganizationAsync(createData)).rejects.toThrow(
        'Failed to create organization',
      )
      expect(wrapper.vm.isCreating).toBe(false)
      expect(wrapper.vm.createError).toBe(createError)
    })
  })

  describe('useOrganization', () => {
    it('should fetch organization details successfully', async () => {
      const mockOrgWithMembers = {
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        description: 'A test organization',
        logo_url: null,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        members: [],
        member_count: 0,
      }

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOrgWithMembers,
              error: null,
            }),
          }),
        }),
      })

      const wrapper = testComposable(() => {
        const { organization, isLoading, error } = useOrganization('org-1')
        return { organization, isLoading, error }
      })

      // Wait for the query to finish loading
      await waitFor(() => !wrapper.vm.isLoading)

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.error).toBe(null)
      expect(wrapper.vm.organization).toEqual({
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        description: 'A test organization',
        logoUrl: null,
        settings: {},
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        members: [],
        memberCount: 0,
      })
    })

    it('should update organization successfully', async () => {
      const updateData = {
        name: 'Updated Organization',
        description: 'Updated description',
      }

      const updatedOrg = {
        id: 'org-1',
        name: updateData.name,
        slug: 'test-org',
        description: updateData.description,
        logo_url: null,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      supabase.from.mockImplementation((table) => {
        if (table === 'organizations') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: updatedOrg,
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      })

      const wrapper = testComposable(() => {
        const { updateOrganizationAsync, isUpdating, updateError } = useOrganization('org-1')
        return { updateOrganizationAsync, isUpdating, updateError }
      })

      const result = await wrapper.vm.updateOrganizationAsync(updateData)

      expect(wrapper.vm.isUpdating).toBe(false)
      expect(wrapper.vm.updateError).toBe(null)
      expect(result).toEqual({
        id: 'org-1',
        name: 'Updated Organization',
        slug: 'test-org',
        description: 'Updated description',
        logoUrl: null,
        settings: {},
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      })
    })
  })

  describe('useOrganizationMemberships', () => {
    it('should fetch organization memberships successfully', async () => {
      const mockMemberships = [
        {
          id: 'membership-1',
          organization_id: 'org-1',
          user_id: 'user-1',
          role: 'admin',
          invited_by: null,
          invited_at: null,
          joined_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            email: 'user@example.com',
            full_name: 'Test User',
            avatar_url: null,
            role: 'user',
            default_organization_id: 'org-1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      ]

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockMemberships,
              error: null,
            }),
          }),
        }),
      })

      const wrapper = testComposable(() => {
        const { memberships, isLoading, error } = useOrganizationMemberships('org-1')
        return { memberships, isLoading, error }
      })

      // Wait for the query to finish loading
      await waitFor(() => !wrapper.vm.isLoading)

      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.error).toBe(null)
      // The composable transforms snake_case to camelCase
      expect(wrapper.vm.memberships).toEqual([
        {
          id: 'membership-1',
          organizationId: 'org-1',
          userId: 'user-1',
          role: 'admin',
          invitedBy: null,
          invitedAt: undefined,
          joinedAt: new Date('2024-01-01T00:00:00Z'),
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          user: {
            id: 'user-1',
            email: 'user@example.com',
            fullName: 'Test User',
            avatarUrl: null,
            role: 'user',
            defaultOrganizationId: 'org-1',
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-01T00:00:00Z'),
          },
        },
      ])
    })

    it('should update membership role successfully', async () => {
      const updateData = {
        membershipId: 'membership-1',
        role: 'member' as const,
      }

      const updatedMembership = {
        id: 'membership-1',
        organization_id: 'org-1',
        user_id: 'user-1',
        role: 'member',
        invited_by: null,
        invited_at: null,
        joined_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: updatedMembership,
                error: null,
              }),
            }),
          }),
        }),
      })

      const wrapper = testComposable(() => {
        const { updateMembershipRoleAsync, isUpdatingRole, updateRoleError } =
          useOrganizationMemberships('org-1')
        return { updateMembershipRoleAsync, isUpdatingRole, updateRoleError }
      })

      const result = await wrapper.vm.updateMembershipRoleAsync(updateData)

      expect(wrapper.vm.isUpdatingRole).toBe(false)
      expect(wrapper.vm.updateRoleError).toBe(null)
      // The composable transforms snake_case to camelCase
      expect(result).toEqual({
        id: 'membership-1',
        organizationId: 'org-1',
        userId: 'user-1',
        role: 'member',
        invitedBy: null,
        invitedAt: undefined,
        joinedAt: new Date('2024-01-01T00:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      })
    })

    it('should remove user from organization successfully', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      const wrapper = testComposable(() => {
        const { removeUserFromOrganizationAsync, isRemoving, removeError } =
          useOrganizationMemberships('org-1')
        return { removeUserFromOrganizationAsync, isRemoving, removeError }
      })

      await wrapper.vm.removeUserFromOrganizationAsync('membership-1')

      expect(wrapper.vm.isRemoving).toBe(false)
      expect(wrapper.vm.removeError).toBe(null)
    })
  })
})
