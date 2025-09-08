<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="text-3xl font-semibold text-primary">Dashboard</h2>
      <BaseButton @click="handleCreateSpec" variant="primary">
        <span class="mr-2">+</span>
        Create New Feature Spec
      </BaseButton>
    </div>

    <div v-if="loading" class="card text-center py-16">
      <div class="loading-spinner mb-4"></div>
      <p class="text-secondary">Loading feature specs...</p>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <h3 class="font-semibold mb-2">Error</h3>
      <p class="mb-4">{{ error }}</p>
      <BaseButton @click="fetchFeatureSpecs" variant="primary">Retry</BaseButton>
    </div>

    <div v-else-if="!featureSpecs || featureSpecs.length === 0" class="card text-center py-16">
      <h3 class="text-2xl font-semibold text-primary mb-4">No feature specs yet</h3>
      <p class="text-secondary mb-8 text-lg">
        Create your first feature specification to get started.
      </p>
      <BaseButton @click="handleCreateSpec" variant="primary">Create Feature Spec</BaseButton>
    </div>

    <div v-else class="specs-list">
      <h3 class="text-xl font-semibold text-primary mb-6">
        Feature Specifications ({{ featureSpecs?.length || 0 }})
      </h3>
      <div class="specs-grid">
        <div v-for="spec in featureSpecs" :key="spec.id" class="card spec-card">
          <div class="card-body">
            <h4 class="text-lg font-semibold text-primary mb-2">{{ spec.featureName }}</h4>
            <p class="text-sm text-secondary mb-4">By {{ spec.author }}</p>
            <p class="text-gray-700 mb-4 line-height-normal">{{ spec.featureSummary }}</p>
            <div class="spec-meta mb-4">
              <span class="badge" :class="`badge-${getStatusClass(spec.status)}`">
                {{ spec.status }}
              </span>
              <span class="text-sm text-secondary">{{
                new Date(spec.date).toLocaleDateString()
              }}</span>
            </div>
            <div class="spec-actions">
              <BaseButton @click="handleViewSpec(spec)" variant="primary" size="sm"
                >View</BaseButton
              >
              <BaseButton @click="handleEditSpec(spec)" variant="secondary" size="sm"
                >Edit</BaseButton
              >
              <BaseButton @click="handleDeleteSpec(spec.id)" variant="text" size="sm">
                Delete
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug info -->
    <div class="debug-info mt-8 p-4 bg-gray-100 rounded">
      <h4 class="font-semibold mb-2">Debug Info:</h4>
      <p><strong>Loading:</strong> {{ loading }}</p>
      <p><strong>Error:</strong> {{ error }}</p>
      <p><strong>Feature Specs Count:</strong> {{ featureSpecs?.length || 0 }}</p>
      <p>
        <strong>Feature Specs:</strong>
        {{
          JSON.stringify(
            featureSpecs?.map((s) => ({ id: s.id, name: s.featureName })) || [],
            null,
            2,
          )
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useFeatureSpecs } from '../composables/useFeatureSpecsQuery'
import BaseButton from './ui/BaseButton.vue'
import type { FrontendFeatureSpec } from '../types/feature'

const router = useRouter()

const {
  featureSpecs,
  isLoading: loading,
  error,
  refetch,
  deleteSpec: deleteFeatureSpec,
  isDeleting,
} = useFeatureSpecs()

const fetchFeatureSpecs = () => {
  refetch()
}

const handleCreateSpec = () => {
  router.push('/specs/create')
}

const handleViewSpec = (spec: FrontendFeatureSpec) => {
  router.push(`/specs/${spec.id}/view`)
}

const handleEditSpec = (spec: FrontendFeatureSpec) => {
  router.push(`/specs/${spec.id}/edit`)
}

const handleDeleteSpec = async (id: string) => {
  if (confirm('Are you sure you want to delete this feature specification?')) {
    await deleteFeatureSpec(id)
    // TanStack Query will automatically invalidate and refetch the data
  }
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    Draft: 'warning',
    'In Review': 'primary',
    Approved: 'success',
    Locked: 'secondary',
  }
  return statusMap[status] || 'secondary'
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-8);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-6);
}

.spec-card {
  transition: var(--transition-shadow);
}

.spec-card:hover {
  box-shadow: var(--shadow-lg);
}

.spec-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spec-actions {
  display: flex;
  gap: var(--spacing-2);
}

/* Button styles are now handled by the Button component */

/* Utility classes for spacing */
.mr-2 {
  margin-right: var(--spacing-2);
}
.mb-2 {
  margin-bottom: var(--spacing-2);
}
.mb-4 {
  margin-bottom: var(--spacing-4);
}
.mb-6 {
  margin-bottom: var(--spacing-6);
}
.mb-8 {
  margin-bottom: var(--spacing-8);
}
.py-16 {
  padding-top: var(--spacing-16);
  padding-bottom: var(--spacing-16);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .specs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
