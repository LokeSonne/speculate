<template>
  <div class="form-section">
    <h2>Success Criteria</h2>
    <div class="form-group">
      <label>Success Criteria</label>
      <div
        v-for="(criteria, index) in data.successCriteria"
        :key="criteria.id"
        class="criteria-item"
      >
        <div class="form-row">
          <div class="form-group">
            <select
              :value="criteria.type"
              @change="
                updateSuccessCriteria(index, 'type', ($event.target as HTMLSelectElement).value)
              "
              class="form-select"
            >
              <option value="Primary">Primary</option>
              <option value="Key">Key</option>
            </select>
          </div>
          <div class="form-group flex-1">
            <input
              :value="criteria.description"
              @input="
                updateSuccessCriteria(
                  index,
                  'description',
                  ($event.target as HTMLInputElement).value,
                )
              "
              type="text"
              placeholder="Describe the success criteria"
              class="form-input"
            />
          </div>
          <Button type="button" @click="removeSuccessCriteria(index)" variant="text" size="sm">
            <DeleteIcon :size="16" />
          </Button>
        </div>
      </div>
      <Button type="button" @click="addSuccessCriteria" variant="secondary" size="sm">
        + Add Success Criteria
      </Button>
      <FieldChangeHistory
        v-if="featureSpecId && isEditing"
        :changes="getFieldChanges('successCriteria').value"
        :is-owner="isOwner"
        :loading="loading"
        @accept="acceptChange"
        @reject="rejectChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuccessCriteria } from '../../../types/feature'
import Button from '../../ui/Button.vue'
import DeleteIcon from '../../../icons/DeleteIcon.vue'
import FieldChangeHistory from '../../FieldChangeHistory.vue'
import { useFieldChanges } from '../../../composables/useFieldChangesQuery'
import { computed } from 'vue'

interface Props {
  data: {
    successCriteria: SuccessCriteria[]
  }
  featureSpecId?: string
  isEditing?: boolean
  isOwner?: boolean
}

interface Emits {
  (e: 'update', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Field changes functionality
const {
  isLoading: loading,
  getFieldChanges,
  updateFieldChangeStatus,
} = useFieldChanges(props.featureSpecId || '')

const acceptChange = async (changeId: string) => {
  await updateFieldChangeStatus(changeId, 'accepted')
}

const rejectChange = async (changeId: string) => {
  await updateFieldChangeStatus(changeId, 'rejected')
}

// Success Criteria management
const addSuccessCriteria = () => {
  const newCriteria: SuccessCriteria = {
    id: crypto.randomUUID(),
    type: 'Primary',
    description: '',
  }
  const updatedCriteria = [...props.data.successCriteria, newCriteria]
  emit('update', 'successCriteria', updatedCriteria)
}

const removeSuccessCriteria = (index: number) => {
  const updatedCriteria = props.data.successCriteria.filter((_, i) => i !== index)
  emit('update', 'successCriteria', updatedCriteria)
}

const updateSuccessCriteria = (index: number, field: keyof SuccessCriteria, value: string) => {
  const updatedCriteria = [...props.data.successCriteria]
  if (field === 'type' && (value === 'Primary' || value === 'Key')) {
    updatedCriteria[index][field] = value as 'Primary' | 'Key'
  } else if (field === 'description') {
    updatedCriteria[index][field] = value
  }
  emit('update', 'successCriteria', updatedCriteria)
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

.flex-1 {
  flex: 1;
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

.criteria-item {
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
