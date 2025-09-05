import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type {
  ChangeRequest,
  ChangeRequestComment,
  CreateChangeRequestData,
  CreateChangeRequestCommentData,
} from '../types/feature'

// Global state
const changeRequests = ref<ChangeRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

export function useChangeRequests() {
  const { user, isAuthenticated } = useAuth()

  // Fetch change requests for a specific feature spec
  const fetchChangeRequests = async (featureSpecId: string) => {
    if (!isAuthenticated.value) return

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('change_requests')
        .select(
          `
          *,
          profiles!change_requests_user_id_fkey (
            email,
            full_name
          ),
          change_request_comments (
            *,
            profiles!change_request_comments_user_id_fkey (
              email,
              full_name
            )
          )
        `,
        )
        .eq('feature_spec_id', featureSpecId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform the data to match our ChangeRequest interface
      changeRequests.value = data?.map(transformDbToChangeRequest) || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch change requests'
      console.error('Error fetching change requests:', err)
    } finally {
      loading.value = false
    }
  }

  // Create a new change request
  const createChangeRequest = async (
    data: CreateChangeRequestData,
  ): Promise<ChangeRequest | null> => {
    if (!isAuthenticated.value || !user.value) return null

    loading.value = true
    error.value = null

    try {
      const { data: changeRequestData, error: createError } = await supabase
        .from('change_requests')
        .insert({
          feature_spec_id: data.featureSpecId,
          user_id: user.value.id,
          title: data.title,
          description: data.description,
          type: data.type,
          section: data.section,
          section_id: data.sectionId,
          suggested_change: data.suggestedChange,
        })
        .select(
          `
          *,
          profiles!change_requests_user_id_fkey (
            email,
            full_name
          )
        `,
        )
        .single()

      if (createError) throw createError

      const transformedRequest = transformDbToChangeRequest(changeRequestData)
      changeRequests.value.unshift(transformedRequest)

      return transformedRequest
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create change request'
      console.error('Error creating change request:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update change request status
  const updateChangeRequestStatus = async (
    id: string,
    status: ChangeRequest['status'],
  ): Promise<boolean> => {
    if (!isAuthenticated.value) return false

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('change_requests')
        .update({ status })
        .eq('id', id)

      if (updateError) throw updateError

      // Update local state
      const index = changeRequests.value.findIndex((cr) => cr.id === id)
      if (index !== -1) {
        changeRequests.value[index].status = status
        changeRequests.value[index].updatedAt = new Date()
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update change request'
      console.error('Error updating change request:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Add comment to change request
  const addComment = async (
    data: CreateChangeRequestCommentData,
  ): Promise<ChangeRequestComment | null> => {
    if (!isAuthenticated.value || !user.value) return null

    loading.value = true
    error.value = null

    try {
      const { data: commentData, error: createError } = await supabase
        .from('change_request_comments')
        .insert({
          change_request_id: data.changeRequestId,
          user_id: user.value.id,
          content: data.content,
        })
        .select(
          `
          *,
          profiles!change_request_comments_user_id_fkey (
            email,
            full_name
          )
        `,
        )
        .single()

      if (createError) throw createError

      const transformedComment = transformDbToComment(commentData)

      // Add comment to local state
      const changeRequestIndex = changeRequests.value.findIndex(
        (cr) => cr.id === data.changeRequestId,
      )
      if (changeRequestIndex !== -1) {
        if (!changeRequests.value[changeRequestIndex].comments) {
          changeRequests.value[changeRequestIndex].comments = []
        }
        changeRequests.value[changeRequestIndex].comments!.push(transformedComment)
      }

      return transformedComment
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add comment'
      console.error('Error adding comment:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete change request
  const deleteChangeRequest = async (id: string): Promise<boolean> => {
    if (!isAuthenticated.value) return false

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from('change_requests').delete().eq('id', id)

      if (deleteError) throw deleteError

      changeRequests.value = changeRequests.value.filter((cr) => cr.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete change request'
      console.error('Error deleting change request:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Get change requests by status
  const getChangeRequestsByStatus = computed(() => {
    return (status: ChangeRequest['status']) => {
      return changeRequests.value.filter((cr) => cr.status === status)
    }
  })

  // Get change requests by type
  const getChangeRequestsByType = computed(() => {
    return (type: ChangeRequest['type']) => {
      return changeRequests.value.filter((cr) => cr.type === type)
    }
  })

  return {
    changeRequests: computed(() => changeRequests.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchChangeRequests,
    createChangeRequest,
    updateChangeRequestStatus,
    addComment,
    deleteChangeRequest,
    getChangeRequestsByStatus,
    getChangeRequestsByType,
  }
}

// Helper function to transform database data to ChangeRequest
function transformDbToChangeRequest(dbRequest: any): ChangeRequest {
  return {
    id: dbRequest.id,
    featureSpecId: dbRequest.feature_spec_id,
    userId: dbRequest.user_id,
    userEmail: dbRequest.profiles?.email,
    userName: dbRequest.profiles?.full_name || dbRequest.profiles?.email,
    title: dbRequest.title,
    description: dbRequest.description,
    type: dbRequest.type,
    status: dbRequest.status,
    section: dbRequest.section,
    sectionId: dbRequest.section_id,
    suggestedChange: dbRequest.suggested_change,
    createdAt: new Date(dbRequest.created_at),
    updatedAt: new Date(dbRequest.updated_at),
    comments: dbRequest.change_request_comments?.map(transformDbToComment) || [],
  }
}

// Helper function to transform database comment data
function transformDbToComment(dbComment: any): ChangeRequestComment {
  return {
    id: dbComment.id,
    changeRequestId: dbComment.change_request_id,
    userId: dbComment.user_id,
    userEmail: dbComment.profiles?.email,
    userName: dbComment.profiles?.full_name || dbComment.profiles?.email,
    content: dbComment.content,
    createdAt: new Date(dbComment.created_at),
  }
}
