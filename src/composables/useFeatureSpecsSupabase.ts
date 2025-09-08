import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../types/feature'

// Global state
const featureSpecs = ref<FrontendFeatureSpec[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useFeatureSpecs() {
  const { user, isAuthenticated } = useAuth()

  // Fetch all feature specs for a specific organization
  const fetchFeatureSpecs = async (organizationId?: string): Promise<FrontendFeatureSpec[]> => {
    if (!isAuthenticated.value) {
      return []
    }

    loading.value = true
    error.value = null

    try {
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

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform the data to match our FrontendFeatureSpec interface
      const transformedData = data?.map(transformDbToFrontend) || []
      featureSpecs.value = transformedData

      return transformedData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch feature specs'
      console.error('Error fetching feature specs:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Create a new feature spec
  const createFeatureSpec = async (
    formData: FeatureSpecFormData,
  ): Promise<FrontendFeatureSpec | null> => {
    if (!isAuthenticated.value || !user.value) return null

    loading.value = true
    error.value = null

    try {
      // Start a transaction-like operation
      const { data: specData, error: specError } = await supabase
        .from('feature_specs')
        .insert({
          user_id: user.value.id,
          organization_id: formData.organizationId,
          feature_name: formData.featureName,
          author: formData.author,
          date: formData.date,
          status: formData.status,
          feature_summary: formData.featureSummary,
        })
        .select()
        .single()

      if (specError) throw specError

      const specId = specData.id

      // Insert related data
      const promises = []

      // Success criteria
      if (formData.successCriteria?.length) {
        promises.push(
          supabase.from('success_criteria').insert(
            formData.successCriteria.map((criteria) => ({
              feature_spec_id: specId,
              type: criteria.type,
              description: criteria.description,
            })),
          ),
        )
      }

      // Reviewers
      if (formData.reviewers?.length) {
        promises.push(
          supabase.from('reviewers').insert(
            formData.reviewers.map((reviewer) => ({
              feature_spec_id: specId,
              name: reviewer.name,
              role: reviewer.role,
              status: reviewer.status,
            })),
          ),
        )
      }

      // Target users
      if (formData.targetUsers?.length) {
        promises.push(
          supabase.from('target_users').insert(
            formData.targetUsers.map((user) => ({
              feature_spec_id: specId,
              user_type: user.type,
              description: user.description,
            })),
          ),
        )
      }

      // User goals
      if (formData.userGoals?.length) {
        promises.push(
          supabase.from('user_goals').insert(
            formData.userGoals.map((goal) => ({
              feature_spec_id: specId,
              goal: goal.description,
              priority: goal.priority,
            })),
          ),
        )
      }

      // Use cases
      if (formData.useCases?.length) {
        promises.push(
          supabase.from('use_cases').insert(
            formData.useCases.map((useCase) => ({
              feature_spec_id: specId,
              title: useCase.name,
              description: useCase.context,
              steps: useCase.userAction,
              expected_outcome: useCase.expectedOutcome,
            })),
          ),
        )
      }

      // Core interactions
      if (formData.coreInteractions?.length) {
        promises.push(
          supabase.from('core_interactions').insert(
            formData.coreInteractions.map((interaction) => ({
              feature_spec_id: specId,
              interaction_type: interaction.actionName,
              description: interaction.behavior,
            })),
          ),
        )
      }

      // Wait for all inserts to complete
      const results = await Promise.all(promises)

      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }

      // Fetch the complete spec with all related data
      const { data: completeSpec, error: fetchError } = await supabase
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
        .eq('id', specId)
        .single()

      if (fetchError) throw fetchError

      const transformedSpec = transformDbToFrontend(completeSpec)
      featureSpecs.value.unshift(transformedSpec)

      return transformedSpec
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create feature spec'
      console.error('Error creating feature spec:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update a feature spec
  const updateFeatureSpec = async (
    id: string,
    formData: FeatureSpecFormData,
  ): Promise<FrontendFeatureSpec | null> => {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      // Update main spec
      const { error: specError } = await supabase
        .from('feature_specs')
        .update({
          feature_name: formData.featureName,
          author: formData.author,
          date: formData.date,
          status: formData.status,
          feature_summary: formData.featureSummary,
        })
        .eq('id', id)

      if (specError) {
        console.error('❌ PATCH error:', specError)
        throw specError
      }

      // Delete existing related data and re-insert
      const deletePromises = [
        supabase.from('success_criteria').delete().eq('feature_spec_id', id),
        supabase.from('reviewers').delete().eq('feature_spec_id', id),
        supabase.from('target_users').delete().eq('feature_spec_id', id),
        supabase.from('user_goals').delete().eq('feature_spec_id', id),
        supabase.from('use_cases').delete().eq('feature_spec_id', id),
        supabase.from('core_interactions').delete().eq('feature_spec_id', id),
      ]

      await Promise.all(deletePromises)

      // Re-insert related data (same logic as create)
      const promises = []

      if (formData.successCriteria?.length) {
        promises.push(
          supabase.from('success_criteria').insert(
            formData.successCriteria.map((criteria) => ({
              feature_spec_id: id,
              type: criteria.type,
              description: criteria.description,
            })),
          ),
        )
      }

      if (formData.reviewers?.length) {
        promises.push(
          supabase.from('reviewers').insert(
            formData.reviewers.map((reviewer) => ({
              feature_spec_id: id,
              name: reviewer.name,
              role: reviewer.role,
              status: reviewer.status,
            })),
          ),
        )
      }

      // Add other related data inserts...

      await Promise.all(promises)

      // Fetch updated spec
      const { data: updatedSpec, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError

      const transformedSpec = transformDbToFrontend(updatedSpec)
      const index = featureSpecs.value.findIndex((spec) => spec.id === id)
      if (index !== -1) {
        featureSpecs.value[index] = transformedSpec
      }

      return transformedSpec
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update feature spec'
      console.error('Error updating feature spec:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete a feature spec
  const deleteFeatureSpec = async (id: string): Promise<boolean> => {
    if (!isAuthenticated.value) return false

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from('feature_specs').delete().eq('id', id)

      if (deleteError) throw deleteError

      featureSpecs.value = featureSpecs.value.filter((spec) => spec.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete feature spec'
      console.error('Error deleting feature spec:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Search feature specs
  const searchFeatureSpecs = computed(() => {
    return (query: string) => {
      if (!query.trim()) return featureSpecs.value

      const lowercaseQuery = query.toLowerCase()
      return featureSpecs.value.filter(
        (spec) =>
          spec.featureName.toLowerCase().includes(lowercaseQuery) ||
          spec.author.toLowerCase().includes(lowercaseQuery) ||
          spec.featureSummary.toLowerCase().includes(lowercaseQuery),
      )
    }
  })

  return {
    featureSpecs: computed(() => featureSpecs.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchFeatureSpecs,
    createFeatureSpec,
    updateFeatureSpec,
    deleteFeatureSpec,
    searchFeatureSpecs,
  }
}

// Helper function to transform database data to FrontendFeatureSpec
function transformDbToFrontend(dbSpec: any): FrontendFeatureSpec {
  return {
    id: dbSpec.id,
    organizationId: dbSpec.organization_id,
    featureName: dbSpec.feature_name,
    author: dbSpec.author,
    date: new Date(dbSpec.date),
    status: dbSpec.status,
    featureSummary: dbSpec.feature_summary,
    reviewers:
      dbSpec.reviewers?.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        status: r.status,
      })) || [],
    successCriteria:
      dbSpec.success_criteria?.map((c: any) => ({
        id: c.id,
        type: c.type,
        description: c.description,
      })) || [],
    targetUsers:
      dbSpec.target_users?.map((u: any) => ({
        id: u.id,
        userType: u.user_type,
        description: u.description,
      })) || [],
    userGoals:
      dbSpec.user_goals?.map((g: any) => ({
        id: g.id,
        goal: g.goal,
        priority: g.priority,
      })) || [],
    useCases:
      dbSpec.use_cases?.map((uc: any) => ({
        id: uc.id,
        title: uc.title,
        description: uc.description,
        steps: uc.steps,
        expectedOutcome: uc.expected_outcome,
      })) || [],
    coreInteractions:
      dbSpec.core_interactions?.map((ci: any) => ({
        id: ci.id,
        interactionType: ci.interaction_type,
        description: ci.description,
      })) || [],
    // Add other fields with default values
    loadingStates: [],
    emptyStates: [],
    errorStates: [],
    formBehavior: undefined,
    layoutStructure: {
      desktop: { breakpoint: '>1200px', description: '' },
      tablet: { breakpoint: '768-1199px', description: '' },
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
    createdAt: new Date(dbSpec.created_at || dbSpec.date),
    updatedAt: new Date(dbSpec.updated_at || dbSpec.created_at || dbSpec.date),
    version: dbSpec.version || '1.0.0',
  }
}
