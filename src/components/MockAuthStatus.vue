<template>
  <div v-if="showAuthStatus" class="auth-status">
    <div class="auth-status-content">
      <h4>🔐 Mock Authentication Status</h4>
      <div v-if="user" class="user-info">
        <p><strong>Logged in as:</strong> {{ user.email }}</p>
        <p><strong>Name:</strong> {{ user.user_metadata?.full_name || 'N/A' }}</p>
        <p><strong>User ID:</strong> {{ user.id }}</p>
      </div>
      <div v-else class="not-logged-in">
        <p>Not logged in</p>
        <BaseButton @click="loginAsJohn" variant="primary" size="sm">Login as John</BaseButton>
        <BaseButton @click="loginAsJane" variant="secondary" size="sm">Login as Jane</BaseButton>
      </div>
      <div class="auth-actions">
        <BaseButton v-if="user" @click="logout" variant="secondary" size="sm">Logout</BaseButton>
        <BaseButton @click="createTestUser" variant="secondary" size="sm"
          >Create Test User</BaseButton
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { mockAuth } from '../lib/mockAuth'
import BaseButton from './ui/BaseButton.vue'

const { user, signOut } = useAuth()

// Only show in development with mock API
const showAuthStatus = computed(() => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true'
})

const loginAsJohn = async () => {
  await mockAuth.autoLogin('john@example.com')
}

const loginAsJane = async () => {
  await mockAuth.autoLogin('jane@example.com')
}

const logout = async () => {
  await mockAuth.logout()
}

const createTestUser = async () => {
  const email = prompt('Enter email for test user:')
  const name = prompt('Enter full name (optional):')

  if (email) {
    await mockAuth.createTestUser(email, name || undefined)
  }
}
</script>

<style scoped>
.auth-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-lg);
  max-width: 300px;
  font-size: var(--font-size-sm);
}

.auth-status-content h4 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.user-info p {
  margin: var(--spacing-1) 0;
  color: var(--color-text-secondary);
}

.not-logged-in {
  margin-bottom: var(--spacing-3);
}

.auth-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  flex-wrap: wrap;
}

/* Button styles are now handled by the Button component */
</style>
