import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import FloatingReviewCard from '../../components/FloatingReviewCard.vue'
import type { Reviewer } from '../../types/feature'

// Mock Reka-ui components
vi.mock('reka-ui', () => ({
  ComboboxRoot: {
    name: 'ComboboxRoot',
    template: '<div class="combobox-root"><slot /></div>',
    props: ['modelValue', 'multiple'],
  },
  ComboboxAnchor: {
    name: 'ComboboxAnchor',
    template: '<div class="combobox-anchor"><slot /></div>',
  },
  ComboboxInput: {
    name: 'ComboboxInput',
    template: '<input class="combobox-input" v-bind="$attrs" />',
    props: ['placeholder'],
  },
  ComboboxTrigger: {
    name: 'ComboboxTrigger',
    template: '<button class="combobox-trigger"><slot /></button>',
  },
  ComboboxContent: {
    name: 'ComboboxContent',
    template: '<div class="combobox-content"><slot /></div>',
  },
  ComboboxViewport: {
    name: 'ComboboxViewport',
    template: '<div class="combobox-viewport"><slot /></div>',
  },
  ComboboxEmpty: {
    name: 'ComboboxEmpty',
    template: '<div class="combobox-empty"><slot /></div>',
  },
  ComboboxGroup: {
    name: 'ComboboxGroup',
    template: '<div class="combobox-group"><slot /></div>',
  },
  ComboboxLabel: {
    name: 'ComboboxLabel',
    template: '<div class="combobox-label"><slot /></div>',
  },
  ComboboxSeparator: {
    name: 'ComboboxSeparator',
    template: '<div class="combobox-separator"></div>',
  },
  ComboboxItem: {
    name: 'ComboboxItem',
    template: '<div class="combobox-item" @click="$emit(\'select\')"><slot /></div>',
    props: ['value'],
  },
  ComboboxItemIndicator: {
    name: 'ComboboxItemIndicator',
    template: '<div class="combobox-item-indicator"><slot /></div>',
  },
  AvatarRoot: {
    name: 'AvatarRoot',
    template: '<div class="avatar"><slot /></div>',
  },
  AvatarImage: {
    name: 'AvatarImage',
    template: '<img class="avatar-image" v-bind="$attrs" />',
    props: ['src', 'alt'],
  },
  AvatarFallback: {
    name: 'AvatarFallback',
    template: '<div class="avatar-fallback"><slot /></div>',
  },
  PopoverRoot: {
    name: 'PopoverRoot',
    template: '<div class="popover-root"><slot /></div>',
    props: ['open'],
  },
  PopoverTrigger: {
    name: 'PopoverTrigger',
    template: '<div class="popover-trigger"><slot /></div>',
    props: ['asChild'],
  },
  PopoverContent: {
    name: 'PopoverContent',
    template: '<div class="popover-content"><slot /></div>',
  },
}))

// Mock icons
vi.mock('../../icons/ChevronDownIcon.vue', () => ({
  default: {
    name: 'ChevronDownIcon',
    template: '<svg class="chevron-down-icon" v-bind="$attrs" />',
    props: ['size'],
  },
}))

vi.mock('../../icons/CheckIcon.vue', () => ({
  default: {
    name: 'CheckIcon',
    template: '<svg class="check-icon" v-bind="$attrs" />',
    props: ['size'],
  },
}))

vi.mock('../../icons/DeleteIcon.vue', () => ({
  default: {
    name: 'DeleteIcon',
    template: '<svg class="delete-icon" v-bind="$attrs" />',
    props: ['size'],
  },
}))

vi.mock('../../icons/PlusIcon.vue', () => ({
  default: {
    name: 'PlusIcon',
    template: '<svg class="plus-icon" v-bind="$attrs" />',
    props: ['size'],
  },
}))

// Mock the new Combobox component
vi.mock('../../components/ui/Combobox.vue', () => ({
  default: {
    name: 'Combobox',
    template: '<div class="combobox-component"><slot /></div>',
    props: ['modelValue', 'multiple', 'placeholder', 'emptyText', 'options'],
    emits: ['update:modelValue'],
  },
}))

describe('FloatingReviewCard', () => {
  const mockReviewers: Reviewer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/john.jpg',
      role: 'Product',
      status: 'pending',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Design',
      status: 'approved',
    },
  ]

  const mockAvailableUsers = [
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      avatar: 'https://example.com/bob.jpg',
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
    },
  ]

  let wrapper: any

  beforeEach(() => {
    wrapper = mount(FloatingReviewCard, {
      props: {
        reviewers: mockReviewers,
        availableUsers: mockAvailableUsers,
      },
    })
  })

  describe('Component Rendering', () => {
    it('renders the review sidepanel with header and content', () => {
      expect(wrapper.find('.review-sidepanel').exists()).toBe(true)
      expect(wrapper.find('.review-sidepanel-header').exists()).toBe(true)
      expect(wrapper.find('.review-sidepanel-content').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Reviewers')
    })

    it('shows toggle button in header', () => {
      const toggleButton = wrapper.find('.toggle-button')
      expect(toggleButton.exists()).toBe(true)
      // The toggle button should be clickable
      expect(toggleButton.element.tagName).toBe('BUTTON')
    })

    it('renders add reviewers section', () => {
      expect(wrapper.find('.add-reviewers-section').exists()).toBe(true)
      expect(wrapper.find('.add-reviewer-button').exists()).toBe(true)
      expect(wrapper.find('.plus-icon').exists()).toBe(true)
    })

    it('renders current reviewers section', () => {
      expect(wrapper.find('.current-reviewers-section').exists()).toBe(true)
      expect(wrapper.find('.reviewers-list').exists()).toBe(true)
    })
  })

  describe('Reviewer Display', () => {
    it('displays all current reviewers', () => {
      const reviewerItems = wrapper.findAll('.reviewer-item')
      expect(reviewerItems).toHaveLength(2)
    })

    it('shows reviewer information correctly', () => {
      const firstReviewer = wrapper.find('.reviewer-item')
      expect(firstReviewer.find('.reviewer-name').text()).toBe('John Doe')
      expect(firstReviewer.find('.reviewer-role').text()).toBe('Product')
    })

    it('displays reviewer avatars', () => {
      const avatars = wrapper.findAllComponents({ name: 'AvatarRoot' })
      expect(avatars.length).toBeGreaterThan(0)
    })

    it('shows correct status badges', () => {
      const statusBadges = wrapper.findAll('.status-badge')
      expect(statusBadges[0].text()).toBe('pending')
      expect(statusBadges[0].classes()).toContain('status-pending')
      expect(statusBadges[1].text()).toBe('approved')
      expect(statusBadges[1].classes()).toContain('status-approved')
    })

    it('shows remove buttons for each reviewer', () => {
      const removeButtons = wrapper.findAll('.remove-button')
      expect(removeButtons).toHaveLength(2)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no reviewers', async () => {
      await wrapper.setProps({ reviewers: [] })
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-state').text()).toBe('No reviewers assigned')
    })
  })

  describe('User Selection', () => {
    it('renders add reviewer button with plus icon', () => {
      const addButton = wrapper.find('.add-reviewer-button')
      expect(addButton.exists()).toBe(true)
      expect(addButton.find('.plus-icon').exists()).toBe(true)
      expect(addButton.text()).toContain('Add Reviewer')
    })

    it('has popover components available', () => {
      expect(wrapper.findComponent({ name: 'PopoverRoot' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'PopoverTrigger' }).exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'PopoverContent' }).exists()).toBe(true)
    })

    it('has combobox components available', () => {
      const comboboxComponent = wrapper.findComponent({ name: 'Combobox' })
      expect(comboboxComponent.exists()).toBe(true)
      expect(comboboxComponent.props('multiple')).toBe(true)
    })
  })

  describe('Add Reviewers Functionality', () => {
    it('has add reviewer button that can be clicked', async () => {
      const addButton = wrapper.find('.add-reviewer-button')
      expect(addButton.exists()).toBe(true)

      // Test that the button can be clicked without errors
      await addButton.trigger('click')
      expect(addButton.exists()).toBe(true) // Button still exists after click
    })

    it('has proper component structure for reviewer selection', () => {
      // Check that all necessary components are present
      expect(wrapper.find('.add-reviewer-button').exists()).toBe(true)
      expect(wrapper.find('.popover-content').exists()).toBe(true)
      expect(wrapper.find('.reviewer-combobox').exists()).toBe(true)
    })

    it('allows selecting users and adding them as reviewers automatically', async () => {
      const comboboxComponent = wrapper.findComponent({ name: 'Combobox' })
      expect(comboboxComponent.exists()).toBe(true)

      // Simulate selecting users in the combobox
      await comboboxComponent.vm.$emit('update:modelValue', ['3', '4'])
      await wrapper.vm.$nextTick()

      // Check that update-reviewers event was emitted with new reviewers
      expect(wrapper.emitted('update-reviewers')).toBeTruthy()
      const emittedReviewers = wrapper.emitted('update-reviewers')[0][0]
      expect(emittedReviewers).toHaveLength(4) // Original 2 + 2 new ones

      // Check that the new reviewers are included
      const newReviewerNames = emittedReviewers.map((r) => r.name)
      expect(newReviewerNames).toContain('Bob Johnson')
      expect(newReviewerNames).toContain('Alice Brown')

      // Check that selection is reset and popover is closed after processing
      expect(wrapper.vm.selectedUsers).toEqual([])
      expect(wrapper.vm.isPopoverOpen).toBe(false)
    })

    it('does not add reviewers when no users are selected', async () => {
      const comboboxComponent = wrapper.findComponent({ name: 'Combobox' })

      // Simulate selecting no users
      await comboboxComponent.vm.$emit('update:modelValue', [])
      await wrapper.vm.$nextTick()

      // Check that no update-reviewers event was emitted
      expect(wrapper.emitted('update-reviewers')).toBeFalsy()
    })
  })

  describe('Remove Reviewer Functionality', () => {
    it('emits update-reviewers event when removing reviewer', async () => {
      const removeButton = wrapper.find('.remove-button')
      await removeButton.trigger('click')

      expect(wrapper.emitted('update-reviewers')).toBeTruthy()
      expect(wrapper.emitted('update-reviewers')[0][0]).toHaveLength(1) // One less reviewer
    })

    it('removes correct reviewer', async () => {
      const removeButton = wrapper.find('.remove-button')
      await removeButton.trigger('click')

      const updatedReviewers = wrapper.emitted('update-reviewers')[0][0]
      expect(updatedReviewers).toHaveLength(1)
      expect(updatedReviewers[0].name).toBe('Jane Smith') // John Doe should be removed
    })
  })

  describe('Toggle Functionality', () => {
    it('toggles expanded state when toggle button is clicked', async () => {
      const toggleButton = wrapper.find('.toggle-button')
      expect(wrapper.vm.isExpanded).toBe(true)

      await toggleButton.trigger('click')
      expect(wrapper.vm.isExpanded).toBe(false)

      await toggleButton.trigger('click')
      expect(wrapper.vm.isExpanded).toBe(true)
    })

    it('applies expanded class to toggle button', async () => {
      const toggleButton = wrapper.find('.toggle-button')
      expect(toggleButton.classes()).toContain('expanded')

      await toggleButton.trigger('click')
      expect(toggleButton.classes()).not.toContain('expanded')
    })

    it('hides content when collapsed', async () => {
      const toggleButton = wrapper.find('.toggle-button')
      await toggleButton.trigger('click')

      // When collapsed, the content should not exist due to v-if
      const content = wrapper.find('.review-sidepanel-content')
      expect(content.exists()).toBe(false)
      expect(wrapper.vm.isExpanded).toBe(false)
    })
  })

  describe('Utility Functions', () => {
    it('generates correct initials from names', () => {
      expect(wrapper.vm.getInitials('John Doe')).toBe('JD')
      expect(wrapper.vm.getInitials('Jane Smith')).toBe('JS')
      expect(wrapper.vm.getInitials('Bob')).toBe('B')
      expect(wrapper.vm.getInitials('Alice Brown Johnson')).toBe('AB')
    })
  })

  describe('Props Handling', () => {
    it('uses provided availableUsers when available', () => {
      expect(wrapper.vm.availableUsers).toHaveLength(2)
      expect(wrapper.vm.availableUsers[0].name).toBe('Bob Johnson')
    })

    it('falls back to mock users when no availableUsers provided', async () => {
      await wrapper.setProps({ availableUsers: [] })
      // Should have 2 mock users (Bob and Alice) since John and Jane are already reviewers
      expect(wrapper.vm.availableUsers).toHaveLength(2)
    })
  })
})
