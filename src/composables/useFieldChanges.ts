import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { FieldChange, CreateFieldChangeData, FieldChangeStatus } from '../types/feature'

export function useFieldChanges(featureSpecId: string) {
  const fieldChanges = ref<FieldChange[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch field changes for a feature spec
  const fetchFieldChanges = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('🔍 Fetching field changes for feature spec:', featureSpecId)

      const { data, error: fetchError } = await supabase
        .from('field_changes')
        .select('*')
        .eq('feature_spec_id', featureSpecId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      console.log('📊 Field changes fetched:', data)
      fieldChanges.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch field changes'
      console.error('❌ Error fetching field changes:', err)
    } finally {
      loading.value = false
    }
  }

  // Create a new field change
  const createFieldChange = async (changeData: CreateFieldChangeData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
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

      if (createError) throw createError

      // Add to local state
      fieldChanges.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create field change'
      console.error('Error creating field change:', err)
      throw err
    }
  }

  // Update field change status (accept/reject)
  const updateFieldChangeStatus = async (changeId: string, status: FieldChangeStatus) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updateData: any = {
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

      const { data, error: updateError } = await supabase
        .from('field_changes')
        .update(updateData)
        .eq('id', changeId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = fieldChanges.value.findIndex((change) => change.id === changeId)
      if (index !== -1) {
        fieldChanges.value[index] = data
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update field change'
      console.error('Error updating field change:', err)
      throw err
    }
  }

  // Get field changes for a specific field path
  const getFieldChanges = (fieldPath: string) => {
    const changes = computed(() => {
      const filtered = fieldChanges.value.filter((change) => change.fieldPath === fieldPath)
      console.log(`🔍 Field changes for "${fieldPath}":`, filtered)
      return filtered
    })
    return changes
  }

  // Get accepted field changes for a specific field path
  const getAcceptedFieldChanges = (fieldPath: string) => {
    return computed(() =>
      fieldChanges.value.filter(
        (change) => change.fieldPath === fieldPath && change.status === 'accepted',
      ),
    )
  }

  // Get pending field changes for a specific field path
  const getPendingFieldChanges = (fieldPath: string) => {
    return computed(() =>
      fieldChanges.value.filter(
        (change) => change.fieldPath === fieldPath && change.status === 'pending',
      ),
    )
  }

  // Check if user is the owner of the feature spec
  const isOwner = ref(false)
  const ownershipLoading = ref(true)

  const checkOwnership = async () => {
    try {
      ownershipLoading.value = true
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        isOwner.value = false
        return
      }

      const { data: spec } = await supabase
        .from('feature_specs')
        .select('author_id')
        .eq('id', featureSpecId)
        .single()

      isOwner.value = spec?.author_id === user.id
    } catch {
      isOwner.value = false
    } finally {
      ownershipLoading.value = false
    }
  }

  // Initialize ownership check
  checkOwnership()

  return {
    fieldChanges,
    loading,
    error,
    fetchFieldChanges,
    createFieldChange,
    updateFieldChangeStatus,
    getFieldChanges,
    getAcceptedFieldChanges,
    getPendingFieldChanges,
    isOwner,
    ownershipLoading,
  }
}
