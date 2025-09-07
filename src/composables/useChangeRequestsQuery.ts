import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type {
  ChangeRequest,
  ChangeRequestComment,
  CreateChangeRequestData,
  CreateChangeRequestCommentData,
} from '../types/feature'

// Query keys for consistent cache management
export const changeRequestKeys = {
  all: ['changeRequests'] as const,
  lists: () => [...changeRequestKeys.all, 'list'] as const,
  list: (featureSpecId: string) => [...changeRequestKeys.lists(), featureSpecId] as const,
  details: () => [...changeRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...changeRequestKeys.details(), id] as const,
  comments: (changeRequestId: string) =>
    [...changeRequestKeys.detail(changeRequestId), 'comments'] as const,
}

// Transform database data to frontend format
const transformDbToChangeRequest = (dbData: any): ChangeRequest => {
  return {
    id: dbData.id,
    featureSpecId: dbData.feature_spec_id,
    userId: dbData.user_id,
    userEmail: dbData.profiles?.email || dbData.user_email || 'Unknown',
    userName: dbData.profiles?.full_name || dbData.user_name || 'Unknown',
    title: dbData.title,
    description: dbData.description,
    type: dbData.type,
    section: dbData.section,
    sectionId: dbData.section_id,
    suggestedChange: dbData.suggested_change,
    status: dbData.status,
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
    comments:
      dbData.change_request_comments?.map((comment: any) => ({
        id: comment.id,
        changeRequestId: comment.change_request_id,
        userId: comment.user_id,
        userEmail: comment.profiles?.email || comment.user_email || 'Unknown',
        userName: comment.profiles?.full_name || comment.user_name || 'Unknown',
        content: comment.content,
        createdAt: new Date(comment.created_at),
      })) || [],
  }
}

// API functions
const fetchChangeRequests = async (featureSpecId: string): Promise<ChangeRequest[]> => {
  const { data, error } = await supabase
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

  if (error) throw error

  return data?.map(transformDbToChangeRequest) || []
}

const createChangeRequest = async (data: CreateChangeRequestData): Promise<ChangeRequest> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: changeRequestData, error } = await supabase
    .from('change_requests')
    .insert({
      feature_spec_id: data.featureSpecId,
      user_id: user.id,
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

  if (error) throw error
  return transformDbToChangeRequest(changeRequestData)
}

const updateChangeRequestStatus = async ({
  id,
  status,
}: {
  id: string
  status: ChangeRequest['status']
}): Promise<ChangeRequest> => {
  const { data, error } = await supabase
    .from('change_requests')
    .update({ status })
    .eq('id', id)
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
    .single()

  if (error) throw error
  return transformDbToChangeRequest(data)
}

const createChangeRequestComment = async (
  data: CreateChangeRequestCommentData,
): Promise<ChangeRequestComment> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: commentData, error } = await supabase
    .from('change_request_comments')
    .insert({
      change_request_id: data.changeRequestId,
      user_id: user.id,
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

  if (error) throw error

  return {
    id: commentData.id,
    changeRequestId: commentData.change_request_id,
    userId: commentData.user_id,
    userEmail: commentData.profiles?.email || 'Unknown',
    userName: commentData.profiles?.full_name || 'Unknown',
    content: commentData.content,
    createdAt: new Date(commentData.created_at),
  }
}

const deleteChangeRequest = async (id: string): Promise<void> => {
  const { error } = await supabase.from('change_requests').delete().eq('id', id)

  if (error) throw error
}

// Composable for change requests
export function useChangeRequests(featureSpecId: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query for fetching change requests
  const {
    data: changeRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: changeRequestKeys.list(featureSpecId),
    queryFn: () => fetchChangeRequests(featureSpecId),
    enabled: computed(() => isAuthenticated.value && !!featureSpecId),
  })

  // Mutation for creating a new change request
  const createMutation = useMutation({
    mutationFn: createChangeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.list(featureSpecId) })
    },
  })

  // Mutation for updating change request status
  const updateStatusMutation = useMutation({
    mutationFn: updateChangeRequestStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.list(featureSpecId) })
      queryClient.setQueryData(changeRequestKeys.detail(data.id), data)
    },
  })

  // Mutation for deleting a change request
  const deleteMutation = useMutation({
    mutationFn: deleteChangeRequest,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.list(featureSpecId) })
      queryClient.removeQueries({ queryKey: changeRequestKeys.detail(deletedId) })
    },
  })

  // Mutation for creating a comment
  const createCommentMutation = useMutation({
    mutationFn: createChangeRequestComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.list(featureSpecId) })
      queryClient.invalidateQueries({ queryKey: changeRequestKeys.comments(data.changeRequestId) })
    },
  })

  // Computed properties
  const pendingRequests = computed(
    () => changeRequests.value?.filter((req) => req.status === 'open') || [],
  )

  const approvedRequests = computed(
    () => changeRequests.value?.filter((req) => req.status === 'accepted') || [],
  )

  const rejectedRequests = computed(
    () => changeRequests.value?.filter((req) => req.status === 'rejected') || [],
  )

  return {
    // Data
    changeRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,

    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingComment: createCommentMutation.isPending,

    // Error states
    error,
    createError: createMutation.error,
    updateError: updateStatusMutation.error,
    deleteError: deleteMutation.error,
    createCommentError: createCommentMutation.error,

    // Actions
    refetch,
    createChangeRequest: createMutation.mutate,
    updateChangeRequestStatus: updateStatusMutation.mutate,
    deleteChangeRequest: deleteMutation.mutate,
    createComment: createCommentMutation.mutate,

    // Async actions
    createChangeRequestAsync: createMutation.mutateAsync,
    updateChangeRequestStatusAsync: updateStatusMutation.mutateAsync,
    deleteChangeRequestAsync: deleteMutation.mutateAsync,
    createCommentAsync: createCommentMutation.mutateAsync,
  }
}

// Composable for individual change request
export function useChangeRequest(id: string) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: changeRequest,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: changeRequestKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('id', id)
        .single()

      if (error) throw error
      return transformDbToChangeRequest(data)
    },
    enabled: computed(() => isAuthenticated.value && !!id),
  })

  // Mutation for updating this specific change request
  const updateMutation = useMutation({
    mutationFn: updateChangeRequestStatus,
    onSuccess: (data) => {
      queryClient.setQueryData(changeRequestKeys.detail(id), data)
    },
  })

  return {
    changeRequest,
    isLoading,
    error,
    refetch,
    updateChangeRequest: updateMutation.mutate,
    updateChangeRequestAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  }
}
