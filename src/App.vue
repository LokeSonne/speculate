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
  background: #f9fafb;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
    'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 2rem;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
}

.app-header p {
  margin: 0;
  color: #6b7280;
  font-size: 1.125rem;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 1.125rem;
}

.specs-list h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.spec-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: box-shadow 0.15s ease-in-out;
}

.spec-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.spec-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.spec-author {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.spec-summary {
  margin: 0 0 1rem 0;
  color: #374151;
  line-height: 1.5;
}

.spec-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.spec-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-in-review {
  background: #dbeafe;
  color: #1e40af;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-locked {
  background: #f3f4f6;
  color: #374151;
}

.spec-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.form-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.form-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>
