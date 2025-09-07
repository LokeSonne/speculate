import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import OverviewSection from '../../components/forms/sections/OverviewSection.vue'
import UserRequirementsSection from '../../components/forms/sections/UserRequirementsSection.vue'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'
import type { FieldChange, FrontendFeatureSpec } from '../../types/feature'
import { queryClient } from '../setup'

// Mock the composables
vi.mock('../../composables/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../composables/useFieldChangesQuery', () => ({
  useFieldChanges: vi.fn(),
}))

// Get the mocked functions after imports
let mockUseAuth: any
let mockUseFieldChanges: any
const mockGetFieldChanges = vi.fn()
const mockUpdateFieldChangeStatus = vi.fn()

function mountWithQueryClient(component: any, options: any = {}) {
  const app = createApp(component)
  app.use(VueQueryPlugin, { queryClient })
  return mount(component, {
    global: {
      plugins: [app],
      provide: {
        VUE_QUERY_CLIENT: queryClient,
      },
    },
    ...options,
  })
}

describe('Edit Suggestions Display Integration', () => {
  const mockUser = {
    id: 'user-1',
    email: 'owner@example.com',
    user_metadata: { full_name: 'Owner User' },
  }

  const mockFieldChanges: FieldChange[] = [
    {
      id: 'fc-1',
      featureSpecId: 'spec-1',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'Original Feature Name',
      newValue: 'Suggested Feature Name',
      changeDescription: 'Updated feature name to be more descriptive',
      authorId: 'user-2',
      authorEmail: 'reviewer@example.com',
      status: 'pending',
      createdAt: '2024-01-17T10:30:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
    },
    {
      id: 'fc-2',
      featureSpecId: 'spec-1',
      fieldPath: 'userGoals.0.description',
      fieldType: 'string',
      oldValue: 'Original goal',
      newValue: 'Updated goal description',
      changeDescription: 'Updated user goal description',
      authorId: 'user-2',
      authorEmail: 'reviewer@example.com',
      status: 'pending',
      createdAt: '2024-01-17T10:30:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
    },
  ]

  const mockFeatureSpec: FrontendFeatureSpec = {
    id: 'spec-1', // This is the key - the spec has an ID
    featureName: 'Original Feature Name',
    author: 'owner@example.com',
    date: new Date('2024-01-17'),
    status: 'Draft',
    featureSummary: 'Original summary',
    userGoals: [{ id: 'goal-1', description: 'Original goal' }],
    useCases: [],
    coreInteractions: [],
    successCriteria: [],
    reviewers: [],
    approvals: [],
    targetUsers: [],
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
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    version: '1.0.0',
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // Initialize mocked functions
    const useAuthModule = await import('../../composables/useAuth')
    const useFieldChangesModule = await import('../../composables/useFieldChangesQuery')

    mockUseAuth = vi.mocked(useAuthModule.useAuth)
    mockUseFieldChanges = vi.mocked(useFieldChangesModule.useFieldChanges)

    // Mock authentication - user is authenticated
    mockUseAuth.mockReturnValue({
      user: ref(mockUser),
      isAuthenticated: ref(true),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    // Mock field changes composable
    mockGetFieldChanges.mockImplementation((fieldPath: string) => {
      return computed(() =>
        mockFieldChanges.filter((change) => change.fieldPath.startsWith(fieldPath)),
      )
    })

    mockUseFieldChanges.mockReturnValue({
      isLoading: ref(false),
      getFieldChanges: mockGetFieldChanges,
      updateFieldChangeStatus: mockUpdateFieldChangeStatus,
    })

    // Mock field change functions
    mockUpdateFieldChangeStatus.mockResolvedValue({})
  })

  describe('Real-world Edit Mode Scenario', () => {
    it('should display FieldChangeHistory components when editing with valid spec ID', () => {
      const wrapper = mountWithQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockFeatureSpec, // This has id: 'spec-1'
          isEditing: true,
        },
      })

      // Check that the form is in edit mode
      expect(wrapper.props('isEditing')).toBe(true)
      expect(wrapper.props('initialData').id).toBe('spec-1')

      // Check OverviewSection has FieldChangeHistory components
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBe('spec-1')

      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      expect(overviewFieldChangeHistories.length).toBeGreaterThan(0)

      // Check UserRequirementsSection has FieldChangeHistory components
      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)
      expect(userRequirementsSection.exists()).toBe(true)
      expect(userRequirementsSection.props('featureSpecId')).toBe('spec-1')

      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)
      expect(userReqFieldChangeHistories.length).toBeGreaterThan(0)

      // Verify that FieldChangeHistory components are actually rendered (not just exist in the component tree)
      overviewFieldChangeHistories.forEach((fch) => {
        expect(fch.exists()).toBe(true)
        expect(fch.isVisible()).toBe(true)
      })

      userReqFieldChangeHistories.forEach((fch) => {
        expect(fch.exists()).toBe(true)
        expect(fch.isVisible()).toBe(true)
      })
    })

    it('should NOT display FieldChangeHistory components when spec ID is missing', () => {
      const specWithoutId = { ...mockFeatureSpec }
      delete specWithoutId.id // Remove the ID

      const wrapper = mountWithQueryClient(FeatureSpecForm, {
        props: {
          initialData: specWithoutId,
          isEditing: true,
        },
      })

      // Check that the form is in edit mode but has no ID
      expect(wrapper.props('isEditing')).toBe(true)
      expect(wrapper.props('initialData').id).toBeUndefined()

      // Check OverviewSection does NOT have FieldChangeHistory components
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBeUndefined()

      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      expect(overviewFieldChangeHistories).toHaveLength(0)

      // Check UserRequirementsSection does NOT have FieldChangeHistory components
      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)
      expect(userRequirementsSection.exists()).toBe(true)
      expect(userRequirementsSection.props('featureSpecId')).toBeUndefined()

      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)
      expect(userReqFieldChangeHistories).toHaveLength(0)
    })

    it('should NOT display FieldChangeHistory components when not in edit mode', () => {
      const wrapper = mountWithQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockFeatureSpec, // This has id: 'spec-1'
          isEditing: false, // Not in edit mode
        },
      })

      // Check that the form is NOT in edit mode
      expect(wrapper.props('isEditing')).toBe(false)

      // Check OverviewSection does NOT have FieldChangeHistory components
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBe('spec-1')

      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      expect(overviewFieldChangeHistories).toHaveLength(0)

      // Check UserRequirementsSection does NOT have FieldChangeHistory components
      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)
      expect(userRequirementsSection.exists()).toBe(true)
      expect(userRequirementsSection.props('featureSpecId')).toBe('spec-1')

      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)
      expect(userReqFieldChangeHistories).toHaveLength(0)
    })

    it('should pass correct props to FieldChangeHistory components when they are displayed', () => {
      const wrapper = mountWithQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockFeatureSpec,
          isEditing: true,
        },
      })

      const overviewSection = wrapper.findComponent(OverviewSection)
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)

      // Check that FieldChangeHistory components receive the correct props
      overviewFieldChangeHistories.forEach((fch) => {
        expect(fch.props('isOwner')).toBe(true)
        expect(fch.props('loading')).toBe(false)
        expect(fch.props('changes')).toBeDefined()
      })

      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)
      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)

      // Check that FieldChangeHistory components receive the correct props
      userReqFieldChangeHistories.forEach((fch) => {
        expect(fch.props('isOwner')).toBe(true)
        expect(fch.props('loading')).toBe(false)
        expect(fch.props('changes')).toBeDefined()
      })
    })
  })

  describe('Debugging FieldChangeHistory Display Issues', () => {
    it('should log debug information about FieldChangeHistory rendering', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const wrapper = mountWithQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockFeatureSpec,
          isEditing: true,
        },
      })

      // Log the props being passed to sections
      const overviewSection = wrapper.findComponent(OverviewSection)
      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)

      console.log('OverviewSection props:', overviewSection.props())
      console.log('UserRequirementsSection props:', userRequirementsSection.props())

      // Log the FieldChangeHistory components
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)

      console.log('Overview FieldChangeHistory count:', overviewFieldChangeHistories.length)
      console.log('UserRequirements FieldChangeHistory count:', userReqFieldChangeHistories.length)

      overviewFieldChangeHistories.forEach((fch, index) => {
        console.log(`Overview FCH ${index} props:`, fch.props())
        console.log(`Overview FCH ${index} visible:`, fch.isVisible())
      })

      userReqFieldChangeHistories.forEach((fch, index) => {
        console.log(`UserReq FCH ${index} props:`, fch.props())
        console.log(`UserReq FCH ${index} visible:`, fch.isVisible())
      })

      consoleSpy.mockRestore()
    })
  })
})
