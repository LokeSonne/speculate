import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { testComposable } from '../utils/testHelpers'
import { useOrganizations } from '../../composables/useOrganizationsQuery'
import { useFeatureSpecs } from '../../composables/useFeatureSpecsQuery'
import { useOrganizationContext } from '../../composables/useOrganizationContext'
import type { Organization, CreateOrganizationData, FeatureSpecFormData } from '../../types/feature'
import { supabase } from '../../lib/supabase'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      ),
    },
    from: vi.fn(),
  },
}))

// Mock auth composable
vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: { value: true },
    user: { value: { id: 'test-user' } },
  }),
}))

// Test data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
}

const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Test Organization',
  slug: 'test-org',
  description: 'A test organization',
  logoUrl: 'https://example.com/logo.png',
  settings: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockFeatureSpec = {
  id: 'spec-1',
  organization_id: 'org-1',
  feature_name: 'Test Feature',
  author: 'Test Author',
  date: '2024-01-01',
  status: 'Draft',
  feature_summary: 'A test feature',
  success_criteria: [],
  reviewers: [],
  target_users: [],
  user_goals: [],
  use_cases: [],
  core_interactions: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('Multi-Tier Architecture Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it.skip('should create organization and feature specs in the correct context', async () => {
    // Mock organization creation
    const mockCreatedOrg = {
      id: 'org-2',
      name: 'New Organization',
      slug: 'new-organization',
      description: 'A new organization',
      logo_url: null,
      settings: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    // Mock organization membership creation
    const mockMembership = {
      id: 'membership-1',
      organization_id: 'org-2',
      user_id: 'user-1',
      role: 'owner',
      invited_by: null,
      invited_at: '2024-01-01T00:00:00Z',
      joined_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    // Mock feature spec creation
    const mockCreatedSpec = {
      ...mockFeatureSpec,
      id: 'spec-2',
      feature_name: 'New Feature',
      organization_id: 'org-2',
    }

    // Setup mocks for organization creation
    supabase.from
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreatedOrg,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          error: null,
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      })

    // Setup mocks for feature spec creation
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCreatedSpec,
            error: null,
          }),
        }),
      }),
    })

    const wrapper = testComposable(() => {
      const { createOrganizationAsync } = useOrganizations()
      const { setCurrentOrganizationByObject } = useOrganizationContext()
      const { createSpecAsync } = useFeatureSpecs('org-2')
      return { createOrganizationAsync, setCurrentOrganizationByObject, createSpecAsync }
    })

    // Test organization creation
    const orgData: CreateOrganizationData = {
      name: 'New Organization',
      description: 'A new organization',
    }

    const createdOrg = await wrapper.vm.createOrganizationAsync(orgData)
    expect(createdOrg.id).toBe('org-2')
    expect(createdOrg.name).toBe('New Organization')

    // Test setting organization context
    wrapper.vm.setCurrentOrganizationByObject(createdOrg)

    // Test feature spec creation with organization context
    const specData: FeatureSpecFormData = {
      organizationId: 'org-2',
      featureName: 'New Feature',
      author: 'Test Author',
      date: new Date('2024-01-01'),
      status: 'Draft',
      featureSummary: 'A new feature',
      reviewers: [],
      successCriteria: [],
      targetUsers: [],
      userGoals: [],
      useCases: [],
      coreInteractions: [],
      loadingStates: [],
      emptyStates: [],
      errorStates: [],
      layoutStructure: {
        desktop: { breakpoint: '>1200px', description: '' },
        tablet: { breakpoint: '768-1199px', description: '' },
        mobile: { breakpoint: '<768px', description: '' },
      },
      visualHierarchy: {
        primaryElements: [],
        secondaryElements: [],
        tertiaryElements: [],
      },
      componentSpecs: [],
      typographyContent: {
        headlines: [],
        bodyText: [],
        labels: [],
        errorMessages: [],
        successMessages: [],
        emptyStateText: [],
      },
      accessibilityRequirements: {
        keyboardNavigation: {
          tabOrder: [],
          shortcuts: [],
          focusManagement: [],
        },
        screenReaderSupport: {
          labels: [],
          announcements: [],
          structure: [],
        },
        visualAccessibility: {
          colorRequirements: [],
          focusIndicators: [],
          textScaling: [],
        },
      },
      responsiveBehavior: {
        breakpointTransitions: [],
        touchInteractions: [],
      },
      animationRequirements: [],
      edgeCases: [],
      technicalConstraints: [],
      businessRules: [],
      approvals: [],
    }

    const createdSpec = await wrapper.vm.createSpecAsync(specData)
    expect(createdSpec.organizationId).toBe('org-2')
    expect(createdSpec.featureName).toBe('New Feature')
  })

  it.skip('should filter feature specs by organization', async () => {
    const org1Specs = [
      { ...mockFeatureSpec, id: 'spec-1', organization_id: 'org-1' },
      { ...mockFeatureSpec, id: 'spec-2', organization_id: 'org-1' },
    ]

    const org2Specs = [{ ...mockFeatureSpec, id: 'spec-3', organization_id: 'org-2' }]

    // Mock fetching specs for org-1
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org1Specs,
            error: null,
          }),
        }),
      }),
    })

    // Mock fetching specs for org-2
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org2Specs,
            error: null,
          }),
        }),
      }),
    })

    // Test fetching specs for org-1
    const org1Wrapper = testComposable(() => {
      const { featureSpecs, isLoading } = useFeatureSpecs('org-1')
      return { featureSpecs, isLoading }
    })

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(org1Wrapper.vm.isLoading).toBe(false)
    expect(org1Wrapper.vm.featureSpecs).toHaveLength(2)
    expect(org1Wrapper.vm.featureSpecs[0].organizationId).toBe('org-1')
    expect(org1Wrapper.vm.featureSpecs[1].organizationId).toBe('org-1')

    // Test fetching specs for org-2
    const org2Wrapper = testComposable(() => {
      const { featureSpecs, isLoading } = useFeatureSpecs('org-2')
      return { featureSpecs, isLoading }
    })

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(org2Wrapper.vm.isLoading).toBe(false)
    expect(org2Wrapper.vm.featureSpecs).toHaveLength(1)
    expect(org2Wrapper.vm.featureSpecs[0].organizationId).toBe('org-2')
  })

  it.skip('should handle organization context switching', async () => {
    const mockOrgs = [
      {
        id: 'org-1',
        name: 'Organization 1',
        slug: 'org-1',
        description: 'First organization',
        logo_url: null,
        settings: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'org-2',
        name: 'Organization 2',
        slug: 'org-2',
        description: 'Second organization',
        logo_url: null,
        settings: {},
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ]

    const mockMembershipData = mockOrgs.map((org) => ({
      id: `membership-${org.id}`,
      organization_id: org.id,
      user_id: 'user-1',
      role: 'owner',
      organization: org,
    }))

    // Mock fetching user organizations
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockMembershipData,
            error: null,
          }),
        }),
      }),
    })

    // Test organization context switching
    const contextWrapper = testComposable(() => {
      const { organizations, isLoading: orgsLoading } = useOrganizations()
      const { setCurrentOrganizationByObject, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return {
        organizations,
        orgsLoading,
        setCurrentOrganizationByObject,
        currentOrganizationId,
        currentOrganization,
      }
    })

    // Wait for organizations to load
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(contextWrapper.vm.orgsLoading).toBe(false)
    expect(contextWrapper.vm.organizations).toHaveLength(2)

    // Switch to first organization
    contextWrapper.vm.setCurrentOrganizationByObject(contextWrapper.vm.organizations[0])
    expect(contextWrapper.vm.currentOrganizationId).toBe('org-1')
    expect(contextWrapper.vm.currentOrganization?.name).toBe('Organization 1')

    // Switch to second organization
    contextWrapper.vm.setCurrentOrganizationByObject(contextWrapper.vm.organizations[1])
    expect(contextWrapper.vm.currentOrganizationId).toBe('org-2')
    expect(contextWrapper.vm.currentOrganization?.name).toBe('Organization 2')
  })

  it.skip('should maintain data isolation between organizations', async () => {
    const org1Specs = [
      { ...mockFeatureSpec, id: 'spec-1', organization_id: 'org-1', feature_name: 'Org 1 Feature' },
    ]

    const org2Specs = [
      { ...mockFeatureSpec, id: 'spec-2', organization_id: 'org-2', feature_name: 'Org 2 Feature' },
    ]

    // Mock fetching specs for org-1
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org1Specs,
            error: null,
          }),
        }),
      }),
    })

    // Mock fetching specs for org-2
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org2Specs,
            error: null,
          }),
        }),
      }),
    })

    // Test data isolation
    const isolationWrapper = testComposable(() => {
      const { featureSpecs: org1Specs } = useFeatureSpecs('org-1')
      const { featureSpecs: org2Specs } = useFeatureSpecs('org-2')
      return { org1Specs, org2Specs }
    })

    // Wait for queries to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Verify data isolation
    expect(isolationWrapper.vm.org1Specs).toHaveLength(1)
    expect(isolationWrapper.vm.org1Specs[0].organizationId).toBe('org-1')
    expect(isolationWrapper.vm.org1Specs[0].featureName).toBe('Org 1 Feature')

    expect(isolationWrapper.vm.org2Specs).toHaveLength(1)
    expect(isolationWrapper.vm.org2Specs[0].organizationId).toBe('org-2')
    expect(isolationWrapper.vm.org2Specs[0].featureName).toBe('Org 2 Feature')

    // Verify no cross-contamination
    expect(isolationWrapper.vm.org1Specs[0].id).not.toBe(isolationWrapper.vm.org2Specs[0].id)
    expect(isolationWrapper.vm.org1Specs[0].featureName).not.toBe(
      isolationWrapper.vm.org2Specs[0].featureName,
    )
  })
})
