import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import { useFeatureSpecs, useFeatureSpec } from '../../composables/useFeatureSpecsQuery'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../../types/feature'

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

const mockFeatureSpec: FrontendFeatureSpec = {
  id: 'spec-1',
  organizationId: 'org-1',
  featureName: 'Test Feature',
  author: 'Test Author',
  date: new Date('2024-01-01'),
  status: 'Draft',
  reviewers: [],
  featureSummary: 'A test feature',
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  version: '1.0.0',
}

const mockDbFeatureSpec = {
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

describe('useFeatureSpecs with organization context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('should fetch feature specs for a specific organization', async () => {
    const mockData = [mockDbFeatureSpec]

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
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

    const { featureSpecs, isLoading, error } = useFeatureSpecs('org-1')

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(featureSpecs.value).toHaveLength(1)
    expect(featureSpecs.value[0].organizationId).toBe('org-1')
    expect(featureSpecs.value[0].featureName).toBe('Test Feature')
  })

  it('should fetch all feature specs when no organization is specified', async () => {
    const mockData = [mockDbFeatureSpec]

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { featureSpecs, isLoading, error } = useFeatureSpecs()

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(featureSpecs.value).toHaveLength(1)
    expect(featureSpecs.value[0].featureName).toBe('Test Feature')
  })

  it('should create feature spec with organization context', async () => {
    const formData: FeatureSpecFormData = {
      organizationId: 'org-1',
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

    const mockCreatedSpec = {
      ...mockDbFeatureSpec,
      id: 'spec-2',
      feature_name: 'New Feature',
      organization_id: 'org-1',
    }

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

    const { createSpecAsync, isCreating, createError } = useFeatureSpecs('org-1')

    const result = await createSpecAsync(formData)

    expect(isCreating.value).toBe(false)
    expect(createError.value).toBe(null)
    expect(result.organizationId).toBe('org-1')
    expect(result.featureName).toBe('New Feature')
  })

  it('should handle create feature spec error', async () => {
    const formData: FeatureSpecFormData = {
      organizationId: 'org-1',
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

    const createError = new Error('Failed to create feature spec')

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: createError,
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

    const { createSpecAsync, isCreating, createError: error } = useFeatureSpecs('org-1')

    await expect(createSpecAsync(formData)).rejects.toThrow('Failed to create feature spec')
    expect(isCreating.value).toBe(false)
    expect(error.value).toBe(createError)
  })

  it('should update feature spec successfully', async () => {
    const updateData = {
      id: 'spec-1',
      data: {
        featureName: 'Updated Feature',
        featureSummary: 'Updated summary',
      },
    }

    const mockUpdatedSpec = {
      ...mockDbFeatureSpec,
      feature_name: 'Updated Feature',
      feature_summary: 'Updated summary',
    }

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUpdatedSpec,
              error: null,
            }),
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

    const { updateSpecAsync, isUpdating, updateError } = useFeatureSpecs('org-1')

    const result = await updateSpecAsync(updateData)

    expect(isUpdating.value).toBe(false)
    expect(updateError.value).toBe(null)
    expect(result.featureName).toBe('Updated Feature')
  })

  it('should delete feature spec successfully', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { deleteSpecAsync, isDeleting, deleteError } = useFeatureSpecs('org-1')

    await deleteSpecAsync('spec-1')

    expect(isDeleting.value).toBe(false)
    expect(deleteError.value).toBe(null)
  })

  it('should compute specs by status correctly', async () => {
    const mockData = [
      { ...mockDbFeatureSpec, status: 'Draft' },
      { ...mockDbFeatureSpec, id: 'spec-2', status: 'In Review' },
      { ...mockDbFeatureSpec, id: 'spec-3', status: 'Approved' },
    ]

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      }),
    })

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { specsByStatus, isLoading } = useFeatureSpecs()

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(isLoading.value).toBe(false)
    expect(specsByStatus.value['Draft']).toHaveLength(1)
    expect(specsByStatus.value['In Review']).toHaveLength(1)
    expect(specsByStatus.value['Approved']).toHaveLength(1)
  })
})

describe('useFeatureSpec', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it('should fetch individual feature spec successfully', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockDbFeatureSpec,
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

    const { featureSpec, isLoading, error } = useFeatureSpec('spec-1')

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
    expect(featureSpec.value?.organizationId).toBe('org-1')
    expect(featureSpec.value?.featureName).toBe('Test Feature')
  })

  it('should handle fetch error for individual feature spec', async () => {
    const fetchError = new Error('Failed to fetch feature spec')

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: fetchError,
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

    const { featureSpec, isLoading, error } = useFeatureSpec('spec-1')

    // Wait for the query to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(fetchError)
    expect(featureSpec.value).toBeUndefined()
  })
})
