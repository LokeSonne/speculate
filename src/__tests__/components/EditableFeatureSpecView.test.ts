import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EditableFeatureSpecView from '../../components/EditableFeatureSpecView.vue'
import type { FrontendFeatureSpec, FieldChange } from '../../types/feature'

// Mock the composables
const mockCreateFieldChange = vi.fn()
const mockUpdateFieldChangeStatus = vi.fn()
const mockFetchFieldChanges = vi.fn()
const mockUpdateFeatureSpec = vi.fn()
const mockFetchChangeRequests = vi.fn()
const mockCreateChangeRequest = vi.fn()

const mockFieldChanges: FieldChange[] = [
  {
    id: 'fc-1',
    featureSpecId: 'spec-1',
    fieldPath: 'featureName',
    fieldType: 'string',
    oldValue: 'Old Feature Name',
    newValue: 'New Feature Name',
    changeDescription: 'Updated feature name',
    authorId: 'user-1',
    authorEmail: 'editor@example.com',
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'fc-2',
    featureSpecId: 'spec-1',
    fieldPath: 'featureSummary',
    fieldType: 'string',
    oldValue: 'Old summary',
    newValue: 'New summary',
    changeDescription: 'Updated feature summary',
    authorId: 'user-2',
    authorEmail: 'reviewer@example.com',
    status: 'accepted',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    acceptedAt: '2024-01-15T11:30:00Z',
    acceptedBy: 'user-1',
  },
]

vi.mock('../../composables/useChangeRequests', () => ({
  useChangeRequests: () => ({
    changeRequests: { value: [] },
    loading: { value: false },
    error: { value: null },
    fetchChangeRequests: mockFetchChangeRequests,
    createChangeRequest: mockCreateChangeRequest,
  }),
}))

vi.mock('../../composables/useFeatureSpecsSupabase', () => ({
  useFeatureSpecs: () => ({
    updateFeatureSpec: mockUpdateFeatureSpec,
  }),
}))

vi.mock('../../composables/useFieldChanges', () => ({
  useFieldChanges: () => ({
    createFieldChange: mockCreateFieldChange,
    updateFieldChangeStatus: mockUpdateFieldChangeStatus,
    fieldChanges: mockFieldChanges,
    fetchFieldChanges: mockFetchFieldChanges,
  }),
}))

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    user: { value: { email: 'test@example.com' } },
  }),
}))

vi.mock('../../services/markdownService', () => ({
  MarkdownService: vi.fn().mockImplementation(() => ({
    exportSpec: vi.fn().mockResolvedValue({
      filename: 'test-spec.md',
      content: '# Test Spec',
    }),
  })),
}))

describe('EditableFeatureSpecView - Edit Suggestions', () => {
  const mockSpec: FrontendFeatureSpec = {
    id: 'spec-1',
    organizationId: 'org-1',
    featureName: 'Test Feature',
    author: 'test@example.com',
    date: new Date('2024-01-01'),
    status: 'Draft',
    featureSummary: 'A test feature',
    reviewers: [],
    successCriteria: [],
    targetUsers: [],
    userGoals: [],
    useCases: [],
    coreInteractions: [],
    loadingStates: [],
    emptyStates: [],
    errorStates: [],
    formBehavior: {},
    layoutStructure: {},
    visualHierarchy: {},
    componentSpecs: [],
    typographyContent: {},
    accessibilityRequirements: {},
    responsiveBehavior: {},
    animationRequirements: [],
    edgeCases: [],
    technicalConstraints: [],
    businessRules: [],
    approvals: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    version: 1,
  }

  let wrapper: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    wrapper = mount(EditableFeatureSpecView, {
      props: {
        spec: mockSpec,
      },
      global: {
        stubs: {
          ChangeRequestCard: true,
          FieldChangeHistory: true,
          DeleteIcon: true,
        },
      },
    })
  })

  describe('Field Changes Integration', () => {
    it('displays field changes in the sidebar', () => {
      const fieldChangesSection = wrapper.find('.field-changes-section')
      expect(fieldChangesSection.exists()).toBe(true)

      const fieldChangesTitle = fieldChangesSection.find('h4')
      expect(fieldChangesTitle.text()).toBe('Edit Suggestions')

      const fieldChangeHistory = fieldChangesSection.findComponent({ name: 'FieldChangeHistory' })
      expect(fieldChangeHistory.exists()).toBe(true)
    })

    it('passes correct props to FieldChangeHistory component', () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      expect(fieldChangeHistory.props('changes')).toEqual(mockFieldChanges)
      expect(fieldChangeHistory.props('isOwner')).toBe(true) // User is the author
      expect(fieldChangeHistory.props('loading')).toBe(false)
    })

    it('shows owner as true when user is the author', () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })
      expect(fieldChangeHistory.props('isOwner')).toBe(true)
    })

    it('shows owner as false when user is not the author', async () => {
      // Create a new wrapper with different user
      const wrapperWithDifferentUser = mount(EditableFeatureSpecView, {
        props: {
          spec: { ...mockSpec, author: 'different@example.com' },
        },
        global: {
          stubs: {
            ChangeRequestCard: true,
            FieldChangeHistory: true,
            DeleteIcon: true,
          },
        },
      })

      const fieldChangeHistory = wrapperWithDifferentUser.findComponent({
        name: 'FieldChangeHistory',
      })
      expect(fieldChangeHistory.props('isOwner')).toBe(false)
    })
  })

  describe('Edit Mode and Field Change Creation', () => {
    it('creates field changes when saving edits (integrated suggestions)', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Edit a field
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes (now includes suggestions)
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait for async operations
      await nextTick()

      // Verify field change WAS created (integrated suggestions)
      expect(mockCreateFieldChange).toHaveBeenCalledWith({
        featureSpecId: 'spec-1',
        fieldPath: 'featureName',
        fieldType: 'string',
        oldValue: 'Test Feature',
        newValue: 'Updated Feature Name',
        changeDescription: 'Changed featureName from "Test Feature" to "Updated Feature Name"',
      })
    })

    it('creates field changes for multiple field edits when saving', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Edit multiple fields
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      const summaryTextarea = wrapper.find('.editable-textarea')
      await summaryTextarea.setValue('Updated summary')
      await summaryTextarea.trigger('blur')

      // Save changes (now includes suggestions)
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait for async operations
      await nextTick()

      // Verify multiple field changes were created
      expect(mockCreateFieldChange).toHaveBeenCalledTimes(2)
      expect(mockCreateFieldChange).toHaveBeenCalledWith(
        expect.objectContaining({
          featureSpecId: 'spec-1',
          fieldPath: 'featureName',
          newValue: 'Updated Feature Name',
        }),
      )
      expect(mockCreateFieldChange).toHaveBeenCalledWith(
        expect.objectContaining({
          featureSpecId: 'spec-1',
          fieldPath: 'featureSummary',
          newValue: 'Updated summary',
        }),
      )
    })

    it('updates feature spec after saving changes', async () => {
      // Enter edit mode and make changes
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes (now includes suggestions)
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait for async operations
      await nextTick()

      // Verify feature spec was updated
      expect(mockUpdateFeatureSpec).toHaveBeenCalledWith('spec-1', expect.any(Object))
    })

    it('exits edit mode after saving changes', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Make a change
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait for async operations
      await nextTick()

      // Verify edit mode is exited
      expect(wrapper.find('.editable-title').exists()).toBe(false)
      expect(wrapper.find('.edit-actions').exists()).toBe(false)
    })
  })

  describe('Field Change Actions', () => {
    it('handles accepting field changes', async () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger accept event
      await fieldChangeHistory.vm.$emit('accept', 'fc-1')

      // Verify updateFieldChangeStatus was called
      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith('fc-1', 'accepted')
    })

    it('handles rejecting field changes', async () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger reject event
      await fieldChangeHistory.vm.$emit('reject', 'fc-1')

      // Verify updateFieldChangeStatus was called
      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith('fc-1', 'rejected')
    })

    it('refreshes field changes after accepting', async () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger accept event
      await fieldChangeHistory.vm.$emit('accept', 'fc-1')

      // Verify fetchFieldChanges was called
      expect(mockFetchFieldChanges).toHaveBeenCalled()
    })

    it('refreshes field changes after rejecting', async () => {
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger reject event
      await fieldChangeHistory.vm.$emit('reject', 'fc-1')

      // Verify fetchFieldChanges was called
      expect(mockFetchFieldChanges).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('handles errors when saving changes', async () => {
      // Mock createFieldChange to throw an error
      mockCreateFieldChange.mockRejectedValueOnce(new Error('Failed to create field change'))

      // Enter edit mode and make changes
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes (now includes suggestions)
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait for async operations
      await nextTick()

      // Verify error was handled (component should still be in edit mode)
      expect(wrapper.find('.editable-title').exists()).toBe(true)
    })

    it('handles errors when accepting field changes', async () => {
      // Mock updateFieldChangeStatus to throw an error
      mockUpdateFieldChangeStatus.mockRejectedValueOnce(new Error('Failed to update status'))

      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger accept event
      await fieldChangeHistory.vm.$emit('accept', 'fc-1')

      // Verify error was handled gracefully
      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith('fc-1', 'accepted')
    })

    it('handles errors when rejecting field changes', async () => {
      // Mock updateFieldChangeStatus to throw an error
      mockUpdateFieldChangeStatus.mockRejectedValueOnce(new Error('Failed to update status'))

      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })

      // Trigger reject event
      await fieldChangeHistory.vm.$emit('reject', 'fc-1')

      // Verify error was handled gracefully
      expect(mockUpdateFieldChangeStatus).toHaveBeenCalledWith('fc-1', 'rejected')
    })
  })

  describe('Loading States', () => {
    it('shows loading state when saving changes', async () => {
      // Mock updateFeatureSpec to take time
      mockUpdateFeatureSpec.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      // Enter edit mode and make changes
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Wait a bit for the async operation to start
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Verify loading state
      expect(saveButton.text()).toContain('Saving...')
      expect(saveButton.attributes('disabled')).toBeDefined()
    })

    it('passes loading state to FieldChangeHistory', async () => {
      // Mock updateFeatureSpec to take time
      mockUpdateFeatureSpec.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      // Enter edit mode and make changes
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Save changes
      const saveButton = wrapper.find('.btn-primary')
      await saveButton.trigger('click')

      // Verify loading state is passed to FieldChangeHistory
      const fieldChangeHistory = wrapper.findComponent({ name: 'FieldChangeHistory' })
      expect(fieldChangeHistory.props('loading')).toBe(true)
    })
  })

  describe('Change Tracking', () => {
    it('tracks changes correctly for different field types', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Edit string field
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Verify change is tracked
      expect(wrapper.vm.pendingChanges).toHaveLength(1)
      expect(wrapper.vm.pendingChanges[0]).toEqual({
        field: 'featureName',
        oldValue: 'Test Feature',
        newValue: 'Updated Feature Name',
        section: undefined,
      })
    })

    it('updates existing change when field is edited multiple times', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Edit field multiple times
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('First Update')
      await titleInput.trigger('blur')

      await titleInput.setValue('Second Update')
      await titleInput.trigger('blur')

      // Verify only one change is tracked with the latest value
      expect(wrapper.vm.pendingChanges).toHaveLength(1)
      expect(wrapper.vm.pendingChanges[0].newValue).toBe('Second Update')
    })

    it('clears changes when canceling edit', async () => {
      // Enter edit mode
      const editButton = wrapper.find('.btn-primary')
      await editButton.trigger('click')

      // Make changes
      const titleInput = wrapper.find('.editable-title')
      await titleInput.setValue('Updated Feature Name')
      await titleInput.trigger('blur')

      // Cancel editing
      const cancelButton = wrapper.findAll('.btn-secondary')[0] // Cancel is the first btn-secondary
      await cancelButton.trigger('click')

      // Wait for reactive updates
      await nextTick()

      // Verify changes are cleared
      expect(wrapper.vm.pendingChanges).toHaveLength(0)
    })
  })
})
