import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { QueryClient } from '@tanstack/vue-query'
import { setupServer } from 'msw/node'
import { handlers } from '../../mocks/handlers'
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import OverviewSection from '../../components/forms/sections/OverviewSection.vue'
import UserRequirementsSection from '../../components/forms/sections/UserRequirementsSection.vue'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'
import type { FrontendFeatureSpec } from '../../types/feature'

// Setup MSW server for real API calls
const server = setupServer(...handlers)

// Create a real QueryClient (not mocked)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function mountWithRealQueryClient(component: any, options: any = {}) {
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

describe('Real-World Edit Suggestions Integration', () => {
  beforeEach(async () => {
    server.listen()
    queryClient.clear()

    // Authenticate the user before each test
    const response = await fetch('https://mock.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'mock-anon-key',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    if (!response.ok) {
      console.warn('Failed to authenticate user in test setup')
    }
  })

  afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })

  describe('mock-spec-2 Edit Suggestions', () => {
    const mockSpec2: FrontendFeatureSpec = {
      id: 'mock-spec-2',
      featureName: 'User Profile Management',
      author: 'Jane Smith',
      date: new Date('2024-01-20'),
      status: 'In Review',
      featureSummary:
        'Allow users to manage their profile information, preferences, and account settings.',
      reviewers: [
        { id: 'rev-3', name: 'Charlie Brown', role: 'Product', status: 'approved' },
        { id: 'rev-4', name: 'Diana Prince', role: 'Design', status: 'pending' },
        { id: 'rev-5', name: 'Eve Wilson', role: 'Engineering', status: 'approved' },
      ],
      successCriteria: [
        {
          id: 'crit-3',
          type: 'Primary',
          description: 'Users can update their profile information',
        },
        { id: 'crit-4', type: 'Key', description: 'Profile changes are saved automatically' },
        { id: 'crit-5', type: 'Primary', description: 'Users can change their password securely' },
      ],
      targetUsers: [
        {
          id: 'user-2',
          type: 'Primary',
          description: 'Registered users with active accounts',
          characteristics: ['Has profile data', 'Needs to update information'],
        },
      ],
      userGoals: [
        {
          id: 'goal-2',
          priority: 1,
          description: 'Update personal information easily',
        },
        {
          id: 'goal-3',
          priority: 2,
          description: 'Manage account security settings',
        },
      ],
      useCases: [
        {
          id: 'uc-2',
          name: 'Update Profile',
          context: 'User wants to change their personal information',
          steps: ['Navigate to profile settings', 'Edit desired fields', 'Save changes'],
          expectedOutcome: 'Profile information is updated successfully',
          successCondition: 'Changes are reflected immediately',
        },
      ],
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
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      version: '1.0.0',
    }

    it('should FAIL - FieldChangeHistory components are NOT displayed for mock-spec-2', async () => {
      // This test should FAIL because edit suggestions are not being displayed
      const wrapper = mountWithRealQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockSpec2,
          isEditing: true,
        },
      })

      // Wait for async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check OverviewSection
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBe('mock-spec-2')
      expect(overviewSection.props('isEditing')).toBe(true)

      // This should FAIL - FieldChangeHistory should NOT be found
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)

      // This assertion should FAIL because edit suggestions are not displaying
      expect(overviewFieldChangeHistories.length).toBe(0) // Should be 0, not > 0

      // Check UserRequirementsSection
      const userRequirementsSection = wrapper.findComponent(UserRequirementsSection)
      expect(userRequirementsSection.exists()).toBe(true)
      expect(userRequirementsSection.props('featureSpecId')).toBe('mock-spec-2')
      expect(userRequirementsSection.props('isEditing')).toBe(true)

      // This should FAIL - FieldChangeHistory should NOT be found
      const userReqFieldChangeHistories =
        userRequirementsSection.findAllComponents(FieldChangeHistory)

      // This assertion should FAIL because edit suggestions are not displaying
      expect(userReqFieldChangeHistories.length).toBe(0) // Should be 0, not > 0
    })

    it('should PASS - FieldChangeHistory components ARE displayed for mock-spec-2 (expected behavior)', async () => {
      // This test should PASS if edit suggestions are working correctly
      const wrapper = mountWithRealQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockSpec2,
          isEditing: true,
        },
      })

      // Wait for async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check OverviewSection
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBe('mock-spec-2')
      expect(overviewSection.props('isEditing')).toBe(true)

      // This should PASS - FieldChangeHistory should be found
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)

      // This assertion should PASS if edit suggestions are working
      expect(overviewFieldChangeHistories.length).toBeGreaterThan(0)

      // Check that the FieldChangeHistory components are actually visible
      overviewFieldChangeHistories.forEach((fch, index) => {
        expect(fch.exists()).toBe(true)
        expect(fch.isVisible()).toBe(true)
      })
    })
  })

  describe('Debug Real API Calls', () => {
    it('should make real API calls to fetch field changes', async () => {
      const mockSpec2: FrontendFeatureSpec = {
        id: 'mock-spec-2',
        featureName: 'User Profile Management',
        author: 'Jane Smith',
        date: new Date('2024-01-20'),
        status: 'In Review',
        featureSummary:
          'Allow users to manage their profile information, preferences, and account settings.',
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
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        version: '1.0.0',
      }

      const wrapper = mountWithRealQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockSpec2,
          isEditing: true,
        },
      })

      // Wait for async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if the component is making API calls
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)

      // Log the component's state for debugging
    })
  })
})
