<template>
  <div class="form-container">
    <div class="form-header">
      <h2>
        {{ editingSpec ? 'Edit Feature Specification' : 'Create Feature Specification' }}
      </h2>
      <button @click="handleCancel" class="btn-secondary">← Back to Dashboard</button>
    </div>

    <FeatureSpecForm
      :initial-data="editingSpec || undefined"
      :is-editing="!!editingSpec"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import FeatureSpecForm from './forms/FeatureSpecForm.vue'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../types/feature'

interface Props {
  editingSpec?: FrontendFeatureSpec | null
}

interface Emits {
  (e: 'submit', data: FeatureSpecFormData): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSubmit = (data: FeatureSpecFormData) => {
  emit('submit', data)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
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
</style>
