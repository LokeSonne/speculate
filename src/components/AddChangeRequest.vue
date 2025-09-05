<template>
  <div class="add-change-request">
    <div class="add-change-request-header">
      <h3>Add Change Request</h3>
      <button @click="toggleForm" class="btn-secondary btn-sm">
        {{ showForm ? 'Cancel' : '+ Add Change Request' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="change-request-form">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          required
          placeholder="Brief title for the change request"
          class="form-input"
          :class="{ error: errors.title }"
        />
        <div v-if="errors.title" class="error-message">
          {{ errors.title }}
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="type">Type *</label>
          <select
            id="type"
            v-model="formData.type"
            required
            class="form-select"
            :class="{ error: errors.type }"
          >
            <option value="suggestion">Suggestion</option>
            <option value="issue">Issue</option>
            <option value="question">Question</option>
            <option value="improvement">Improvement</option>
          </select>
          <div v-if="errors.type" class="error-message">
            {{ errors.type }}
          </div>
        </div>

        <div class="form-group">
          <label for="section">Section</label>
          <select id="section" v-model="formData.section" class="form-select">
            <option value="">Select section (optional)</option>
            <option value="overview">Overview</option>
            <option value="success_criteria">Success Criteria</option>
            <option value="target_users">Target Users</option>
            <option value="user_goals">User Goals</option>
            <option value="use_cases">Use Cases</option>
            <option value="core_interactions">Core Interactions</option>
            <option value="accessibility">Accessibility</option>
            <option value="responsive">Responsive Behavior</option>
            <option value="animation">Animation</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="description">Description *</label>
        <textarea
          id="description"
          v-model="formData.description"
          required
          placeholder="Describe the change request in detail..."
          rows="4"
          class="form-textarea"
          :class="{ error: errors.description }"
        ></textarea>
        <div v-if="errors.description" class="error-message">
          {{ errors.description }}
        </div>
      </div>

      <div class="form-group">
        <label for="suggestedChange">Suggested Change</label>
        <textarea
          id="suggestedChange"
          v-model="formData.suggestedChange"
          placeholder="If you have a specific suggestion, describe it here..."
          rows="3"
          class="form-textarea"
        ></textarea>
        <div class="help-text">Optional: Provide specific details about what should be changed</div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">Reset</button>
        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Creating...' : 'Create Change Request' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useChangeRequests } from '../composables/useChangeRequests'
import type { CreateChangeRequestData } from '../types/feature'

interface Props {
  featureSpecId: string
}

interface Emits {
  (e: 'created', changeRequest: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createChangeRequest, loading, error } = useChangeRequests()

const showForm = ref(false)
const errors = reactive<Record<string, string>>({})

const formData = reactive<CreateChangeRequestData>({
  featureSpecId: props.featureSpecId,
  title: '',
  description: '',
  type: 'suggestion',
  section: '',
  suggestedChange: '',
})

const toggleForm = () => {
  showForm.value = !showForm.value
  if (!showForm.value) {
    resetForm()
  }
}

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!formData.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!formData.description.trim()) {
    newErrors.description = 'Description is required'
  }

  if (!formData.type) {
    newErrors.type = 'Type is required'
  }

  // Clear previous errors and set new ones
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, newErrors)

  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const changeRequest = await createChangeRequest(formData)

  if (changeRequest) {
    emit('created', changeRequest)
    resetForm()
    showForm.value = false
  }
}

const resetForm = () => {
  formData.title = ''
  formData.description = ''
  formData.type = 'suggestion'
  formData.section = ''
  formData.suggestedChange = ''

  Object.keys(errors).forEach((key) => delete errors[key])
}
</script>

<style scoped>
.add-change-request {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
}

.add-change-request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.add-change-request-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.change-request-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: var(--spacing-4);
}

.form-row .form-group {
  flex: 1;
}

label {
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input,
.form-select,
.form-textarea {
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

.help-text {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
}
</style>
