<template>
  <div class="form-section">
    <h2>Overview</h2>

    <!-- Metadata display in edit mode -->
    <div v-if="isEditing" class="metadata-display">
      <span class="metadata-item">By {{ data.author }}</span>
      <span class="metadata-separator">•</span>
      <span class="metadata-item">{{ formatDate(data.date) }}</span>
    </div>

    <div class="form-group">
      <label for="featureName">Feature Name *</label>
      <input
        id="featureName"
        :value="data.featureName"
        @input="updateField('featureName', ($event.target as HTMLInputElement).value)"
        type="text"
        required
        placeholder="Enter feature name"
        class="form-input"
        :class="{ error: errors.featureName }"
      />
      <div v-if="errors.featureName" class="error-message">
        {{ errors.featureName }}
      </div>
      <FieldChangeHistory
        v-if="featureSpecId && !ownershipLoading"
        :changes="getFieldChanges('featureName').value"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>

    <div class="form-group">
      <label for="status">Status *</label>
      <select
        id="status"
        :value="data.status"
        @change="updateField('status', ($event.target as HTMLSelectElement).value)"
        required
        class="form-select"
        :class="{ error: errors.status }"
      >
        <option value="Draft">Draft</option>
        <option value="In Review">In Review</option>
        <option value="Approved">Approved</option>
        <option value="Locked">Locked</option>
      </select>
      <div v-if="errors.status" class="error-message">
        {{ errors.status }}
      </div>
      <FieldChangeHistory
        v-if="featureSpecId && !ownershipLoading"
        :changes="getFieldChanges('status').value"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>

    <div class="form-group">
      <label for="featureSummary">Feature Summary *</label>
      <textarea
        id="featureSummary"
        :value="data.featureSummary"
        @input="updateField('featureSummary', ($event.target as HTMLTextAreaElement).value)"
        required
        placeholder="2-3 sentences describing what this feature does and its primary value"
        rows="3"
        class="form-textarea"
        :class="{ error: errors.featureSummary }"
      ></textarea>
      <div v-if="errors.featureSummary" class="error-message">
        {{ errors.featureSummary }}
      </div>
      <FieldChangeHistory
        v-if="featureSpecId && !ownershipLoading"
        :changes="getFieldChanges('featureSummary').value"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFieldChanges } from '../../../composables/useFieldChangesQuery'
import FieldChangeHistory from '../../FieldChangeHistory.vue'
import type { FieldChangeStatus } from '../../../types/feature'

interface Props {
  data: {
    featureName: string
    author: string
    date: Date | string
    status: string
    featureSummary: string
  }
  errors: Record<string, string>
  isEditing: boolean
  featureSpecId?: string
}

interface Emits {
  (e: 'update', field: string, value: string): void
  (e: 'field-change', fieldPath: string, oldValue: any, newValue: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Field changes functionality
const {
  fieldChanges,
  isLoading: loading,
  getFieldChanges,
  updateFieldChangeStatus,
  isOwner,
  ownershipLoading,
} = props.featureSpecId
  ? useFieldChanges(props.featureSpecId)
  : {
      fieldChanges: computed(() => []),
      isLoading: computed(() => false),
      getFieldChanges: () => computed(() => []),
      updateFieldChangeStatus: async () => {},
      isOwner: computed(() => false),
      ownershipLoading: computed(() => false),
    }

// TanStack Query will automatically fetch field changes when needed

const updateField = (field: string, value: string) => {
  emit('update', field, value)

  // Track field changes for collaborative editing
  if (props.featureSpecId && props.isEditing) {
    const oldValue = props.data[field as keyof typeof props.data]
    if (oldValue !== value) {
      emit('field-change', field, oldValue, value)
    }
  }
}

const acceptChange = async (changeId: string) => {
  try {
    await updateFieldChangeStatus(changeId, 'accepted')
  } catch (error) {
    console.error('Failed to accept change:', error)
  }
}

const rejectChange = async (changeId: string) => {
  try {
    await updateFieldChangeStatus(changeId, 'rejected')
  } catch (error) {
    console.error('Failed to reject change:', error)
  }
}

// Format date for display
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
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

.metadata-display {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-2) 0;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.metadata-item {
  color: var(--color-text-secondary);
}

.metadata-separator {
  margin: 0 var(--spacing-2);
  color: var(--color-text-tertiary);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input,
.form-select,
.form-textarea {
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
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: var(--color-error);
  box-shadow: var(--shadow-focus-error);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-error);
}
</style>
