import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ref, nextTick } from 'vue'
import type { FieldChange, FrontendFeatureSpec } from '../../types/feature'

// Mock the composables before importing components
const mockFieldChanges = ref<FieldChange[]>([])

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { email: 'owner@example.com' } },
  }),
}))

vi.mock('../../composables/useFieldChangesQuery', () => ({
  useFieldChanges: vi.fn(() => ({
    fieldChanges: mockFieldChanges,
    isLoading: ref(false),
    error: ref(null),
    createFieldChange: vi.fn(),
    updateFieldChangeStatus: vi.fn().mockResolvedValue({}),
    getFieldChanges: vi.fn((fieldPath: string) => {
      return ref(mockFieldChanges.value.filter((change) => change.fieldPath === fieldPath))
    }),
  })),
}))

// Import components after mocking
import FeatureSpecForm from '../../components/forms/FeatureSpecForm.vue'
import OverviewSection from '../../components/forms/sections/OverviewSection.vue'

const mockFeatureSpec: FrontendFeatureSpec = {
  id: 'spec-1',
  featureName: 'Original Feature Name',
  author: 'owner@example.com',
  date: '2024-01-17',
  status: 'Draft',
  featureSummary: 'Original summary',
  userGoals: [],
  useCases: [],
  coreInteractions: [],
  successCriteria: [],
  reviewers: [],
  approvals: [],
}

describe('FeatureSpecForm - Accept Suggestion Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock data
    mockFieldChanges.value = []
  })

  const mountComponent = () => {
    const queryClient = {
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
      getQueryData: vi.fn(),
    }

    return mount(FeatureSpecForm, {
      props: {
        initialData: mockFeatureSpec,
        isEditing: true,
      },
      global: {
        plugins: [VueQueryPlugin],
        provide: {
          VUE_QUERY_CLIENT: queryClient,
        },
      },
    })
  }

  it('updates input field value when suggestion is accepted', async () => {
    // Setup: Add a pending suggestion
    mockFieldChanges.value = [
      {
        id: 'fc-1',
        featureSpecId: 'spec-1',
        fieldPath: 'featureSummary',
        fieldType: 'string',
        oldValue: 'Original summary',
        newValue: 'Updated summary with suggestion',
        changeDescription: 'Updated feature summary',
        authorId: 'user-2',
        authorEmail: 'reviewer@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T10:30:00Z',
      },
    ]

    const wrapper = mountComponent()
    await nextTick()

    const overviewSection = wrapper.findComponent(OverviewSection)
    expect(overviewSection.exists()).toBe(true)

    // Find the textarea input field
    const textarea = overviewSection.find('textarea#featureSummary')
    expect(textarea.exists()).toBe(true)

    // Verify initial value
    expect(textarea.element.value).toBe('Original summary')

    // Find the FieldChangeHistory component and simulate accepting the suggestion
    const fieldChangeHistory = overviewSection.findComponent({ name: 'FieldChangeHistory' })
    expect(fieldChangeHistory.exists()).toBe(true)

    // Simulate accepting the suggestion
    await fieldChangeHistory.vm.$emit('accept', 'fc-1')
    await nextTick()

    // Verify that the input field now shows the suggested value
    expect(textarea.element.value).toBe('Updated summary with suggestion')
  })

  it('updates featureName input field when suggestion is accepted', async () => {
    // Setup: Add a pending suggestion for featureName
    mockFieldChanges.value = [
      {
        id: 'fc-2',
        featureSpecId: 'spec-1',
        fieldPath: 'featureName',
        fieldType: 'string',
        oldValue: 'Original Feature Name',
        newValue: 'Updated Feature Name',
        changeDescription: 'Updated feature name',
        authorId: 'user-2',
        authorEmail: 'reviewer@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T10:30:00Z',
      },
    ]

    const wrapper = mountComponent()
    await nextTick()

    const overviewSection = wrapper.findComponent(OverviewSection)

    // Find the input field
    const input = overviewSection.find('input#featureName')
    expect(input.exists()).toBe(true)

    // Verify initial value
    expect(input.element.value).toBe('Original Feature Name')

    // Find the FieldChangeHistory component and simulate accepting the suggestion
    const fieldChangeHistory = overviewSection.findComponent({ name: 'FieldChangeHistory' })

    // Simulate accepting the suggestion
    await fieldChangeHistory.vm.$emit('accept', 'fc-2')
    await nextTick()

    // Verify that the input field now shows the suggested value
    expect(input.element.value).toBe('Updated Feature Name')
  })

  it('updates status select field when suggestion is accepted', async () => {
    // Setup: Add a pending suggestion for status
    mockFieldChanges.value = [
      {
        id: 'fc-3',
        featureSpecId: 'spec-1',
        fieldPath: 'status',
        fieldType: 'string',
        oldValue: 'Draft',
        newValue: 'In Review',
        changeDescription: 'Updated status',
        authorId: 'user-2',
        authorEmail: 'reviewer@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T10:30:00Z',
      },
    ]

    const wrapper = mountComponent()
    await nextTick()

    const overviewSection = wrapper.findComponent(OverviewSection)

    // Find the select field
    const select = overviewSection.find('select#status')
    expect(select.exists()).toBe(true)

    // Verify initial value
    expect(select.element.value).toBe('Draft')

    // Find the FieldChangeHistory component and simulate accepting the suggestion
    const fieldChangeHistory = overviewSection.findComponent({ name: 'FieldChangeHistory' })

    // Simulate accepting the suggestion
    await fieldChangeHistory.vm.$emit('accept', 'fc-3')
    await nextTick()

    // Verify that the select field now shows the suggested value
    expect(select.element.value).toBe('In Review')
  })

  it('handles multiple suggestions for the same field', async () => {
    // Setup: Add multiple pending suggestions for the same field
    mockFieldChanges.value = [
      {
        id: 'fc-4',
        featureSpecId: 'spec-1',
        fieldPath: 'featureSummary',
        fieldType: 'string',
        oldValue: 'Original summary',
        newValue: 'First suggestion',
        changeDescription: 'First suggestion',
        authorId: 'user-2',
        authorEmail: 'reviewer@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T10:30:00Z',
      },
      {
        id: 'fc-5',
        featureSpecId: 'spec-1',
        fieldPath: 'featureSummary',
        fieldType: 'string',
        oldValue: 'Original summary',
        newValue: 'Second suggestion',
        changeDescription: 'Second suggestion',
        authorId: 'user-3',
        authorEmail: 'reviewer2@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:31:00Z',
        updatedAt: '2024-01-17T10:31:00Z',
      },
    ]

    const wrapper = mountComponent()
    await nextTick()

    const overviewSection = wrapper.findComponent(OverviewSection)
    const textarea = overviewSection.find('textarea#featureSummary')
    const fieldChangeHistory = overviewSection.findComponent({ name: 'FieldChangeHistory' })

    // Accept first suggestion
    await fieldChangeHistory.vm.$emit('accept', 'fc-4')
    await nextTick()
    expect(textarea.element.value).toBe('First suggestion')

    // Accept second suggestion
    await fieldChangeHistory.vm.$emit('accept', 'fc-5')
    await nextTick()
    expect(textarea.element.value).toBe('Second suggestion')
  })
})
