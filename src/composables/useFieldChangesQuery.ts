import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { FieldChange, CreateFieldChangeData, FieldChangeStatus } from '../types/feature'

// Query keys for consistent cache management
export const fieldChangeKeys = {
  all: ['fieldChanges'] as const,
  lists: () => [...fieldChangeKeys.all, 'list'] as const,
  list: (featureSpecId: string) => [...fieldChangeKeys.lists(), featureSpecId] as const,
  byField: (featureSpecId: string, fieldPath: string) =>
    [...fieldChangeKeys.list(featureSpecId), fieldPath] as const,
  accepted: (featureSpecId: string, fieldPath: string) =>
    [...fieldChangeKeys.byField(featureSpecId, fieldPath), 'accepted'] as const,
  pending: (featureSpecId: string, fieldPath: string) =>
    [...fieldChangeKeys.byField(featureSpecId, fieldPath), 'pending'] as const,
}

// Helper function to transform database field names to interface field names
const transformFieldChange = (dbChange: Record<string, unknown>): FieldChange => ({
  id: dbChange.id as string,
  featureSpecId: dbChange.feature_spec_id as string,
  fieldPath: dbChange.field_path as string,
  fieldType: dbChange.field_type as 'string' | 'array' | 'object',
  oldValue: dbChange.old_value,
  newValue: dbChange.new_value,
  changeDescription: dbChange.change_description as string | undefined,
  authorId: dbChange.author_id as string,
  authorEmail: dbChange.author_email as string,
  status: dbChange.status as FieldChangeStatus,
  createdAt: dbChange.created_at as string,
  updatedAt: dbChange.updated_at as string,
  acceptedAt: dbChange.accepted_at as string | undefined,
  acceptedBy: dbChange.accepted_by as string | undefined,
  rejectedAt: dbChange.rejected_at as string | undefined,
  rejectedBy: dbChange.rejected_by as string | undefined,
})

// API functions
const fetchFieldChanges = async (featureSpecId: string): Promise<FieldChange[]> => {
  const { data, error } = await supabase
    .from('field_changes')
    .select('*')
    .eq('feature_spec_id', featureSpecId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(transformFieldChange)
}

const fetchFieldChangesByField = async (
  featureSpecId: string,
  fieldPath: string,
): Promise<FieldChange[]> => {
  const { data, error } = await supabase
    .from('field_changes')
    .select('*')
    .eq('feature_spec_id', featureSpecId)
    .eq('field_path', fieldPath)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(transformFieldChange)
}

const createFieldChange = async (changeData: CreateFieldChangeData): Promise<FieldChange> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('field_changes')
    .insert({
      feature_spec_id: changeData.featureSpecId,
      field_path: changeData.fieldPath,
      field_type: changeData.fieldType,
      old_value: changeData.oldValue,
      new_value: changeData.newValue,
      change_description: changeData.changeDescription,
      author_id: user.id,
      author_email: user.email || 'Unknown',
    })
    .select()
    .single()

  if (error) throw error
  return transformFieldChange(data)
}

const updateFieldChangeStatus = async ({
  changeId,
  status,
}: {
  changeId: string
  status: FieldChangeStatus
}): Promise<FieldChange> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString()
    updateData.accepted_by = user.id
  } else if (status === 'rejected') {
    updateData.rejected_at = new Date().toISOString()
    updateData.rejected_by = user.id
  }

  const { data, error } = await supabase
    .from('field_changes')
    .update(updateData)
    .eq('id', changeId)
    .select()
    .single()

  if (error) throw error
  return transformFieldChange(data)
}

// Composable for field changes
export function useFieldChanges(featureSpecId: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query for fetching all field changes for a feature spec
  const {
    data: fieldChanges,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: fieldChangeKeys.list(featureSpecId),
    queryFn: () => fetchFieldChanges(featureSpecId),
    enabled: computed(() => isAuthenticated.value && !!featureSpecId),
  })

  // Mutation for creating a new field change
  const createMutation = useMutation({
    mutationFn: createFieldChange,
    onSuccess: (data) => {
      // Invalidate and refetch field changes for this feature spec
      queryClient.invalidateQueries({ queryKey: fieldChangeKeys.list(featureSpecId) })
      // Also invalidate specific field queries
      queryClient.invalidateQueries({
        queryKey: fieldChangeKeys.byField(featureSpecId, data.fieldPath),
      })
    },
  })

  // Mutation for updating field change status
  const updateStatusMutation = useMutation({
    mutationFn: updateFieldChangeStatus,
    onSuccess: (data) => {
      // Invalidate and refetch field changes for this feature spec
      queryClient.invalidateQueries({ queryKey: fieldChangeKeys.list(featureSpecId) })
      // Also invalidate specific field queries
      queryClient.invalidateQueries({
        queryKey: fieldChangeKeys.byField(featureSpecId, data.fieldPath),
      })
    },
  })

  // Helper functions
  const getFieldChanges = (fieldPath: string) => {
    return computed(() => {
      if (!fieldChanges.value) return []
      return fieldChanges.value.filter((change) => change.fieldPath === fieldPath)
    })
  }

  const getAcceptedFieldChanges = (fieldPath: string) => {
    return computed(() => {
      if (!fieldChanges.value) return []
      return fieldChanges.value.filter(
        (change) => change.fieldPath === fieldPath && change.status === 'accepted',
      )
    })
  }

  const getPendingFieldChanges = (fieldPath: string) => {
    return computed(() => {
      if (!fieldChanges.value) return []
      return fieldChanges.value.filter(
        (change) => change.fieldPath === fieldPath && change.status === 'pending',
      )
    })
  }

  return {
    // Data
    fieldChanges,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateStatusMutation.error,

    // Actions
    refetch,
    createFieldChange: createMutation.mutate,
    updateFieldChangeStatus: updateStatusMutation.mutate,

    // Async actions
    createFieldChangeAsync: createMutation.mutateAsync,
    updateFieldChangeStatusAsync: updateStatusMutation.mutateAsync,

    // Helper functions
    getFieldChanges,
    getAcceptedFieldChanges,
    getPendingFieldChanges,
  }
}

// Composable for field changes by specific field
export function useFieldChangesByField(featureSpecId: string, fieldPath: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: fieldChanges,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: fieldChangeKeys.byField(featureSpecId, fieldPath),
    queryFn: () => fetchFieldChangesByField(featureSpecId, fieldPath),
    enabled: computed(() => isAuthenticated.value && !!featureSpecId && !!fieldPath),
  })

  const acceptedChanges = computed(
    () => fieldChanges.value?.filter((change) => change.status === 'accepted') || [],
  )

  const pendingChanges = computed(
    () => fieldChanges.value?.filter((change) => change.status === 'pending') || [],
  )

  const latestAcceptedChange = computed(() =>
    acceptedChanges.value.length > 0 ? acceptedChanges.value[0] : null,
  )

  return {
    fieldChanges,
    acceptedChanges,
    pendingChanges,
    latestAcceptedChange,
    isLoading,
    error,
    refetch,
  }
}
