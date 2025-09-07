// MSW setup for browser environment
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Set up MSW worker
export const worker = setupWorker(...handlers)

// Start the worker
export const startMockServiceWorker = async () => {
  if (
    import.meta.env.VITE_USE_MOCK_API === 'true' ||
    import.meta.env.MODE === 'test' ||
    !import.meta.env.VITE_SUPABASE_URL
  ) {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
  }
}

// Stop the worker
export const stopMockServiceWorker = () => {
  worker.stop()
}
