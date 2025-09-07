import { beforeAll, afterEach, afterAll } from 'vitest'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'

// Global test setup for Vue Query
let queryClient: QueryClient

beforeAll(() => {
  queryClient = new QueryClient({
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
})

afterEach(() => {
  queryClient.clear()
})

afterAll(() => {
  queryClient = null as any
})

// Helper function to create a test app with Vue Query
export function createTestApp() {
  const app = createApp({})
  app.use(VueQueryPlugin, { queryClient })
  return app
}

// Export the query client for tests that need it
export { queryClient }
