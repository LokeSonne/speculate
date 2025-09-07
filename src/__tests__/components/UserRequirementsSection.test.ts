import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { ref, computed } from 'vue'
import UserRequirementsSection from '../../components/forms/sections/UserRequirementsSection.vue'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'
import type { FieldChange, UserGoal, UseCase } from '../../types/feature'
import { queryClient } from '../setup'

// Mock the composables
vi.mock('../../composables/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../composables/useFieldChangesQuery', () => ({
  useFieldChanges: vi.fn(),
}))

// Get the mocked functions after imports
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

describe('UserRequirementsSection', () => {
  const mockFieldChanges: FieldChange[] = [
    {
      id: 'fc-1',
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
    {
      id: 'fc-2',
      featureSpecId: 'spec-1',
      fieldPath: 'useCases.0.name',
      fieldType: 'string',
      oldValue: 'Original use case',
      newValue: 'Updated use case name',
      changeDescription: 'Updated use case name',
      authorId: 'user-3',
      authorEmail: 'another@example.com',
      status: 'accepted',
      createdAt: '2024-01-17T11:00:00Z',
      updatedAt: '2024-01-17T11:15:00Z',
      acceptedAt: '2024-01-17T11:15:00Z',
      acceptedBy: 'user-1',
    },
  ]

  const mockUserGoals: UserGoal[] = [
    { id: 'goal-1', description: 'Original goal' },
    { id: 'goal-2', description: 'Another goal' },
  ]

  const mockUseCases: UseCase[] = [
    {
      id: 'case-1',
      name: 'Original use case',
      context: 'Test context',
      userAction: 'Test action',
      expectedOutcome: 'Test outcome',
      successCondition: 'Test condition',
    },
  ]

  const defaultProps = {
    data: {
      userGoals: mockUserGoals,
      useCases: mockUseCases,
    },
    featureSpecId: 'spec-1',
    isOwner: true,
    isEditing: true,
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // Initialize mocked functions
    const useFieldChangesModule = await import('../../composables/useFieldChangesQuery')
    mockUseFieldChanges = vi.mocked(useFieldChangesModule.useFieldChanges)

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

  describe('Basic Rendering', () => {
    it('renders user goals section', () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      expect(wrapper.find('h2').text()).toBe('User Requirements')
      expect(wrapper.find('label').text()).toBe('User Goals')
      expect(wrapper.findAll('.goal-item')).toHaveLength(2)
    })

    it('renders use cases section', () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      expect(wrapper.find('label').text()).toBe('User Goals') // First label
      expect(wrapper.findAll('.use-case-item')).toHaveLength(1)
    })

    it('displays field change history components when featureSpecId is provided', () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)
      expect(fieldChangeHistories).toHaveLength(2) // One for userGoals, one for useCases

      fieldChangeHistories.forEach((fch) => {
        expect(fch.exists()).toBe(true)
        expect(fch.props('isOwner')).toBe(true)
        expect(fch.props('loading')).toBe(false)
      })
    })

    it('does not display field change history when featureSpecId is not provided', () => {
      const propsWithoutId = {
        ...defaultProps,
        featureSpecId: undefined,
      }

      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: propsWithoutId,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)
      expect(fieldChangeHistories).toHaveLength(0)
    })
  })

  describe('User Goals Management', () => {
    it('adds a new user goal', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const addButton = wrapper.find('button')
      const addGoalButton = Array.from(wrapper.findAll('button')).find((btn) =>
        btn.text().includes('+ Add User Goal'),
      )
      await addGoalButton?.trigger('click')

      expect(wrapper.emitted('update')).toBeTruthy()
      const updateEvent = wrapper.emitted('update')?.[0]
      expect(updateEvent?.[0]).toBe('userGoals')
      expect(updateEvent?.[1]).toHaveLength(3) // Original 2 + 1 new
    })

    it('removes a user goal', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      // Find the remove button by looking for the DeleteIcon component
      const goalItem = wrapper.find('.goal-item')
      expect(goalItem.exists()).toBe(true)

      const removeButton = goalItem.find('button')
      expect(removeButton.exists()).toBe(true)

      // Check that the button contains the DeleteIcon component
      const deleteIcon = removeButton.findComponent({ name: 'DeleteIcon' })
      expect(deleteIcon.exists()).toBe(true)

      await removeButton.trigger('click')

      expect(wrapper.emitted('update')).toBeTruthy()
      const updateEvent = wrapper.emitted('update')?.[0]
      expect(updateEvent?.[0]).toBe('userGoals')
      expect(updateEvent?.[1]).toHaveLength(1) // Original 2 - 1 removed
    })

    it('updates user goal description and emits field-change event', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const input = wrapper.find('input[placeholder="What user wants to accomplish"]')
      await input.setValue('Updated goal description')

      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('field-change')).toBeTruthy()

      const fieldChangeEvent = wrapper.emitted('field-change')?.[0]
      expect(fieldChangeEvent?.[0]).toBe('userGoals.0.description')
      expect(fieldChangeEvent?.[1]).toBe('Original goal')
      expect(fieldChangeEvent?.[2]).toBe('Updated goal description')
    })
  })

  describe('Use Cases Management', () => {
    it('adds a new use case', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const addButtons = wrapper.findAll('button')
      const addUseCaseButton = Array.from(addButtons).find((btn) =>
        btn.text().includes('+ Add Use Case'),
      )
      await addUseCaseButton?.trigger('click')

      expect(wrapper.emitted('update')).toBeTruthy()
      const updateEvent = wrapper.emitted('update')?.[0]
      expect(updateEvent?.[0]).toBe('useCases')
      expect(updateEvent?.[1]).toHaveLength(2) // Original 1 + 1 new
    })

    it('removes a use case', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      // Find the use case remove button specifically
      const useCaseItem = wrapper.find('.use-case-item')
      expect(useCaseItem.exists()).toBe(true)

      const removeButton = useCaseItem.find('button')
      expect(removeButton.exists()).toBe(true)

      // Check that the button contains the DeleteIcon component
      const deleteIcon = removeButton.findComponent({ name: 'DeleteIcon' })
      expect(deleteIcon.exists()).toBe(true)

      await removeButton.trigger('click')

      expect(wrapper.emitted('update')).toBeTruthy()
      const updateEvents = wrapper.emitted('update')
      expect(updateEvents).toBeTruthy()
      expect(updateEvents?.length).toBeGreaterThan(0)

      // The last emitted event should be for useCases
      const lastEvent = updateEvents?.[updateEvents.length - 1]
      expect(lastEvent?.[0]).toBe('useCases')
      expect(lastEvent?.[1]).toHaveLength(0) // Original 1 - 1 removed
    })

    it('updates use case name and emits field-change event', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const input = wrapper.find('input[placeholder="Use Case Name"]')
      await input.setValue('Updated use case name')

      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('field-change')).toBeTruthy()

      const fieldChangeEvent = wrapper.emitted('field-change')?.[0]
      expect(fieldChangeEvent?.[0]).toBe('useCases.0.name')
      expect(fieldChangeEvent?.[1]).toBe('Original use case')
      expect(fieldChangeEvent?.[2]).toBe('Updated use case name')
    })

    it('updates use case context and emits field-change event', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const textarea = wrapper.find('textarea[placeholder="When/where this happens"]')
      await textarea.setValue('Updated context')

      expect(wrapper.emitted('update')).toBeTruthy()
      expect(wrapper.emitted('field-change')).toBeTruthy()

      const fieldChangeEvent = wrapper.emitted('field-change')?.[0]
      expect(fieldChangeEvent?.[0]).toBe('useCases.0.context')
      expect(fieldChangeEvent?.[1]).toBe('Test context')
      expect(fieldChangeEvent?.[2]).toBe('Updated context')
    })
  })

  describe('Field Change History Integration', () => {
    it('passes correct props to FieldChangeHistory components', () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)

      // Check userGoals FieldChangeHistory
      const userGoalsFCH = fieldChangeHistories[0]
      expect(userGoalsFCH.props('changes')).toEqual(
        mockFieldChanges.filter((change) => change.fieldPath.startsWith('userGoals')),
      )
      expect(userGoalsFCH.props('isOwner')).toBe(true)
      expect(userGoalsFCH.props('loading')).toBe(false)

      // Check useCases FieldChangeHistory
      const useCasesFCH = fieldChangeHistories[1]
      expect(useCasesFCH.props('changes')).toEqual(
        mockFieldChanges.filter((change) => change.fieldPath.startsWith('useCases')),
      )
      expect(useCasesFCH.props('isOwner')).toBe(true)
      expect(useCasesFCH.props('loading')).toBe(false)
    })

    it('handles field change acceptance', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)
      const userGoalsFCH = fieldChangeHistories[0]

      await userGoalsFCH.vm.$emit('accept', 'fc-1')

      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith({
        changeId: 'fc-1',
        status: 'accepted',
      })
    })

    it('handles field change rejection', async () => {
      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)
      const userGoalsFCH = fieldChangeHistories[0]

      await userGoalsFCH.vm.$emit('reject', 'fc-1')

      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith({
        changeId: 'fc-1',
        status: 'rejected',
      })
    })

    it('handles updateFieldChangeStatus errors gracefully', async () => {
      mockUpdateFieldChangeStatus.mockRejectedValueOnce(new Error('Update failed'))

      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)
      const userGoalsFCH = fieldChangeHistories[0]

      // Should not throw error
      await userGoalsFCH.vm.$emit('accept', 'fc-1')

      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith({
        changeId: 'fc-1',
        status: 'accepted',
      })
    })
  })

  describe('Non-Owner Experience', () => {
    it('passes isOwner=false to FieldChangeHistory when user is not owner', () => {
      const propsNonOwner = {
        ...defaultProps,
        isOwner: false,
      }

      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: propsNonOwner,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)

      fieldChangeHistories.forEach((fch) => {
        expect(fch.props('isOwner')).toBe(false)
      })
    })
  })

  describe('Loading States', () => {
    it('shows loading state when field changes are loading', () => {
      mockUseFieldChanges.mockReturnValue({
        isLoading: ref(true),
        getFieldChanges: mockGetFieldChanges,
        updateFieldChangeStatus: mockUpdateFieldChangeStatus,
      })

      const wrapper = mountWithQueryClient(UserRequirementsSection, {
        props: defaultProps,
      })

      const fieldChangeHistories = wrapper.findAllComponents(FieldChangeHistory)

      fieldChangeHistories.forEach((fch) => {
        expect(fch.props('loading')).toBe(true)
      })
    })
  })
})
