import { beforeAll, afterEach, afterAll } from 'vitest'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

// Setup MSW server globally for all tests
const server = setupServer(...handlers)

// Global test setup for Vue Query
let queryClient: QueryClient

beforeAll(() => {
  // Start MSW server
  server.listen()

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
  // Reset MSW handlers and clear query cache
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  // Stop MSW server
  server.close()
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
