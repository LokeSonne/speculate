import { createApp } from 'vue'
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

app.use(router)

app.mount('#app')
