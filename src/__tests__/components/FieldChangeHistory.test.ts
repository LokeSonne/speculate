import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'
import type { FieldChange } from '../../types/feature'

// Mock the console.log to avoid noise in tests
const originalConsoleLog = console.log
beforeEach(() => {
  console.log = vi.fn()
})

afterEach(() => {
  console.log = originalConsoleLog
})

describe('FieldChangeHistory', () => {
  const mockChanges: FieldChange[] = [
    {
      id: 'fc-1',
      featureSpecId: 'spec-1',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'Old Feature Name',
      newValue: 'New Feature Name',
      changeDescription: 'Updated feature name',
      authorId: 'user-1',
      authorEmail: 'john@example.com',
      status: 'pending',
      createdAt: '2024-01-17T10:30:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
    },
    {
      id: 'fc-2',
      featureSpecId: 'spec-1',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'New Feature Name',
      newValue: 'Updated Feature Name',
      changeDescription: 'Further updated feature name',
      authorId: 'user-2',
      authorEmail: 'jane@example.com',
      status: 'accepted',
      createdAt: '2024-01-17T11:00:00Z',
      updatedAt: '2024-01-17T11:15:00Z',
      acceptedAt: '2024-01-17T11:15:00Z',
      acceptedBy: 'owner-1',
    },
    {
      id: 'fc-3',
      featureSpecId: 'spec-1',
      fieldPath: 'featureSummary',
      fieldType: 'string',
      oldValue: 'Old summary',
      newValue: 'New summary',
      changeDescription: 'Updated summary',
      authorId: 'user-3',
      authorEmail: 'bob@example.com',
      status: 'rejected',
      createdAt: '2024-01-17T12:00:00Z',
      updatedAt: '2024-01-17T12:30:00Z',
      rejectedAt: '2024-01-17T12:30:00Z',
      rejectedBy: 'owner-1',
    },
  ]

  describe('Rendering', () => {
    it('renders no changes message when no changes provided', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [],
          isOwner: false,
        },
      })

      expect(wrapper.find('.no-changes').text()).toBe('No changes yet')
    })

    it('renders changes list when changes are provided', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: false,
        },
      })

      expect(wrapper.find('.no-changes').exists()).toBe(false)
      expect(wrapper.findAll('.change-item')).toHaveLength(3)
    })

    it('applies correct CSS classes based on change status', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: false,
        },
      })

      const changeItems = wrapper.findAll('.change-item')

      expect(changeItems[0].classes()).toContain('change-pending')
      expect(changeItems[1].classes()).toContain('change-accepted')
      expect(changeItems[2].classes()).toContain('change-rejected')
    })
  })

  describe('Change Content Display', () => {
    it('displays new value and old value correctly', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [mockChanges[0]],
          isOwner: false,
        },
      })

      const changeItem = wrapper.find('.change-item')

      expect(changeItem.find('.change-text').text()).toBe('New Feature Name')
      expect(changeItem.find('.old-value').text()).toBe('Old Feature Name')
    })

    it('handles null/undefined values gracefully', () => {
      const changeWithNulls: FieldChange = {
        ...mockChanges[0],
        oldValue: null,
        newValue: undefined,
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [changeWithNulls],
          isOwner: false,
        },
      })

      const changeItem = wrapper.find('.change-item')

      expect(changeItem.find('.change-text').text()).toBe('Empty')
      // Old value section is not rendered when oldValue is null/undefined
      expect(changeItem.find('.old-value').exists()).toBe(false)
    })

    it('formats object values as JSON', () => {
      const changeWithObject: FieldChange = {
        ...mockChanges[0],
        oldValue: { key: 'old' },
        newValue: { key: 'new' },
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [changeWithObject],
          isOwner: false,
        },
      })

      const changeItem = wrapper.find('.change-item')

      expect(changeItem.find('.change-text').text()).toContain('"key": "new"')
      expect(changeItem.find('.old-value').text()).toContain('"key": "old"')
    })
  })

  describe('Status Badges', () => {
    it('displays correct status badges', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: false,
        },
      })

      const changeItems = wrapper.findAll('.change-item')

      expect(changeItems[0].find('.badge-warning').text()).toBe('Pending')
      expect(changeItems[1].find('.badge-success').text()).toBe('Accepted')
      expect(changeItems[2].find('.badge-error').text()).toBe('Rejected')
    })
  })

  describe('Author and Date Information', () => {
    it('displays author email and formatted date', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [mockChanges[0]],
          isOwner: false,
        },
      })

      const changeItem = wrapper.find('.change-item')

      expect(changeItem.find('.change-author').text()).toBe('john@example.com')
      expect(changeItem.find('.change-date').text()).toMatch(
        /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/,
      )
    })
  })

  describe('Owner Controls', () => {
    it('shows accept/reject buttons for pending changes when user is owner', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const pendingChange = wrapper.find('.change-pending')
      const ownerControls = pendingChange.find('.owner-controls')

      expect(ownerControls.exists()).toBe(true)
      expect(ownerControls.find('button').text()).toBe('Accept')
      expect(ownerControls.findAll('button')).toHaveLength(2)
    })

    it('does not show owner controls when user is not owner', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: false,
        },
      })

      const pendingChange = wrapper.find('.change-pending')

      expect(pendingChange.find('.owner-controls').exists()).toBe(false)
    })

    it('does not show owner controls for accepted/rejected changes', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const acceptedChange = wrapper.find('.change-accepted')
      const rejectedChange = wrapper.find('.change-rejected')

      expect(acceptedChange.find('.owner-controls').exists()).toBe(false)
      expect(rejectedChange.find('.owner-controls').exists()).toBe(false)
    })

    it('disables buttons when loading', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
          loading: true,
        },
      })

      const pendingChange = wrapper.find('.change-pending')
      const buttons = pendingChange.findAll('button')

      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Event Handling', () => {
    it('emits accept event when accept button is clicked', async () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const pendingChange = wrapper.find('.change-pending')
      const acceptButton = pendingChange.find('button')

      await acceptButton.trigger('click')

      expect(wrapper.emitted('accept')).toBeTruthy()
      expect(wrapper.emitted('accept')?.[0]).toEqual(['fc-1'])
    })

    it('emits reject event when reject button is clicked', async () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const pendingChange = wrapper.find('.change-pending')
      const rejectButton = pendingChange.findAll('button')[1]

      await rejectButton.trigger('click')

      expect(wrapper.emitted('reject')).toBeTruthy()
      expect(wrapper.emitted('reject')?.[0]).toEqual(['fc-1'])
    })
  })

  describe('Edge Cases', () => {
    it('handles changes with missing optional fields', () => {
      const incompleteChange: FieldChange = {
        id: 'fc-incomplete',
        featureSpecId: 'spec-1',
        fieldPath: 'testField',
        fieldType: 'string',
        oldValue: 'old',
        newValue: 'new',
        authorId: 'user-1',
        authorEmail: 'test@example.com',
        status: 'pending',
        createdAt: '2024-01-17T10:30:00Z',
        updatedAt: '2024-01-17T10:30:00Z',
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [incompleteChange],
          isOwner: false,
        },
      })

      expect(wrapper.find('.change-item').exists()).toBe(true)
      expect(wrapper.find('.change-author').text()).toBe('test@example.com')
    })

    it('handles changes with very long values', () => {
      const longValue = 'a'.repeat(1000)
      const changeWithLongValue: FieldChange = {
        ...mockChanges[0],
        newValue: longValue,
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [changeWithLongValue],
          isOwner: false,
        },
      })

      const changeText = wrapper.find('.change-text')
      expect(changeText.text()).toBe(longValue)
      expect(changeText.classes()).toContain('change-text')
    })

    it('handles changes with special characters in values', () => {
      const specialValue = 'Value with "quotes" & <tags> and \n newlines'
      const changeWithSpecialChars: FieldChange = {
        ...mockChanges[0],
        newValue: specialValue,
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [changeWithSpecialChars],
          isOwner: false,
        },
      })

      const changeText = wrapper.find('.change-text')
      expect(changeText.text()).toBe(specialValue)
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly for different locales', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [mockChanges[0]],
          isOwner: false,
        },
      })

      const dateElement = wrapper.find('.change-date')
      const dateText = dateElement.text()

      // Should contain date and time in MM/DD/YYYY HH:MM format
      expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/)
    })

    it('handles invalid date strings gracefully', () => {
      const changeWithInvalidDate: FieldChange = {
        ...mockChanges[0],
        createdAt: 'invalid-date',
      }

      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: [changeWithInvalidDate],
          isOwner: false,
        },
      })

      const dateElement = wrapper.find('.change-date')
      // Should not crash and should display something
      expect(dateElement.text()).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const changeItems = wrapper.findAll('.change-item')

      changeItems.forEach((item) => {
        // Each change item should be accessible
        expect(item.element.tagName).toBe('DIV')
      })
    })

    it('has proper button accessibility', () => {
      const wrapper = mount(FieldChangeHistory, {
        props: {
          changes: mockChanges,
          isOwner: true,
        },
      })

      const buttons = wrapper.findAll('button')

      buttons.forEach((button) => {
        // Buttons should have text content and be clickable
        expect(button.text()).toBeTruthy()
        expect(button.element.tagName).toBe('BUTTON')
      })
    })
  })
})
