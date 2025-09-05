<template>
  <AuthGuard>
    <div class="app">
      <header class="app-header">
        <h1>Frontend Feature Specs</h1>
        <p>Create and manage frontend feature specifications</p>
        <div class="user-info">
          <span>Welcome, {{ user?.email }}</span>
          <button @click="handleSignOut" class="btn-secondary btn-sm">Sign Out</button>
        </div>
      </header>

      <main class="app-main">
        <Dashboard v-if="!showForm" @create-spec="handleCreateSpec" @edit-spec="handleEditSpec" />

        <FeatureSpecFormContainer
          v-else
          :editing-spec="editingSpec"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
        />
      </main>
    </div>
  </AuthGuard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from './composables/useAuth'
import { useFeatureSpecs } from './composables/useFeatureSpecsSupabase'
import AuthGuard from './components/AuthGuard.vue'
import Dashboard from './components/Dashboard.vue'
import FeatureSpecFormContainer from './components/FeatureSpecFormContainer.vue'
import type { FrontendFeatureSpec, FeatureSpecFormData } from './types/feature'

const { user, signOut } = useAuth()
const { createFeatureSpec, updateFeatureSpec } = useFeatureSpecs()

const showForm = ref(false)
const editingSpec = ref<FrontendFeatureSpec | null>(null)

const handleCreateSpec = () => {
  editingSpec.value = null
  showForm.value = true
}

const handleEditSpec = (spec: FrontendFeatureSpec) => {
  editingSpec.value = spec
  showForm.value = true
}

const handleFormSubmit = async (data: FeatureSpecFormData) => {
  if (editingSpec.value) {
    await updateFeatureSpec(editingSpec.value.id, data)
  } else {
    await createFeatureSpec(data)
  }

  showForm.value = false
  editingSpec.value = null
}

const handleFormCancel = () => {
  showForm.value = false
  editingSpec.value = null
}

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

.app-header {
  background: var(--color-background-card);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-8);
  text-align: center;
}

.app-header h1 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.app-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.user-info span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
}

.app-main {
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: var(--spacing-8);
}
</style>
