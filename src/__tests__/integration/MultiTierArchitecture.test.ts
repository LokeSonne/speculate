import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import { useOrganizations } from '../../composables/useOrganizationsQuery'
import { useFeatureSpecs } from '../../composables/useFeatureSpecsQuery'
import { useOrganizationContext } from '../../composables/useOrganizationContext'
import type { Organization, CreateOrganizationData, FeatureSpecFormData } from '../../types/feature'

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(),
      })),
      order: vi.fn(),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
}

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}))

// Mock auth composable
vi.mock('../composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: { value: true },
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

// Helper function to create a test app with Vue Query
function createTestApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const app = createApp({
    template: '<div></div>',
  })

  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    },
  })

  return { app, queryClient }
}

describe('Multi-Tier Architecture Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('should create organization and feature specs in the correct context', async () => {
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
    mockSupabase.from
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
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCreatedSpec,
            error: null,
          }),
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    // Test organization creation
    const { createOrganizationAsync } = useOrganizations()
    const orgData: CreateOrganizationData = {
      name: 'New Organization',
      description: 'A new organization',
    }

    const createdOrg = await createOrganizationAsync(orgData)
    expect(createdOrg.id).toBe('org-2')
    expect(createdOrg.name).toBe('New Organization')

    // Test setting organization context
    const { setCurrentOrganizationByObject } = useOrganizationContext()
    setCurrentOrganizationByObject(createdOrg)

    // Test feature spec creation with organization context
    const { createSpecAsync } = useFeatureSpecs('org-2')
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

    const createdSpec = await createSpecAsync(specData)
    expect(createdSpec.organizationId).toBe('org-2')
    expect(createdSpec.featureName).toBe('New Feature')
  })

  it('should filter feature specs by organization', async () => {
    const org1Specs = [
      { ...mockFeatureSpec, id: 'spec-1', organization_id: 'org-1' },
      { ...mockFeatureSpec, id: 'spec-2', organization_id: 'org-1' },
    ]

    const org2Specs = [{ ...mockFeatureSpec, id: 'spec-3', organization_id: 'org-2' }]

    // Mock fetching specs for org-1
    mockSupabase.from.mockReturnValueOnce({
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
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org2Specs,
            error: null,
          }),
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    // Test fetching specs for org-1
    const { featureSpecs: org1SpecsResult, isLoading: org1Loading } = useFeatureSpecs('org-1')

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(org1Loading.value).toBe(false)
    expect(org1SpecsResult.value).toHaveLength(2)
    expect(org1SpecsResult.value[0].organizationId).toBe('org-1')
    expect(org1SpecsResult.value[1].organizationId).toBe('org-1')

    // Test fetching specs for org-2
    const { featureSpecs: org2SpecsResult, isLoading: org2Loading } = useFeatureSpecs('org-2')

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(org2Loading.value).toBe(false)
    expect(org2SpecsResult.value).toHaveLength(1)
    expect(org2SpecsResult.value[0].organizationId).toBe('org-2')
  })

  it('should handle organization context switching', async () => {
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
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockMembershipData,
            error: null,
          }),
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    // Test organization context switching
    const { organizations, isLoading: orgsLoading } = useOrganizations()

    const { setCurrentOrganizationByObject, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    // Wait for organizations to load
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(orgsLoading.value).toBe(false)
    expect(organizations.value).toHaveLength(2)

    // Switch to first organization
    setCurrentOrganizationByObject(organizations.value[0])
    expect(currentOrganizationId.value).toBe('org-1')
    expect(currentOrganization.value?.name).toBe('Organization 1')

    // Switch to second organization
    setCurrentOrganizationByObject(organizations.value[1])
    expect(currentOrganizationId.value).toBe('org-2')
    expect(currentOrganization.value?.name).toBe('Organization 2')
  })

  it('should maintain data isolation between organizations', async () => {
    const org1Specs = [
      { ...mockFeatureSpec, id: 'spec-1', organization_id: 'org-1', feature_name: 'Org 1 Feature' },
    ]

    const org2Specs = [
      { ...mockFeatureSpec, id: 'spec-2', organization_id: 'org-2', feature_name: 'Org 2 Feature' },
    ]

    // Mock fetching specs for org-1
    mockSupabase.from.mockReturnValueOnce({
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
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: org2Specs,
            error: null,
          }),
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    // Test data isolation
    const { featureSpecs: org1SpecsResult } = useFeatureSpecs('org-1')
    const { featureSpecs: org2SpecsResult } = useFeatureSpecs('org-2')

    // Wait for queries to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Verify data isolation
    expect(org1SpecsResult.value).toHaveLength(1)
    expect(org1SpecsResult.value[0].organizationId).toBe('org-1')
    expect(org1SpecsResult.value[0].featureName).toBe('Org 1 Feature')

    expect(org2SpecsResult.value).toHaveLength(1)
    expect(org2SpecsResult.value[0].organizationId).toBe('org-2')
    expect(org2SpecsResult.value[0].featureName).toBe('Org 2 Feature')

    // Verify no cross-contamination
    expect(org1SpecsResult.value[0].id).not.toBe(org2SpecsResult.value[0].id)
    expect(org1SpecsResult.value[0].featureName).not.toBe(org2SpecsResult.value[0].featureName)
  })
})
