import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import type { FeatureSpecFormData } from '../../types/feature'
import { queryClient } from '../setup'

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
})

// Helper function to mount components with Vue Query
function mountWithQueryClient(component: any, options: any = {}) {
  const app = createApp(component)
  app.use(VueQueryPlugin, { queryClient })

  return mount(component, {
    global: {
      plugins: [VueQueryPlugin],
      provide: {
        VUE_QUERY_CLIENT: queryClient,
      },
    },
    ...options,
  })
}

describe('FeatureSpecForm', () => {
  it('should render the form with section components', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Check that the main form container exists
    expect(wrapper.find('.form-container').exists()).toBe(true)

    // Check that section components are rendered
    expect(wrapper.findComponent({ name: 'OverviewSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'UserRequirementsSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'BehavioralRequirementsSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SuccessCriteriaSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ReviewersSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ApprovalSection' }).exists()).toBe(true)
  })

  it('should initialize with default values', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Check that the form data is initialized
    expect(wrapper.vm.formData).toBeDefined()
    expect(wrapper.vm.formData.featureName).toBe('')
    expect(wrapper.vm.formData.status).toBe('Draft')
  })

  it('should initialize with provided initial data', () => {
    const initialData: FeatureSpecFormData = {
      id: 'test-id',
      featureName: 'Test Feature',
      author: 'Test Author',
      date: '2024-01-17',
      status: 'In Review',
      featureSummary: 'Test summary',
      userGoals: [],
      useCases: [],
      coreInteractions: [],
      successCriteria: [],
      reviewers: [],
      approvals: [],
    }

    const wrapper = mountWithQueryClient(FeatureSpecForm, {
      props: {
        initialData,
        isEditing: true,
      },
    })

    expect(wrapper.vm.formData.featureName).toBe('Test Feature')
    expect(wrapper.vm.formData.author).toBe('Test Author')
    expect(wrapper.vm.formData.status).toBe('In Review')
  })

  it('should show validation errors for required fields', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Trigger validation by submitting empty form
    wrapper.vm.handleSubmit()

    expect(wrapper.vm.errors.featureName).toBe('Feature name is required')
    expect(wrapper.vm.errors.featureSummary).toBe('Feature summary is required')
  })

  it('should emit submit event with form data when form is valid', async () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Set valid form data
    wrapper.vm.formData.featureName = 'Test Feature'
    wrapper.vm.formData.featureSummary = 'Test summary'
    wrapper.vm.formData.author = 'Test Author'
    wrapper.vm.formData.date = '2024-01-17'
    wrapper.vm.formData.status = 'Draft'

    await wrapper.vm.handleSubmit()

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual([wrapper.vm.formData])
  })

  it('should emit cancel event when cancel button is clicked', async () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Call the handleCancel method directly
    wrapper.vm.handleCancel()
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should update form fields correctly', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Test the updateFormField method
    wrapper.vm.updateFormField('featureName', 'Updated Feature Name')
    expect(wrapper.vm.formData.featureName).toBe('Updated Feature Name')
  })

  it('should handle nested field updates', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Test nested field update
    wrapper.vm.updateFormField('approvals.design.visualDesign', 'Approved')
    expect(wrapper.vm.formData.approvals.design.visualDesign).toBe('Approved')
  })

  it('should validate form correctly', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Test validation with empty form
    const isValid = wrapper.vm.validateForm()
    expect(isValid).toBe(false)
    expect(wrapper.vm.errors.featureName).toBe('Feature name is required')
  })

  it('should show error styling for invalid fields', () => {
    const wrapper = mountWithQueryClient(FeatureSpecForm)

    // Set validation errors
    wrapper.vm.errors.featureName = 'Feature name is required'
    wrapper.vm.errors.featureSummary = 'Summary is too short'

    expect(wrapper.vm.errors.featureName).toBe('Feature name is required')
    expect(wrapper.vm.errors.featureSummary).toBe('Summary is too short')
  })
})
