<script setup lang="ts">
import { ref } from 'vue'
import FeatureSpecForm from './components/forms/FeatureSpecForm.vue'
import type { FeatureSpecFormData } from './types/feature'

const showForm = ref(false)
const featureSpecs = ref<FeatureSpecFormData[]>([])

const handleCreateSpec = () => {
  showForm.value = true
}

const handleFormSubmit = (data: FeatureSpecFormData) => {
  featureSpecs.value.push(data)
  showForm.value = false
  console.log('Feature spec created:', data)
}

const handleFormCancel = () => {
  showForm.value = false
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Frontend Feature Specs</h1>
      <p>Create and manage frontend feature specifications</p>
    </header>

    <main class="app-main">
      <div v-if="!showForm" class="dashboard">
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          <button @click="handleCreateSpec" class="btn-primary">+ Create New Feature Spec</button>
        </div>

        <div v-if="featureSpecs.length === 0" class="empty-state">
          <h3>No feature specs yet</h3>
          <p>Create your first feature specification to get started.</p>
          <button @click="handleCreateSpec" class="btn-primary">Create Feature Spec</button>
        </div>

        <div v-else class="specs-list">
          <h3>Feature Specifications ({{ featureSpecs.length }})</h3>
          <div class="specs-grid">
            <div v-for="(spec, index) in featureSpecs" :key="index" class="spec-card">
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
            </div>
          </div>
        </div>
      </div>

      <div v-else class="form-container">
        <div class="form-header">
          <h2>Create Feature Specification</h2>
          <button @click="handleFormCancel" class="btn-secondary">← Back to Dashboard</button>
        </div>

        <FeatureSpecForm @submit="handleFormSubmit" @cancel="handleFormCancel" />
      </div>
    </main>
  </div>
</template>

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

.app-main {
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: var(--spacing-8);
}

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

.form-container {
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.form-header h2 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.btn-primary,
.btn-secondary {
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-secondary);
  color: var(--color-gray-700);
  border: 1px solid var(--color-border-light);
}

.btn-secondary:hover {
  background: var(--color-secondary-hover);
}
</style>
