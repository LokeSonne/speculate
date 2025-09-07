import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { QueryClient } from '@tanstack/vue-query'
import FieldChangeHistory from '../../components/FieldChangeHistory.vue'

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

describe('FieldChangeHistory Component - Direct Test', () => {
  it('should display field changes when provided with data', () => {
    const mockFieldChanges = [
      {
        id: 'fc-5',
        featureSpecId: 'mock-spec-2',
        fieldPath: 'featureName',
        fieldType: 'string',
        oldValue: 'User Profile Management',
        newValue: 'Advanced User Profile Management',
        changeDescription: 'Added "Advanced" to better describe the feature capabilities',
        authorId: 'mock-user-1',
        authorEmail: 'john@example.com',
        status: 'pending',
        createdAt: '2024-01-21T09:15:00.000Z',
        updatedAt: '2024-01-21T09:15:00.000Z',
      },
      {
        id: 'fc-6',
        featureSpecId: 'mock-spec-2',
        fieldPath: 'successCriteria.0.description',
        fieldType: 'string',
        oldValue: 'Users can update their profile information',
        newValue: 'Users can update their profile information with real-time validation',
        changeDescription: 'Added real-time validation requirement',
        authorId: 'mock-user-2',
        authorEmail: 'jane@example.com',
        status: 'accepted',
        createdAt: '2024-01-21T10:30:00.000Z',
        updatedAt: '2024-01-21T11:00:00.000Z',
        acceptedAt: '2024-01-21T11:00:00.000Z',
        acceptedBy: 'mock-user-1',
      },
    ]

    const wrapper = mountWithRealQueryClient(FieldChangeHistory, {
      props: {
        changes: mockFieldChanges,
        isOwner: true,
        loading: false,
      },
    })

    // Check that the component renders
    expect(wrapper.exists()).toBe(true)

    // Check that it shows the field changes
    const html = wrapper.html()
    expect(html).toContain('Advanced User Profile Management')
    expect(html).toContain('Added "Advanced" to better describe the feature capabilities')
    expect(html).toContain('john@example.com')
    expect(html).toContain('pending')

    expect(html).toContain('Users can update their profile information with real-time validation')
    expect(html).toContain('Added real-time validation requirement')
    expect(html).toContain('jane@example.com')
    expect(html).toContain('accepted')
  })

  it('should show "No changes yet" when no data is provided', () => {
    const wrapper = mountWithRealQueryClient(FieldChangeHistory, {
      props: {
        changes: [],
        isOwner: true,
        loading: false,
      },
    })

    const html = wrapper.html()
    expect(html).toContain('No changes yet')
  })
})
