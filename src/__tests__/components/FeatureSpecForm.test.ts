import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import type { FeatureSpecFormData } from '../../types/feature'

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
})

describe('FeatureSpecForm', () => {
  it('should render the form with basic fields', () => {
    const wrapper = mount(FeatureSpecForm)

    expect(wrapper.find('input[id="featureName"]').exists()).toBe(true)
    expect(wrapper.find('input[id="author"]').exists()).toBe(true)
    expect(wrapper.find('input[id="date"]').exists()).toBe(true)
    expect(wrapper.find('select[id="status"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="featureSummary"]').exists()).toBe(true)
  })

  it('should initialize with default values', () => {
    const wrapper = mount(FeatureSpecForm)

    const featureNameInput = wrapper.find('input[id="featureName"]').element as HTMLInputElement
    const authorInput = wrapper.find('input[id="author"]').element as HTMLInputElement
    const statusSelect = wrapper.find('select[id="status"]').element as HTMLSelectElement

    expect(featureNameInput.value).toBe('')
    expect(authorInput.value).toBe('')
    expect(statusSelect.value).toBe('Draft')
  })

  it('should initialize with provided initial data', () => {
    const initialData: Partial<FeatureSpecFormData> = {
      featureName: 'Test Feature',
      author: 'John Doe',
      status: 'In Review',
      featureSummary: 'Test summary',
    }

    const wrapper = mount(FeatureSpecForm, {
      props: {
        initialData,
      },
    })

    const featureNameInput = wrapper.find('input[id="featureName"]').element as HTMLInputElement
    const authorInput = wrapper.find('input[id="author"]').element as HTMLInputElement
    const statusSelect = wrapper.find('select[id="status"]').element as HTMLSelectElement
    const summaryTextarea = wrapper.find('textarea[id="featureSummary"]')
      .element as HTMLTextAreaElement

    expect(featureNameInput.value).toBe('Test Feature')
    expect(authorInput.value).toBe('John Doe')
    expect(statusSelect.value).toBe('In Review')
    expect(summaryTextarea.value).toBe('Test summary')
  })

  it('should show validation errors for required fields', async () => {
    const wrapper = mount(FeatureSpecForm)

    // Submit form without filling required fields
    await wrapper.find('form').trigger('submit.prevent')

    // Check if error messages are displayed
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('should emit submit event with form data when form is valid', async () => {
    const wrapper = mount(FeatureSpecForm)

    // Fill in required fields
    await wrapper.find('input[id="featureName"]').setValue('Test Feature')
    await wrapper.find('input[id="author"]').setValue('John Doe')
    await wrapper.find('textarea[id="featureSummary"]').setValue('Test summary')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Check if submit event was emitted
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      featureName: 'Test Feature',
      author: 'John Doe',
      featureSummary: 'Test summary',
    })
  })

  it('should emit cancel event when cancel button is clicked', async () => {
    const wrapper = mount(FeatureSpecForm)

    await wrapper.find('.btn-secondary').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should add success criteria when add button is clicked', async () => {
    const wrapper = mount(FeatureSpecForm)

    const initialCount = wrapper.findAll('.criteria-item').length
    await wrapper.find('.btn-add').trigger('click')

    expect(wrapper.findAll('.criteria-item')).toHaveLength(initialCount + 1)
  })

  it('should add reviewer when add reviewer button is clicked', async () => {
    const wrapper = mount(FeatureSpecForm)

    // Find the second add button (for reviewers)
    const addButtons = wrapper.findAll('.btn-add')
    const addReviewerButton = addButtons[1]

    const initialCount = wrapper.findAll('.reviewer-item').length
    await addReviewerButton.trigger('click')

    expect(wrapper.findAll('.reviewer-item')).toHaveLength(initialCount + 1)
  })

  it('should remove success criteria when remove button is clicked', async () => {
    const wrapper = mount(FeatureSpecForm)

    // Add a criteria first
    await wrapper.find('.btn-add').trigger('click')
    expect(wrapper.findAll('.criteria-item')).toHaveLength(1)

    // Remove it
    await wrapper.find('.btn-remove').trigger('click')
    expect(wrapper.findAll('.criteria-item')).toHaveLength(0)
  })
})
