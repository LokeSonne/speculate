<template>
  <div class="form-section">
    <h2>Reviewers</h2>
    <div class="form-group">
      <label>Reviewers</label>
      <div v-for="(reviewer, index) in data.reviewers" :key="reviewer.id" class="reviewer-item">
        <div class="form-row">
          <div class="form-group">
            <input
              :value="reviewer.name"
              @input="updateReviewer(index, 'name', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Reviewer name"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <select
              :value="reviewer.role"
              @change="updateReviewer(index, 'role', ($event.target as HTMLSelectElement).value)"
              class="form-select"
            >
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          <button type="button" @click="removeReviewer(index)" class="btn-remove">Remove</button>
        </div>
      </div>
      <button type="button" @click="addReviewer" class="btn-add">+ Add Reviewer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reviewer } from '../../../types/feature'

interface Props {
  data: {
    reviewers: Reviewer[]
  }
}

interface Emits {
  (e: 'update', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reviewer management
const addReviewer = () => {
  const newReviewer: Reviewer = {
    id: crypto.randomUUID(),
    name: '',
    role: 'Product',
    status: 'pending',
  }
  const updatedReviewers = [...props.data.reviewers, newReviewer]
  emit('update', 'reviewers', updatedReviewers)
}

const removeReviewer = (index: number) => {
  const updatedReviewers = props.data.reviewers.filter((_, i) => i !== index)
  emit('update', 'reviewers', updatedReviewers)
}

const updateReviewer = (index: number, field: keyof Reviewer, value: string) => {
  const updatedReviewers = [...props.data.reviewers]
  if (field === 'name') {
    updatedReviewers[index][field] = value
  } else if (
    field === 'role' &&
    (value === 'Product' || value === 'Design' || value === 'Engineering')
  ) {
    updatedReviewers[index][field] = value as 'Product' | 'Design' | 'Engineering'
  } else if (
    field === 'status' &&
    (value === 'pending' || value === 'approved' || value === 'rejected')
  ) {
    updatedReviewers[index][field] = value as 'pending' | 'approved' | 'rejected'
  }
  emit('update', 'reviewers', updatedReviewers)
}
</script>

<style scoped>
.form-section {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
}

.form-section h2 {
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-row {
  display: flex;
  gap: var(--spacing-4);
  align-items: end;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.reviewer-item {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-card);
}

.btn-add,
.btn-remove {
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-add {
  background: var(--color-secondary);
  color: var(--color-gray-700);
}

.btn-add:hover {
  background: var(--color-secondary-hover);
}

.btn-remove {
  background: var(--color-red-50);
  color: var(--color-error);
  border-color: var(--color-red-100);
}

.btn-remove:hover {
  background: var(--color-red-100);
}
</style>
