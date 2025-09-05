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
        <div v-if="!showForm" class="dashboard">
          <div class="dashboard-header">
            <h2>Dashboard</h2>
            <button @click="handleCreateSpec" class="btn-primary">+ Create New Feature Spec</button>
          </div>

          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading feature specs...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <h3>Error</h3>
            <p>{{ error }}</p>
            <button @click="fetchFeatureSpecs" class="btn-primary">Retry</button>
          </div>

          <div v-else-if="featureSpecs.length === 0" class="empty-state">
            <h3>No feature specs yet</h3>
            <p>Create your first feature specification to get started.</p>
            <button @click="handleCreateSpec" class="btn-primary">Create Feature Spec</button>
          </div>

          <div v-else class="specs-list">
            <h3>Feature Specifications ({{ featureSpecs.length }})</h3>
            <div class="specs-grid">
              <div v-for="spec in featureSpecs" :key="spec.id" class="spec-card">
                <h4>{{ spec.featureName }}</h4>
                <p class="spec-author">By {{ spec.author }}</p>
                <p class="spec-summary">{{ spec.featureSummary }}</p>
                <div class="spec-meta">
                  <span
                    class="spec-status"
                    :class="`status-${spec.status.toLowerCase().replace(' ', '-')}`"
                  >
                    {{ spec.status }}
                  </span>
                  <span class="spec-date">{{ new Date(spec.date).toLocaleDateString() }}</span>
                </div>
                <div class="spec-actions">
                  <button @click="handleEditSpec(spec)" class="btn-secondary btn-sm">Edit</button>
                  <button @click="handleDeleteSpec(spec.id)" class="btn-remove btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="form-container">
          <div class="form-header">
            <h2>
              {{ editingSpec ? 'Edit Feature Specification' : 'Create Feature Specification' }}
            </h2>
            <button @click="handleFormCancel" class="btn-secondary">← Back to Dashboard</button>
          </div>

          <FeatureSpecForm
            :initial-data="editingSpec || undefined"
            :is-editing="!!editingSpec"
            @submit="handleFormSubmit"
            @cancel="handleFormCancel"
          />
        </div>
      </main>
    </div>
  </AuthGuard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useFeatureSpecs } from './composables/useFeatureSpecsSupabase'
import FeatureSpecForm from './components/forms/FeatureSpecForm.vue'
import AuthGuard from './components/AuthGuard.vue'
import type { FrontendFeatureSpec, FeatureSpecFormData } from './types/feature'

const { user, signOut } = useAuth()
const {
  featureSpecs,
  loading,
  error,
  fetchFeatureSpecs,
  createFeatureSpec,
  updateFeatureSpec,
  deleteFeatureSpec,
} = useFeatureSpecs()

const showForm = ref(false)
const editingSpec = ref<FrontendFeatureSpec | null>(null)

// Load feature specs when component mounts
onMounted(() => {
  fetchFeatureSpecs()
})

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
    // Update existing spec
    await updateFeatureSpec(editingSpec.value.id, data)
  } else {
    // Create new spec
    await createFeatureSpec(data)
  }

  showForm.value = false
  editingSpec.value = null
}

const handleFormCancel = () => {
  showForm.value = false
  editingSpec.value = null
}

const handleDeleteSpec = async (id: string) => {
  if (confirm('Are you sure you want to delete this feature specification?')) {
    await deleteFeatureSpec(id)
  }
}

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: var(--spacing-16);
  background: var(--color-red-50);
  border: 1px solid var(--color-red-100);
  border-radius: var(--radius-lg);
}

.error-state h3 {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-error);
}

.error-state p {
  margin: 0 0 var(--spacing-6) 0;
  color: var(--color-text-secondary);
}

.spec-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.btn-remove {
  background: var(--color-red-50);
  color: var(--color-error);
  border: 1px solid var(--color-red-100);
}

.btn-remove:hover {
  background: var(--color-red-100);
}
</style>
