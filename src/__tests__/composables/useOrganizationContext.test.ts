import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { testComposable } from '../utils/testHelpers'
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

vi.mock('../../composables/useOrganizationsQuery', () => ({
  useOrganizations: () => mockUseOrganizations,
}))

describe('useOrganizationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no current organization', () => {
    const wrapper = testComposable(() => {
      const { currentOrganizationId, currentOrganization } = useOrganizationContext()
      return { currentOrganizationId, currentOrganization }
    })

    expect(wrapper.vm.currentOrganizationId).toBe(null)
    expect(wrapper.vm.currentOrganization).toBe(null)
  })

  it.skip('should set current organization by ID when organization exists in cache', async () => {
    const wrapper = testComposable(() => {
      const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return { setCurrentOrganization, currentOrganizationId, currentOrganization }
    })

    await wrapper.vm.setCurrentOrganization('org-1')

    expect(wrapper.vm.currentOrganizationId).toBe('org-1')
    expect(wrapper.vm.currentOrganization).toEqual(mockOrganizations[0])
  })

  it('should set current organization by object', () => {
    const wrapper = testComposable(() => {
      const { setCurrentOrganizationByObject, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return { setCurrentOrganizationByObject, currentOrganizationId, currentOrganization }
    })

    wrapper.vm.setCurrentOrganizationByObject(mockOrganizations[1])

    expect(wrapper.vm.currentOrganizationId).toBe('org-2')
    expect(wrapper.vm.currentOrganization).toEqual(mockOrganizations[1])
  })

  it('should clear current organization', () => {
    const wrapper = testComposable(() => {
      const {
        setCurrentOrganizationByObject,
        clearCurrentOrganization,
        currentOrganizationId,
        currentOrganization,
      } = useOrganizationContext()
      return {
        setCurrentOrganizationByObject,
        clearCurrentOrganization,
        currentOrganizationId,
        currentOrganization,
      }
    })

    // First set an organization
    wrapper.vm.setCurrentOrganizationByObject(mockOrganizations[0])
    expect(wrapper.vm.currentOrganizationId).toBe('org-1')

    // Then clear it
    wrapper.vm.clearCurrentOrganization()

    expect(wrapper.vm.currentOrganizationId).toBe(null)
    expect(wrapper.vm.currentOrganization).toBe(null)
  })

  it.skip('should get organization by ID', () => {
    const wrapper = testComposable(() => {
      const { getOrganizationById } = useOrganizationContext()
      return { getOrganizationById }
    })

    const org1 = wrapper.vm.getOrganizationById('org-1')
    const org2 = wrapper.vm.getOrganizationById('org-2')
    const nonExistentOrg = wrapper.vm.getOrganizationById('org-999')

    expect(org1).toEqual(mockOrganizations[0])
    expect(org2).toEqual(mockOrganizations[1])
    expect(nonExistentOrg).toBeUndefined()
  })

  it.skip('should handle setting organization that does not exist in local cache', async () => {
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

    const wrapper = testComposable(() => {
      const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return { setCurrentOrganization, currentOrganizationId, currentOrganization }
    })

    await wrapper.vm.setCurrentOrganization('org-3')

    // Verify the state was updated correctly
    expect(wrapper.vm.currentOrganizationId).toBe('org-3')
    expect(wrapper.vm.currentOrganization).toEqual(mockOrgDetails)
  })

  it.skip('should handle error when fetching organization details', async () => {
    const fetchError = new Error('Failed to fetch organization details')
    mockUseOrganizations.fetchOrganizationDetails.mockRejectedValue(fetchError)

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = testComposable(() => {
      const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return { setCurrentOrganization, currentOrganizationId, currentOrganization }
    })

    await wrapper.vm.setCurrentOrganization('org-3')

    // Verify the state remains unchanged on error
    expect(wrapper.vm.currentOrganizationId).toBe(null)
    expect(wrapper.vm.currentOrganization).toBe(null)
    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalledWith('Failed to set current organization:', fetchError)

    consoleSpy.mockRestore()
  })

  it.skip('should watch for changes in organizations and update current if needed', async () => {
    const wrapper = testComposable(() => {
      const { setCurrentOrganization, currentOrganizationId, currentOrganization } =
        useOrganizationContext()
      return { setCurrentOrganization, currentOrganizationId, currentOrganization }
    })

    // Set organization ID but not the object
    wrapper.vm.currentOrganizationId = 'org-1'
    wrapper.vm.currentOrganization = null

    // Simulate organizations being loaded
    mockUseOrganizations.organizations.value = mockOrganizations

    // Wait for watcher to trigger
    await flushPromises()

    // Verify the organization was found and set
    expect(wrapper.vm.currentOrganization).toEqual(mockOrganizations[0])
  })
})
