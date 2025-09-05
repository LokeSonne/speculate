<template>
  <div v-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>

  <AuthForm v-else-if="!isAuthenticated" />

  <slot v-else />
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import AuthForm from './auth/AuthForm.vue'

const { isAuthenticated, loading } = useAuth()
</script>

<style scoped>
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
</style>
