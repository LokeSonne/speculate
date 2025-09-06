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
    <div v-else>
      <header class="app-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Frontend Feature Specs</h1>
            <p>Create and manage frontend feature specifications</p>
          </div>
          <div class="user-info">
            <span class="user-email">Welcome, {{ user?.email }}</span>
            <button @click="handleSignOut" class="btn btn-secondary btn-sm">Sign Out</button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth'
import AuthForm from './components/auth/AuthForm.vue'
import MockAuthStatus from './components/MockAuthStatus.vue'

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
  padding: var(--spacing-8) var(--spacing-6);
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

.app-main {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-6);
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

  .app-main {
    padding: var(--spacing-6) var(--spacing-4);
  }
}
</style>
