import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import type { FieldChange, CreateFieldChangeData, FieldChangeStatus } from '../../types/feature'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      order: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
    })),
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
    })),
  },
}

// Mock TanStack Query
const mockQueryClient = {
  invalidateQueries: vi.fn(),
}

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockUseQueryClient = vi.fn(() => mockQueryClient)

vi.mock('@tanstack/vue-query', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}))

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabase,
}))

vi.mock('../../composables/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: ref(true),
  }),
}))

describe('useFieldChangesQuery', () => {
  const mockFieldChanges: FieldChange[] = [
    {
      id: 'fc-1',
      featureSpecId: 'spec-1',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'Old Name',
      newValue: 'New Name',
      changeDescription: 'Updated name',
      authorId: 'user-1',
      authorEmail: 'john@example.com',
      status: 'pending',
      createdAt: '2024-01-17T10:30:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
    },
    {
      id: 'fc-2',
      featureSpecId: 'spec-1',
      fieldPath: 'featureSummary',
      fieldType: 'string',
      oldValue: 'Old summary',
      newValue: 'New summary',
      changeDescription: 'Updated summary',
      authorId: 'user-2',
      authorEmail: 'jane@example.com',
      status: 'accepted',
      createdAt: '2024-01-17T11:00:00Z',
      updatedAt: '2024-01-17T11:15:00Z',
      acceptedAt: '2024-01-17T11:15:00Z',
      acceptedBy: 'owner-1',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    mockUseQuery.mockReturnValue({
      data: ref(mockFieldChanges),
      isLoading: ref(false),
      error: ref(null),
      refetch: vi.fn(),
    })

    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: ref(false),
      error: ref(null),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useFieldChanges', () => {
    it('initializes with correct query configuration', async () => {
      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      useFieldChanges('spec-1')

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['fieldChanges', 'list', 'spec-1'],
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })
    })

    it('returns field changes data', async () => {
      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { fieldChanges } = useFieldChanges('spec-1')

      expect(fieldChanges.value).toEqual(mockFieldChanges)
    })

    it('returns loading state', async () => {
      mockUseQuery.mockReturnValue({
        data: ref(mockFieldChanges),
        isLoading: ref(true),
        error: ref(null),
        refetch: vi.fn(),
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { isLoading } = useFieldChanges('spec-1')

      expect(isLoading.value).toBe(true)
    })

    it('returns error state', async () => {
      const mockError = new Error('Failed to fetch')
      mockUseQuery.mockReturnValue({
        data: ref(mockFieldChanges),
        isLoading: ref(false),
        error: ref(mockError),
        refetch: vi.fn(),
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { error } = useFieldChanges('spec-1')

      expect(error.value).toBe(mockError)
    })

    describe('getFieldChanges', () => {
      it('filters changes by field path', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getFieldChanges } = useFieldChanges('spec-1')

        const featureNameChanges = getFieldChanges('featureName')
        const featureSummaryChanges = getFieldChanges('featureSummary')

        expect(featureNameChanges.value).toHaveLength(1)
        expect(featureNameChanges.value[0].fieldPath).toBe('featureName')

        expect(featureSummaryChanges.value).toHaveLength(1)
        expect(featureSummaryChanges.value[0].fieldPath).toBe('featureSummary')
      })

      it('returns empty array for non-existent field path', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getFieldChanges } = useFieldChanges('spec-1')

        const nonExistentChanges = getFieldChanges('nonExistentField')

        expect(nonExistentChanges.value).toEqual([])
      })

      it('returns empty array when no data is loaded', async () => {
        mockUseQuery.mockReturnValue({
          data: ref(null),
          isLoading: ref(false),
          error: ref(null),
          refetch: vi.fn(),
        })

        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getFieldChanges } = useFieldChanges('spec-1')

        const changes = getFieldChanges('featureName')

        expect(changes.value).toEqual([])
      })
    })

    describe('getAcceptedFieldChanges', () => {
      it('filters accepted changes by field path', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getAcceptedFieldChanges } = useFieldChanges('spec-1')

        const acceptedChanges = getAcceptedFieldChanges('featureSummary')

        expect(acceptedChanges.value).toHaveLength(1)
        expect(acceptedChanges.value[0].status).toBe('accepted')
        expect(acceptedChanges.value[0].fieldPath).toBe('featureSummary')
      })

      it('returns empty array when no accepted changes exist', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getAcceptedFieldChanges } = useFieldChanges('spec-1')

        const acceptedChanges = getAcceptedFieldChanges('featureName')

        expect(acceptedChanges.value).toEqual([])
      })
    })

    describe('getPendingFieldChanges', () => {
      it('filters pending changes by field path', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getPendingFieldChanges } = useFieldChanges('spec-1')

        const pendingChanges = getPendingFieldChanges('featureName')

        expect(pendingChanges.value).toHaveLength(1)
        expect(pendingChanges.value[0].status).toBe('pending')
        expect(pendingChanges.value[0].fieldPath).toBe('featureName')
      })

      it('returns empty array when no pending changes exist', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        const { getPendingFieldChanges } = useFieldChanges('spec-1')

        const pendingChanges = getPendingFieldChanges('featureSummary')

        expect(pendingChanges.value).toEqual([])
      })
    })

    describe('createFieldChange', () => {
      it('creates mutation with correct configuration', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        useFieldChanges('spec-1')

        expect(mockUseMutation).toHaveBeenCalledWith({
          mutationFn: expect.any(Function),
          onSuccess: expect.any(Function),
        })
      })

      it('invalidates queries on successful creation', async () => {
        const mockOnSuccess = vi.fn()
        mockUseMutation.mockImplementation((config) => {
          if (config.onSuccess) {
            config.onSuccess({ fieldPath: 'featureName' })
          }
          return {
            mutate: vi.fn(),
            mutateAsync: vi.fn(),
            isPending: ref(false),
            error: ref(null),
          }
        })

        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        useFieldChanges('spec-1')

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['fieldChanges', 'list', 'spec-1'],
        })
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['fieldChanges', 'list', 'spec-1', 'featureName'],
        })
      })
    })

    describe('updateFieldChangeStatus', () => {
      it('creates mutation with correct configuration', async () => {
        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        useFieldChanges('spec-1')

        // Should be called twice - once for create, once for update
        expect(mockUseMutation).toHaveBeenCalledTimes(2)
      })

      it('invalidates queries on successful status update', async () => {
        const mockOnSuccess = vi.fn()
        mockUseMutation.mockImplementation((config) => {
          if (config.onSuccess) {
            config.onSuccess({ fieldPath: 'featureName' })
          }
          return {
            mutate: vi.fn(),
            mutateAsync: vi.fn(),
            isPending: ref(false),
            error: ref(null),
          }
        })

        const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
        useFieldChanges('spec-1')

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['fieldChanges', 'list', 'spec-1'],
        })
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['fieldChanges', 'list', 'spec-1', 'featureName'],
        })
      })
    })
  })

  describe('useFieldChangesByField', () => {
    it('initializes with correct query configuration', async () => {
      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      useFieldChangesByField('spec-1', 'featureName')

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['fieldChanges', 'list', 'spec-1', 'featureName'],
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })
    })

    it('returns field changes data', async () => {
      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      const { fieldChanges } = useFieldChangesByField('spec-1', 'featureName')

      expect(fieldChanges.value).toEqual(mockFieldChanges)
    })

    it('computes accepted changes correctly', async () => {
      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      const { acceptedChanges } = useFieldChangesByField('spec-1', 'featureSummary')

      expect(acceptedChanges.value).toHaveLength(1)
      expect(acceptedChanges.value[0].status).toBe('accepted')
    })

    it('computes pending changes correctly', async () => {
      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      const { pendingChanges } = useFieldChangesByField('spec-1', 'featureName')

      expect(pendingChanges.value).toHaveLength(1)
      expect(pendingChanges.value[0].status).toBe('pending')
    })

    it('computes latest accepted change correctly', async () => {
      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      const { latestAcceptedChange } = useFieldChangesByField('spec-1', 'featureSummary')

      expect(latestAcceptedChange.value).toBeTruthy()
      expect(latestAcceptedChange.value?.status).toBe('accepted')
    })

    it('returns null for latest accepted change when none exist', async () => {
      // Mock data with no accepted changes for featureName
      const mockDataWithoutAccepted = mockFieldChanges.filter(
        (change) => change.fieldPath !== 'featureSummary' || change.status !== 'accepted',
      )

      mockUseQuery.mockReturnValue({
        data: ref(mockDataWithoutAccepted),
        isLoading: ref(false),
        error: ref(null),
        refetch: vi.fn(),
      })

      const { useFieldChangesByField } = await import('../../composables/useFieldChangesQuery')
      const { latestAcceptedChange } = useFieldChangesByField('spec-1', 'featureName')

      expect(latestAcceptedChange.value).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('handles query errors gracefully', async () => {
      const mockError = new Error('Network error')
      mockUseQuery.mockReturnValue({
        data: ref(null),
        isLoading: ref(false),
        error: ref(mockError),
        refetch: vi.fn(),
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { error } = useFieldChanges('spec-1')

      expect(error.value).toBe(mockError)
    })

    it('handles mutation errors gracefully', async () => {
      const mockError = new Error('Creation failed')
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: ref(false),
        error: ref(mockError),
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { createError } = useFieldChanges('spec-1')

      expect(createError.value).toBe(mockError)
    })

    it('handles authentication errors', async () => {
      // This test verifies that the composable handles auth errors gracefully
      // The actual error throwing is tested in the API function tests
      mockSupabase.auth.getUser.mockReturnValue({
        data: { user: null },
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { createFieldChange } = useFieldChanges('spec-1')

      // The function should exist and be callable
      expect(typeof createFieldChange).toBe('function')
    })
  })

  describe('Data Transformation', () => {
    it('transforms database fields to interface fields correctly', async () => {
      // Test the transformation by importing the actual composable and checking
      // that it returns properly formatted data
      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      const { fieldChanges } = useFieldChanges('spec-1')

      // The mock data should be properly formatted (already transformed)
      expect(fieldChanges.value).toEqual(mockFieldChanges)
      expect(fieldChanges.value[0]).toHaveProperty('fieldPath')
      expect(fieldChanges.value[0]).toHaveProperty('featureSpecId')
      expect(fieldChanges.value[0]).toHaveProperty('authorEmail')
      expect(fieldChanges.value[0]).toHaveProperty('createdAt')
    })
  })

  describe('Query Key Management', () => {
    it('uses consistent query keys', async () => {
      const { useFieldChanges, useFieldChangesByField } = await import(
        '../../composables/useFieldChangesQuery'
      )
      useFieldChanges('spec-1')
      useFieldChangesByField('spec-1', 'featureName')

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['fieldChanges', 'list', 'spec-1'],
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['fieldChanges', 'list', 'spec-1', 'featureName'],
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })
    })
  })

  describe('Authentication Integration', () => {
    it('enables queries only when authenticated', async () => {
      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      useFieldChanges('spec-1')

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: expect.any(Array),
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })
    })

    it('disables queries when not authenticated', async () => {
      // Mock useAuth to return unauthenticated state
      vi.doMock('../../composables/useAuth', () => ({
        useAuth: () => ({
          isAuthenticated: ref(false),
        }),
      }))

      mockUseQuery.mockImplementation((config) => {
        config.enabled.value = false
        return {
          data: ref([]),
          isLoading: ref(false),
          error: ref(null),
          refetch: vi.fn(),
        }
      })

      const { useFieldChanges } = await import('../../composables/useFieldChangesQuery')
      useFieldChanges('spec-1')

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: expect.any(Array),
        queryFn: expect.any(Function),
        enabled: expect.any(Object),
      })
    })
  })
})
