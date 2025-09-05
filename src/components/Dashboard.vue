<template>
  <div class="dashboard">
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
            <button @click="handleViewSpec(spec)" class="btn-primary btn-sm">View</button>
            <button @click="handleEditSpec(spec)" class="btn-secondary btn-sm">Edit</button>
            <button @click="handleDeleteSpec(spec.id)" class="btn-remove btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useFeatureSpecs } from '../composables/useFeatureSpecsSupabase'
import type { FrontendFeatureSpec } from '../types/feature'

interface Emits {
  (e: 'create-spec'): void
  (e: 'edit-spec', spec: FrontendFeatureSpec): void
  (e: 'view-spec', spec: FrontendFeatureSpec): void
}

const emit = defineEmits<Emits>()

const { featureSpecs, loading, error, fetchFeatureSpecs, deleteFeatureSpec } = useFeatureSpecs()

// Load feature specs when component mounts
onMounted(() => {
  fetchFeatureSpecs()
})

const handleCreateSpec = () => {
  emit('create-spec')
}

const handleViewSpec = (spec: FrontendFeatureSpec) => {
  emit('view-spec', spec)
}

const handleEditSpec = (spec: FrontendFeatureSpec) => {
  emit('edit-spec', spec)
}

const handleDeleteSpec = async (id: string) => {
  if (confirm('Are you sure you want to delete this feature specification?')) {
    await deleteFeatureSpec(id)
  }
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-8);
}

.dashboard-header h2 {
  margin: 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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

.empty-state {
  text-align: center;
  padding: var(--spacing-16) var(--spacing-8);
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.empty-state p {
  margin: 0 0 var(--spacing-8) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.specs-list h3 {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.spec-card {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  transition: box-shadow var(--transition-fast);
}

.spec-card:hover {
  box-shadow: var(--shadow-md);
}

.spec-card h4 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.spec-author {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.spec-summary {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-gray-700);
  line-height: var(--line-height-normal);
}

.spec-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spec-status {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-draft {
  background: var(--color-yellow-100);
  color: var(--color-amber-600);
}

.status-in-review {
  background: var(--color-blue-100);
  color: var(--color-blue-600);
}

.status-approved {
  background: var(--color-green-100);
  color: var(--color-green-600);
}

.status-locked {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.spec-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.spec-actions {
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
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
