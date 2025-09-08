import { mount, VueWrapper } from '@vue/test-utils'
import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

// Create a test-specific QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// Helper function to create a test component that uses a composable
export function createTestComponent(composableFn: () => any) {
  return {
    template: '<div></div>',
    setup() {
      return composableFn()
    },
  }
}

// Helper function to mount components with Vue Query context
export function mountWithQueryClient(component: any, options: any = {}): VueWrapper {
  const app = createApp(component)
  app.use(VueQueryPlugin, { queryClient })

  return mount(component, {
    global: {
      plugins: [VueQueryPlugin],
      provide: {
        VUE_QUERY_CLIENT: queryClient,
      },
    },
    ...options,
  })
}

// Helper function specifically for testing composables
export function testComposable<T>(
  composableFn: () => T,
  options: any = {},
): VueWrapper & { vm: T } {
  const TestComponent = createTestComponent(composableFn)
  return mountWithQueryClient(TestComponent, options) as VueWrapper & { vm: T }
}

// Helper function to wait for Vue Query to resolve using proper async patterns
export async function waitForQueryResolve(): Promise<void> {
  await flushPromises()
}

// Helper function to wait for a specific condition using proper async patterns
export async function waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }

    await flushPromises()
  }
}

// Mock data helpers for common patterns
export const mockSupabaseResponse = {
  success: (data: any) => ({ data, error: null }),
  error: (error: any) => ({ data: null, error }),
}

// Common mock implementations for Supabase
export const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: 'test-user' } },
      error: null,
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
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
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null,
      })),
    })),
  })),
})
