<template>
  <div class="form-section">
    <h2>Overview</h2>

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
        v-if="featureSpecId"
        :changes="getFieldChanges('featureName')"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>

    <div class="form-row">
      <div v-if="isEditing" class="form-group">
        <label for="author">Author *</label>
        <input
          id="author"
          :value="data.author"
          @input="updateField('author', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          placeholder="Author name"
          class="form-input"
          :class="{ error: errors.author }"
        />
        <div v-if="errors.author" class="error-message">
          {{ errors.author }}
        </div>
        <FieldChangeHistory
          v-if="featureSpecId"
          :changes="getFieldChanges('author')"
          :is-owner="isOwner"
          :loading="loading"
          @accept="acceptChange"
          @reject="rejectChange"
        />
      </div>

      <div class="form-group">
        <label for="date">Date *</label>
        <input
          id="date"
          :value="data.date"
          @input="updateField('date', ($event.target as HTMLInputElement).value)"
          type="date"
          required
          class="form-input"
          :class="{ error: errors.date }"
        />
        <div v-if="errors.date" class="error-message">
          {{ errors.date }}
        </div>
        <FieldChangeHistory
          v-if="featureSpecId"
          :changes="getFieldChanges('date')"
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
          v-if="featureSpecId"
          :changes="getFieldChanges('status')"
          :is-owner="isOwner"
          :loading="loading"
          @accept="acceptChange"
          @reject="rejectChange"
        />
      </div>
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
        v-if="featureSpecId"
        :changes="getFieldChanges('featureSummary')"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useFieldChanges } from '../../../composables/useFieldChanges'
import FieldChangeHistory from '../../FieldChangeHistory.vue'
import type { FieldChangeStatus } from '../../../types/feature'

interface Props {
  data: {
    featureName: string
    author: string
    date: string
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
  loading,
  getFieldChanges,
  updateFieldChangeStatus,
  isOwner,
  fetchFieldChanges,
} = props.featureSpecId
  ? useFieldChanges(props.featureSpecId)
  : {
      fieldChanges: computed(() => []),
      loading: computed(() => false),
      getFieldChanges: () => computed(() => []),
      updateFieldChangeStatus: async () => {},
      isOwner: computed(() => false),
      fetchFieldChanges: async () => {},
    }

// Load field changes when component mounts
onMounted(() => {
  if (props.featureSpecId) {
    console.log('🚀 OverviewSection mounted with featureSpecId:', props.featureSpecId)
    fetchFieldChanges()
  } else {
    console.log('⚠️ OverviewSection mounted without featureSpecId')
  }
})

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
