import { createApp } from 'vue'
// import App from './App.vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Initialize Mock Service Worker in development
if (import.meta.env.DEV) {
  const { startMockServiceWorker } = await import('./mocks/browser')
  await startMockServiceWorker()

  // Initialize mock authentication helper
  if (import.meta.env.VITE_USE_MOCK_API === 'true') {
    await import('./lib/mockAuth')
  }
}

const app = createApp(App)

app.use(router)

app.mount('#app')
