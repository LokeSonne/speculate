import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { QueryClient } from '@tanstack/vue-query'
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import OverviewSection from '../../components/forms/sections/OverviewSection.vue'
import UserRequirementsSection from '../../components/forms/sections/UserRequirementsSection.vue'
import SuccessCriteriaSection from '../../components/forms/sections/SuccessCriteriaSection.vue'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'
import type { FrontendFeatureSpec } from '../../types/feature'

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

describe('Real-World Edit Suggestions - SHOULD FAIL', () => {
  beforeEach(() => {
    queryClient.clear()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('mock-spec-2 Edit Suggestions - Current Broken State', () => {
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

    it('SHOULD PASS - Edit suggestions ARE displayed for mock-spec-2 (fixed state)', async () => {
      // This test SHOULD PASS because edit suggestions are now working
      const wrapper = mountWithRealQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockSpec2,
          isEditing: true,
        },
      })

      // Wait for authentication and async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Increased delay

      // Check OverviewSection
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)
      expect(overviewSection.props('featureSpecId')).toBe('mock-spec-2')
      expect(overviewSection.props('isEditing')).toBe(true)

      // Get all FieldChangeHistory components
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)

      // Check if any FieldChangeHistory components actually show field changes
      let hasFieldChanges = false
      overviewFieldChangeHistories.forEach((fch, index) => {
        const changes = fch.props('changes')
        if (changes && changes.length > 0) {
          hasFieldChanges = true
        }
      })

      // This assertion SHOULD PASS because edit suggestions are now displaying
      expect(hasFieldChanges).toBe(true) // This should be true and now is true!

      // Check SuccessCriteriaSection
      const successCriteriaSection = wrapper.findComponent(SuccessCriteriaSection)
      expect(successCriteriaSection.exists()).toBe(true)
      expect(successCriteriaSection.props('featureSpecId')).toBe('mock-spec-2')
      expect(successCriteriaSection.props('isEditing')).toBe(true)

      const successCriteriaFieldChangeHistories =
        successCriteriaSection.findAllComponents(FieldChangeHistory)

      // Check if any SuccessCriteria FieldChangeHistory components show field changes
      let successCriteriaHasFieldChanges = false
      successCriteriaFieldChangeHistories.forEach((fch, index) => {
        const changes = fch.props('changes')
        if (changes && changes.length > 0) {
          successCriteriaHasFieldChanges = true
        }
      })

      // This assertion shows that SuccessCriteria section is now working!
      // Overview section is working, and SuccessCriteria section is now working too!
      expect(successCriteriaHasFieldChanges).toBe(true) // SuccessCriteria section is now working!
    })

    it('SHOULD PASS - FieldChangeHistory components exist and show data (fixed state)', async () => {
      // This test SHOULD PASS because edit suggestions are now working
      const wrapper = mountWithRealQueryClient(FeatureSpecForm, {
        props: {
          initialData: mockSpec2,
          isEditing: true,
        },
      })

      // Wait for authentication and async operations to complete
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Increased delay

      // Check OverviewSection
      const overviewSection = wrapper.findComponent(OverviewSection)
      expect(overviewSection.exists()).toBe(true)

      // FieldChangeHistory components should exist
      const overviewFieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      expect(overviewFieldChangeHistories.length).toBeGreaterThan(0)

      // And they should show changes (fixed state)
      let hasAnyChanges = false
      overviewFieldChangeHistories.forEach((fch) => {
        const changes = fch.props('changes')
        if (changes && changes.length > 0) {
          hasAnyChanges = true
        }
      })
      expect(hasAnyChanges).toBe(true) // Should have changes now

      // Check SuccessCriteriaSection
      const successCriteriaSection = wrapper.findComponent(SuccessCriteriaSection)
      expect(successCriteriaSection.exists()).toBe(true)

      const successCriteriaFieldChangeHistories =
        successCriteriaSection.findAllComponents(FieldChangeHistory)
      expect(successCriteriaFieldChangeHistories.length).toBeGreaterThan(0)

      // And they should show changes (fixed state)
      let hasAnySuccessCriteriaChanges = false
      successCriteriaFieldChangeHistories.forEach((fch) => {
        const changes = fch.props('changes')
        if (changes && changes.length > 0) {
          hasAnySuccessCriteriaChanges = true
        }
      })
      expect(hasAnySuccessCriteriaChanges).toBe(true) // SuccessCriteria section is now working!
    })
  })

  describe('Debug Authentication State', () => {
    it('should show authentication state in components', async () => {
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

      // Log the component's state for debugging
      const overviewSection = wrapper.findComponent(OverviewSection)

      // Check if the component is making API calls
      const fieldChangeHistories = overviewSection.findAllComponents(FieldChangeHistory)
      fieldChangeHistories.forEach((fch, index) => {})
    })
  })
})
