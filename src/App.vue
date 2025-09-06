<template>
  <div class="app">
    <!-- Mock Authentication Status (Development Only) -->
    <MockAuthStatus />

    <!-- Show loading while checking authentication -->
    <div v-if="authLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Show auth form if not authenticated -->
    <AuthForm v-else-if="!isAuthenticated" />

    <!-- Show main app if authenticated -->
    <div v-else class="app-layout">
      <header class="app-header">
        <div class="header-content">
          <div class="user-info">
            <span class="user-email">Welcome, {{ user?.email }}</span>
            <button @click="handleSignOut" class="btn btn-secondary btn-sm">Sign Out</button>
          </div>
        </div>
      </header>

      <div class="app-body">
        <SidePanel />
        <main class="app-main">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import AuthForm from './components/auth/AuthForm.vue'
import MockAuthStatus from './components/MockAuthStatus.vue'
import SidePanel from './components/SidePanel.vue'

const { user, isAuthenticated, loading: authLoading, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--color-background);
  font-family: var(--font-family-sans);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--spacing-4);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.app-header {
  background: var(--color-background-card);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-content {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
  padding: var(--spacing-1) var(--spacing-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.header-text {
  flex: 1;
}

.app-header h1 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.app-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-shrink: 0;
}

.user-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: var(--spacing-6);
  overflow-y: auto;
  background: var(--color-background);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .user-info {
    align-self: flex-end;
  }

  .app-header h1 {
    font-size: var(--font-size-2xl);
  }

  .app-body {
    flex-direction: column;
  }

  .app-main {
    padding: var(--spacing-4);
  }
}
</style>
