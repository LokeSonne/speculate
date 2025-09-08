import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import { useOrganizationContext } from '../../composables/useOrganizationContext'
import type { Organization } from '../../types/feature'

// Mock the organizations composable
const mockOrganizations = [
  {
    id: 'org-1',
    name: 'Test Organization 1',
    slug: 'test-org-1',
    description: 'First test organization',
    logoUrl: 'https://example.com/logo1.png',
    settings: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'org-2',
    name: 'Test Organization 2',
    slug: 'test-org-2',
    description: 'Second test organization',
    logoUrl: 'https://example.com/logo2.png',
    settings: {},
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
]

const mockUseOrganizations = {
  organizations: { value: mockOrganizations },
  fetchUserOrganizations: vi.fn(),
  fetchOrganizationDetails: vi.fn(),
  setCurrentOrganization: vi.fn(),
}

vi.mock('../composables/useOrganizationsQuery', () => ({
  useOrganizations: () => mockUseOrganizations,
}))

// Helper function to create a test app with Vue Query
function createTestApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const app = createApp({
    template: '<div></div>',
  })

  app.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    },
  })

  return { app, queryClient }
}

describe('useOrganizationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no current organization', () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { currentOrganizationId, currentOrganization } = useOrganizationContext()

    expect(currentOrganizationId.value).toBe(null)
    expect(currentOrganization.value).toBe(null)
  })

  it('should set current organization by ID', async () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    await setCurrentOrganization('org-1')

    expect(currentOrganizationId.value).toBe('org-1')
    expect(currentOrganization.value).toEqual(mockOrganizations[0])
    expect(mockUseOrganizations.setCurrentOrganization).toHaveBeenCalledWith(mockOrganizations[0])
  })

  it('should set current organization by object', () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { setCurrentOrganizationByObject, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    setCurrentOrganizationByObject(mockOrganizations[1])

    expect(currentOrganizationId.value).toBe('org-2')
    expect(currentOrganization.value).toEqual(mockOrganizations[1])
    expect(mockUseOrganizations.setCurrentOrganization).toHaveBeenCalledWith(mockOrganizations[1])
  })

  it('should clear current organization', () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const {
      setCurrentOrganizationByObject,
      clearCurrentOrganization,
      currentOrganizationId,
      currentOrganization,
    } = useOrganizationContext()

    // First set an organization
    setCurrentOrganizationByObject(mockOrganizations[0])
    expect(currentOrganizationId.value).toBe('org-1')

    // Then clear it
    clearCurrentOrganization()

    expect(currentOrganizationId.value).toBe(null)
    expect(currentOrganization.value).toBe(null)
    expect(mockUseOrganizations.setCurrentOrganization).toHaveBeenCalledWith(null)
  })

  it('should get organization by ID', () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { getOrganizationById } = useOrganizationContext()

    const org1 = getOrganizationById('org-1')
    const org2 = getOrganizationById('org-2')
    const nonExistentOrg = getOrganizationById('org-999')

    expect(org1).toEqual(mockOrganizations[0])
    expect(org2).toEqual(mockOrganizations[1])
    expect(nonExistentOrg).toBeUndefined()
  })

  it('should handle setting organization that does not exist in local cache', async () => {
    const mockOrgDetails = {
      id: 'org-3',
      name: 'Remote Organization',
      slug: 'remote-org',
      description: 'Organization fetched from server',
      logoUrl: 'https://example.com/logo3.png',
      settings: {},
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      members: [],
      memberCount: 0,
    }

    mockUseOrganizations.fetchOrganizationDetails.mockResolvedValue(mockOrgDetails)

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    await setCurrentOrganization('org-3')

    expect(mockUseOrganizations.fetchOrganizationDetails).toHaveBeenCalledWith('org-3')
    expect(currentOrganizationId.value).toBe('org-3')
    expect(currentOrganization.value).toEqual(mockOrgDetails)
    expect(mockUseOrganizations.setCurrentOrganization).toHaveBeenCalledWith(mockOrgDetails)
  })

  it('should handle error when fetching organization details', async () => {
    const fetchError = new Error('Failed to fetch organization details')
    mockUseOrganizations.fetchOrganizationDetails.mockRejectedValue(fetchError)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    await setCurrentOrganization('org-3')

    expect(mockUseOrganizations.fetchOrganizationDetails).toHaveBeenCalledWith('org-3')
    expect(currentOrganizationId.value).toBe(null)
    expect(currentOrganization.value).toBe(null)
    expect(consoleSpy).toHaveBeenCalledWith('Failed to set current organization:', fetchError)

    consoleSpy.mockRestore()
  })

  it('should watch for changes in organizations and update current if needed', async () => {
    const { app } = createTestApp()
    mount(app, {
      global: {
        plugins: [VueQueryPlugin],
      },
    })

    const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
      useOrganizationContext()

    // Set organization ID but not the object
    currentOrganizationId.value = 'org-1'
    currentOrganization.value = null

    // Simulate organizations being loaded
    mockUseOrganizations.organizations.value = mockOrganizations

    // Wait for watcher to trigger
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(currentOrganization.value).toEqual(mockOrganizations[0])
    expect(mockUseOrganizations.setCurrentOrganization).toHaveBeenCalledWith(mockOrganizations[0])
  })
})
