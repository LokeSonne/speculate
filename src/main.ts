import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
// import App from './App.vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Initialize Mock Service Worker in development
if (import.meta.env.DEV) {
  const { startMockServiceWorker } = await import('./mocks/browser')
  await startMockServiceWorker()

  // Initialize mock authentication helper in development
  console.log('🔧 Initializing mock auth in development mode')
  await import('./lib/mockAuth')
}

const app = createApp(App)

// Configure TanStack Query
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  },
})

app.use(router)

app.mount('#app')
