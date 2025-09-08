import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../types/feature'

// Query keys for consistent cache management
export const featureSpecKeys = {
  all: ['featureSpecs'] as const,
  lists: () => [...featureSpecKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...featureSpecKeys.lists(), { filters }] as const,
  listByOrganization: (organizationId: string) =>
    [...featureSpecKeys.lists(), { organizationId }] as const,
  details: () => [...featureSpecKeys.all, 'detail'] as const,
  detail: (id: string) => [...featureSpecKeys.details(), id] as const,
}

// Transform database data to frontend format
const transformDbToFrontend = (dbData: any): FrontendFeatureSpec => {
  return {
    id: dbData.id,
    organizationId: dbData.organization_id,
    featureName: dbData.feature_name,
    author: dbData.author,
    date: new Date(dbData.created_at || dbData.date || new Date()),
    status: dbData.status,
    featureSummary: dbData.feature_summary,
    userGoals: dbData.user_goals || [],
    useCases: dbData.use_cases || [],
    successCriteria: dbData.success_criteria || [],
    reviewers: dbData.reviewers || [],
    targetUsers: dbData.target_users || [],
    coreInteractions: dbData.core_interactions || [],
    loadingStates: [],
    emptyStates: [],
    errorStates: [],
    formBehavior: undefined,
    layoutStructure: {
      desktop: { breakpoint: '>1200px', description: '' },
      tablet: { breakpoint: '768px-1200px', description: '' },
      mobile: { breakpoint: '<768px', description: '' },
    },
    visualHierarchy: {
      primaryElements: [],
      secondaryElements: [],
      tertiaryElements: [],
    },
    componentSpecs: [],
    typographyContent: {
      headlines: [],
      bodyText: [],
      labels: [],
      errorMessages: [],
      successMessages: [],
      emptyStateText: [],
    },
    accessibilityRequirements: {
      keyboardNavigation: {
        tabOrder: [],
        shortcuts: [],
        focusManagement: [],
      },
      screenReaderSupport: {
        labels: [],
        announcements: [],
        structure: [],
      },
      visualAccessibility: {
        colorRequirements: [],
        focusIndicators: [],
        textScaling: [],
      },
    },
    responsiveBehavior: {
      breakpointTransitions: [],
      touchInteractions: [],
    },
    animationRequirements: [],
    edgeCases: [],
    technicalConstraints: [],
    businessRules: [],
    approvals: [],
    createdAt: new Date(dbData.created_at || dbData.date || new Date()),
    updatedAt: new Date(dbData.updated_at || dbData.created_at || dbData.date || new Date()),
    version: dbData.version || '1.0.0',
  }
}

// Transform frontend data to database format
const transformFrontendToDb = (frontendData: FeatureSpecFormData, userId: string) => {
  return {
    organization_id: frontendData.organizationId,
    feature_name: frontendData.featureName,
    author: frontendData.author,
    status: frontendData.status,
    feature_summary: frontendData.featureSummary,
    author_id: userId,
    user_goals: frontendData.userGoals,
    use_cases: frontendData.useCases,
    success_criteria: frontendData.successCriteria,
    reviewers: frontendData.reviewers,
    target_users: frontendData.targetUsers,
    core_interactions: frontendData.coreInteractions,
  }
}

// API functions
const fetchFeatureSpecs = async (organizationId?: string): Promise<FrontendFeatureSpec[]> => {
  let query = supabase
    .from('feature_specs')
    .select(
      `
      *,
      success_criteria (*),
      reviewers (*),
      target_users (*),
      user_goals (*),
      use_cases (*),
      core_interactions (*)
    `,
    )
    .order('created_at', { ascending: false })

  // Filter by organization if provided
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query

  if (error) throw error

  return data?.map(transformDbToFrontend) || []
}

const fetchFeatureSpec = async (id: string): Promise<FrontendFeatureSpec> => {
  const { data, error } = await supabase
    .from('feature_specs')
    .select(
      `
      *,
      success_criteria (*),
      reviewers (*),
      target_users (*),
      user_goals (*),
      use_cases (*),
      core_interactions (*)
    `,
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return transformDbToFrontend(data)
}

const createFeatureSpec = async (formData: FeatureSpecFormData): Promise<FrontendFeatureSpec> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const dbData = transformFrontendToDb(formData, user.id)

  const { data, error } = await supabase
    .from('feature_specs')
    .insert(dbData)
    .select(
      `
      *,
      success_criteria (*),
      reviewers (*),
      target_users (*),
      user_goals (*),
      use_cases (*),
      core_interactions (*)
    `,
    )
    .single()

  if (error) throw error
  return transformDbToFrontend(data)
}

const updateFeatureSpec = async ({
  id,
  data: formData,
}: {
  id: string
  data: Partial<FeatureSpecFormData>
}): Promise<FrontendFeatureSpec> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const dbData = transformFrontendToDb(formData as FeatureSpecFormData, user.id)

  const { data, error } = await supabase
    .from('feature_specs')
    .update(dbData)
    .eq('id', id)
    .select(
      `
      *,
      success_criteria (*),
      reviewers (*),
      target_users (*),
      user_goals (*),
      use_cases (*),
      core_interactions (*)
    `,
    )
    .single()

  if (error) throw error
  return transformDbToFrontend(data)
}

const deleteFeatureSpec = async (id: string): Promise<void> => {
  const { error } = await supabase.from('feature_specs').delete().eq('id', id)

  if (error) throw error
}

// Composable
export function useFeatureSpecs(organizationId?: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query for fetching feature specs
  const {
    data: featureSpecs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: featureSpecKeys.list({ organizationId }),
    queryFn: () => fetchFeatureSpecs(organizationId),
    enabled: computed(() => isAuthenticated.value),
  })

  // Mutation for creating a new feature spec
  const createMutation = useMutation({
    mutationFn: createFeatureSpec,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureSpecKeys.lists() })
    },
  })

  // Mutation for updating a feature spec
  const updateMutation = useMutation({
    mutationFn: updateFeatureSpec,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: featureSpecKeys.lists() })
      queryClient.setQueryData(featureSpecKeys.detail(data.id), data)
    },
  })

  // Mutation for deleting a feature spec
  const deleteMutation = useMutation({
    mutationFn: deleteFeatureSpec,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: featureSpecKeys.lists() })
      queryClient.removeQueries({ queryKey: featureSpecKeys.detail(deletedId) })
    },
  })

  // Computed properties
  const specsByStatus = computed(() => {
    if (!featureSpecs.value) return {}

    return featureSpecs.value.reduce(
      (acc, spec) => {
        if (!acc[spec.status]) {
          acc[spec.status] = []
        }
        acc[spec.status].push(spec)
        return acc
      },
      {} as Record<string, FrontendFeatureSpec[]>,
    )
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
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Actions
    refetch,
    createSpec: createMutation.mutate,
    updateSpec: updateMutation.mutate,
    deleteSpec: deleteMutation.mutate,

    // Async actions
    createSpecAsync: createMutation.mutateAsync,
    updateSpecAsync: updateMutation.mutateAsync,
    deleteSpecAsync: deleteMutation.mutateAsync,
  }
}

// Composable for individual feature spec
export function useFeatureSpec(id: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: featureSpec,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: featureSpecKeys.detail(id),
    queryFn: () => {
      return fetchFeatureSpec(id)
    },
    enabled: computed(() => {
      const enabled = isAuthenticated.value && !!id
      return enabled
    }),
  })

  // Mutation for updating this specific feature spec
  const updateMutation = useMutation({
    mutationFn: updateFeatureSpec,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: featureSpecKeys.lists() })
      queryClient.setQueryData(featureSpecKeys.detail(id), data)
    },
  })

  return {
    featureSpec,
    isLoading,
    error,
    refetch,
    updateSpec: updateMutation.mutate,
    updateSpecAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  }
}
