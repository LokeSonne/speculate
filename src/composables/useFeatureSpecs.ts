import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../types/feature'

// Storage key for local storage
const STORAGE_KEY = 'feature-specs'

// Mock API functions (replace with real API calls later)
const fetchFeatureSpecs = async (): Promise<FrontendFeatureSpec[]> => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

const createFeatureSpec = async (data: FeatureSpecFormData): Promise<FrontendFeatureSpec> => {
  const specs = await fetchFeatureSpecs()
  const newSpec: FrontendFeatureSpec = {
    id: crypto.randomUUID(),
    featureName: data.featureName,
    author: data.author,
    date: new Date(data.date),
    status: data.status as FrontendFeatureSpec['status'],
    reviewers: data.reviewers || [],
    featureSummary: data.featureSummary,
    successCriteria: data.successCriteria || [],
    targetUsers: data.targetUsers || [],
    userGoals: data.userGoals || [],
    useCases: data.useCases || [],
    coreInteractions: data.coreInteractions || [],
    loadingStates: data.loadingStates || [],
    emptyStates: data.emptyStates || [],
    errorStates: data.errorStates || [],
    formBehavior: data.formBehavior,
    layoutStructure: data.layoutStructure || {
      desktop: { breakpoint: '>1200px', description: '' },
      tablet: { breakpoint: '768-1199px', description: '' },
      mobile: { breakpoint: '<768px', description: '' }
    },
    visualHierarchy: data.visualHierarchy || {
      primaryElements: [],
      secondaryElements: [],
      tertiaryElements: []
    },
    componentSpecs: data.componentSpecs || [],
    typographyContent: data.typographyContent || {
      headlines: [],
      bodyText: [],
      labels: [],
      errorMessages: [],
      successMessages: [],
      emptyStateText: []
    },
    accessibilityRequirements: data.accessibilityRequirements || {
      keyboardNavigation: {
        tabOrder: [],
        shortcuts: [],
        focusManagement: []
      },
      screenReaderSupport: {
        labels: [],
        announcements: [],
        structure: []
      },
      visualAccessibility: {
        colorRequirements: [],
        focusIndicators: [],
        textScaling: []
      }
    },
    responsiveBehavior: data.responsiveBehavior || {
      breakpointTransitions: [],
      touchInteractions: []
    },
    animationRequirements: data.animationRequirements || [],
    edgeCases: data.edgeCases || [],
    technicalConstraints: data.technicalConstraints || [],
    businessRules: data.businessRules || [],
    approvals: data.approvals || [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0'
  }
  
  specs.push(newSpec)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(specs))
  return newSpec
}

const updateFeatureSpec = async (id: string, data: Partial<FrontendFeatureSpec>): Promise<FrontendFeatureSpec> => {
  const specs = await fetchFeatureSpecs()
  const index = specs.findIndex(spec => spec.id === id)
  
  if (index === -1) {
    throw new Error('Feature spec not found')
  }
  
  specs[index] = {
    ...specs[index],
    ...data,
    updatedAt: new Date()
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(specs))
  return specs[index]
}

const deleteFeatureSpec = async (id: string): Promise<void> => {
  const specs = await fetchFeatureSpecs()
  const filteredSpecs = specs.filter(spec => spec.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSpecs))
}

// Composable for managing feature specifications
export function useFeatureSpecs() {
  const queryClient = useQueryClient()
  
  // Query for fetching all feature specs
  const {
    data: featureSpecs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['featureSpecs'],
    queryFn: fetchFeatureSpecs
  })
  
  // Mutation for creating a new feature spec
  const createMutation = useMutation({
    mutationFn: createFeatureSpec,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureSpecs'] })
    }
  })
  
  // Mutation for updating a feature spec
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FrontendFeatureSpec> }) =>
      updateFeatureSpec(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureSpecs'] })
    }
  })
  
  // Mutation for deleting a feature spec
  const deleteMutation = useMutation({
    mutationFn: deleteFeatureSpec,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureSpecs'] })
    }
  })
  
  // Computed properties
  const specsByStatus = computed(() => {
    if (!featureSpecs.value) return {}
    
    return featureSpecs.value.reduce((acc, spec) => {
      if (!acc[spec.status]) {
        acc[spec.status] = []
      }
      acc[spec.status].push(spec)
      return acc
    }, {} as Record<string, FrontendFeatureSpec[]>)
  })
  
  const totalSpecs = computed(() => featureSpecs.value?.length || 0)
  
  const recentSpecs = computed(() => {
    if (!featureSpecs.value) return []
    
    return [...featureSpecs.value]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  })
  
  return {
    // Data
    featureSpecs,
    specsByStatus,
    totalSpecs,
    recentSpecs,
    
    // Loading states
    isLoading,
    isCreating: createMutation.isPending.value,
    isUpdating: updateMutation.isPending.value,
    isDeleting: deleteMutation.isPending.value,
    
    // Error states
    error,
    createError: createMutation.error.value,
    updateError: updateMutation.error.value,
    deleteError: deleteMutation.error.value,
    
    // Actions
    createSpec: createMutation.mutate,
    updateSpec: updateMutation.mutate,
    deleteSpec: deleteMutation.mutate,
    refetchSpecs: refetch
  }
}

// Composable for managing a single feature spec
export function useFeatureSpec(id: string) {
  const queryClient = useQueryClient()
  
  const {
    data: featureSpec,
    isLoading,
    error
  } = useQuery({
    queryKey: ['featureSpec', id],
    queryFn: async () => {
      const specs = await fetchFeatureSpecs()
      const spec = specs.find(s => s.id === id)
      if (!spec) {
        throw new Error('Feature spec not found')
      }
      return spec
    },
    enabled: !!id
  })
  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<FrontendFeatureSpec>) =>
      updateFeatureSpec(id, data),
    onSuccess: (updatedSpec) => {
      queryClient.setQueryData(['featureSpec', id], updatedSpec)
      queryClient.invalidateQueries({ queryKey: ['featureSpecs'] })
    }
  })
  
  return {
    featureSpec,
    isLoading,
    error,
    updateError: updateMutation.error.value,
    isUpdating: updateMutation.isPending.value,
    updateSpec: updateMutation.mutate
  }
}

// Composable for search and filtering
export function useFeatureSpecSearch() {
  const searchQuery = ref('')
  const statusFilter = ref<string>('')
  const authorFilter = ref('')
  
  const { featureSpecs } = useFeatureSpecs()
  
  const filteredSpecs = computed(() => {
    if (!featureSpecs.value) return []
    
    let filtered = featureSpecs.value
    
    // Search by feature name, author, or summary
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(spec =>
        spec.featureName.toLowerCase().includes(query) ||
        spec.author.toLowerCase().includes(query) ||
        spec.featureSummary.toLowerCase().includes(query)
      )
    }
    
    // Filter by status
    if (statusFilter.value) {
      filtered = filtered.filter(spec => spec.status === statusFilter.value)
    }
    
    // Filter by author
    if (authorFilter.value) {
      filtered = filtered.filter(spec =>
        spec.author.toLowerCase().includes(authorFilter.value.toLowerCase())
      )
    }
    
    return filtered
  })
  
  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = ''
    authorFilter.value = ''
  }
  
  return {
    searchQuery,
    statusFilter,
    authorFilter,
    filteredSpecs,
    clearFilters
  }
}
