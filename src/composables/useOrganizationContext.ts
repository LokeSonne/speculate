import { ref, computed, watch } from 'vue'
import { useOrganizations } from './useOrganizations'
import type { Organization } from '@/types/feature'

// Global organization context state
const currentOrganizationId = ref<string | null>(null)
const currentOrganization = ref<Organization | null>(null)

export function useOrganizationContext() {
  const {
    organizations,
    fetchUserOrganizations,
    fetchOrganizationDetails,
    setCurrentOrganization: setOrg,
  } = useOrganizations()

  // Set current organization by ID
  const setCurrentOrganization = async (organizationId: string) => {
    try {
      const org = organizations.value.find((o) => o.id === organizationId)
      if (org) {
        currentOrganizationId.value = organizationId
        currentOrganization.value = org
        setOrg(org)
      } else {
        // Fetch organization details if not in local cache
        const orgDetails = await fetchOrganizationDetails(organizationId)
        currentOrganizationId.value = organizationId
        currentOrganization.value = orgDetails
        setOrg(orgDetails)
      }
    } catch (error) {
      console.error('Failed to set current organization:', error)
    }
  }

  // Set current organization by object
  const setCurrentOrganizationByObject = (organization: Organization) => {
    currentOrganizationId.value = organization.id
    currentOrganization.value = organization
    setOrg(organization)
  }

  // Clear current organization
  const clearCurrentOrganization = () => {
    currentOrganizationId.value = null
    currentOrganization.value = null
    setOrg(null as any)
  }

  // Get organization by ID
  const getOrganizationById = (id: string) => {
    return organizations.value.find((org) => org.id === id)
  }

  // Watch for changes in organizations and update current if needed
  watch(organizations, (newOrgs) => {
    if (currentOrganizationId.value && !currentOrganization.value) {
      const org = newOrgs.find((o) => o.id === currentOrganizationId.value)
      if (org) {
        currentOrganization.value = org
        setOrg(org)
      }
    }
  })

  return {
    currentOrganizationId: computed(() => currentOrganizationId.value),
    currentOrganization: computed(() => currentOrganization.value),
    setCurrentOrganization,
    setCurrentOrganizationByObject,
    clearCurrentOrganization,
    getOrganizationById,
  }
}
