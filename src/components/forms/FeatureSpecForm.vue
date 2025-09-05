<template>
  <div class="feature-spec-form">
    <form @submit.prevent="handleSubmit">
      <!-- Overview Section -->
      <div class="form-section">
        <h2>Overview</h2>

        <div class="form-group">
          <label for="featureName">Feature Name *</label>
          <input
            id="featureName"
            v-model="formData.featureName"
            type="text"
            required
            placeholder="Enter feature name"
            class="form-input"
            :class="{ error: errors.featureName }"
          />
          <div v-if="errors.featureName" class="error-message">
            {{ errors.featureName }}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="author">Author *</label>
            <input
              id="author"
              v-model="formData.author"
              type="text"
              required
              placeholder="Your name"
              class="form-input"
              :class="{ error: errors.author }"
            />
            <div v-if="errors.author" class="error-message">
              {{ errors.author }}
            </div>
          </div>

          <div class="form-group">
            <label for="date">Date *</label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              required
              class="form-input"
              :class="{ error: errors.date }"
            />
            <div v-if="errors.date" class="error-message">
              {{ errors.date }}
            </div>
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select
              id="status"
              v-model="formData.status"
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
          </div>
        </div>

        <div class="form-group">
          <label for="featureSummary">Feature Summary *</label>
          <textarea
            id="featureSummary"
            v-model="formData.featureSummary"
            required
            placeholder="2-3 sentences describing what this feature does and its primary value"
            rows="3"
            class="form-textarea"
            :class="{ error: errors.featureSummary }"
          ></textarea>
          <div v-if="errors.featureSummary" class="error-message">
            {{ errors.featureSummary }}
          </div>
        </div>
      </div>

      <!-- Success Criteria Section -->
      <div class="form-section">
        <h2>Success Criteria</h2>
        <div class="form-group">
          <label>Success Criteria</label>
          <div
            v-for="(criteria, index) in formData.successCriteria"
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
              <button type="button" @click="removeSuccessCriteria(index)" class="btn-remove">
                Remove
              </button>
            </div>
          </div>
          <button type="button" @click="addSuccessCriteria" class="btn-add">
            + Add Success Criteria
          </button>
        </div>
      </div>

      <!-- Reviewers Section -->
      <div class="form-section">
        <h2>Reviewers</h2>
        <div class="form-group">
          <label>Reviewers</label>
          <div
            v-for="(reviewer, index) in formData.reviewers"
            :key="reviewer.id"
            class="reviewer-item"
          >
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
                  @change="
                    updateReviewer(index, 'role', ($event.target as HTMLSelectElement).value)
                  "
                  class="form-select"
                >
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              <button type="button" @click="removeReviewer(index)" class="btn-remove">
                Remove
              </button>
            </div>
          </div>
          <button type="button" @click="addReviewer" class="btn-add">+ Add Reviewer</button>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-secondary">Cancel</button>
        <button type="submit" :disabled="isSubmitting" class="btn-primary">
          {{ isSubmitting ? 'Saving...' : 'Save Feature Spec' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FeatureSpecFormData, SuccessCriteria, Reviewer } from '../../types/feature'

interface Props {
  initialData?: Partial<FeatureSpecFormData>
  isEditing?: boolean
}

interface Emits {
  (e: 'submit', data: FeatureSpecFormData): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  isEditing: false,
})

const emit = defineEmits<Emits>()

// Form data using Vue reactivity
const formData = reactive<FeatureSpecFormData>({
  featureName: props.initialData.featureName || '',
  author: props.initialData.author || '',
  date: props.initialData.date || new Date().toISOString().split('T')[0],
  status: props.initialData.status || 'Draft',
  featureSummary: props.initialData.featureSummary || '',
  reviewers: props.initialData.reviewers || [],
  successCriteria: props.initialData.successCriteria || [],
  targetUsers: props.initialData.targetUsers || [],
  userGoals: props.initialData.userGoals || [],
  useCases: props.initialData.useCases || [],
  coreInteractions: props.initialData.coreInteractions || [],
  loadingStates: props.initialData.loadingStates || [],
  emptyStates: props.initialData.emptyStates || [],
  errorStates: props.initialData.errorStates || [],
  formBehavior: props.initialData.formBehavior,
  layoutStructure: props.initialData.layoutStructure || {
    desktop: { breakpoint: '>1200px', description: '' },
    tablet: { breakpoint: '768-1199px', description: '' },
    mobile: { breakpoint: '<768px', description: '' },
  },
  visualHierarchy: props.initialData.visualHierarchy || {
    primaryElements: [],
    secondaryElements: [],
    tertiaryElements: [],
  },
  componentSpecs: props.initialData.componentSpecs || [],
  typographyContent: props.initialData.typographyContent || {
    headlines: [],
    bodyText: [],
    labels: [],
    errorMessages: [],
    successMessages: [],
    emptyStateText: [],
  },
  accessibilityRequirements: props.initialData.accessibilityRequirements || {
    keyboardNavigation: {
      tabOrder: [],
      shortcuts: [],
      focusManagement: [],
    },
    screenReaderSupport: {
      labels: [],
      announcements: [],
      structure: [],
    },
    visualAccessibility: {
      colorRequirements: [],
      focusIndicators: [],
      textScaling: [],
    },
  },
  responsiveBehavior: props.initialData.responsiveBehavior || {
    breakpointTransitions: [],
    touchInteractions: [],
  },
  animationRequirements: props.initialData.animationRequirements || [],
  edgeCases: props.initialData.edgeCases || [],
  technicalConstraints: props.initialData.technicalConstraints || [],
  businessRules: props.initialData.businessRules || [],
  approvals: props.initialData.approvals || [],
})

// Form state
const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})

// Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!formData.featureName.trim()) {
    newErrors.featureName = 'Feature name is required'
  }

  if (!formData.author.trim()) {
    newErrors.author = 'Author is required'
  }

  if (!formData.date) {
    newErrors.date = 'Date is required'
  }

  if (!formData.status) {
    newErrors.status = 'Status is required'
  }

  if (!formData.featureSummary.trim()) {
    newErrors.featureSummary = 'Feature summary is required'
  }

  // Clear previous errors and set new ones
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.assign(errors, newErrors)

  return Object.keys(newErrors).length === 0
}

// Form handlers
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    emit('submit', { ...formData })
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Success Criteria management
const addSuccessCriteria = () => {
  const newCriteria: SuccessCriteria = {
    id: crypto.randomUUID(),
    type: 'Primary',
    description: '',
  }
  formData.successCriteria.push(newCriteria)
}

const removeSuccessCriteria = (index: number) => {
  formData.successCriteria.splice(index, 1)
}

const updateSuccessCriteria = (index: number, field: keyof SuccessCriteria, value: string) => {
  if (field === 'type' && (value === 'Primary' || value === 'Key')) {
    formData.successCriteria[index][field] = value as 'Primary' | 'Key'
  } else if (field === 'description') {
    formData.successCriteria[index][field] = value
  }
}

// Reviewer management
const addReviewer = () => {
  const newReviewer: Reviewer = {
    id: crypto.randomUUID(),
    name: '',
    role: 'Product',
    status: 'pending',
  }
  formData.reviewers.push(newReviewer)
}

const removeReviewer = (index: number) => {
  formData.reviewers.splice(index, 1)
}

const updateReviewer = (index: number, field: keyof Reviewer, value: string) => {
  if (field === 'name') {
    formData.reviewers[index][field] = value
  } else if (
    field === 'role' &&
    (value === 'Product' || value === 'Design' || value === 'Engineering')
  ) {
    formData.reviewers[index][field] = value as 'Product' | 'Design' | 'Engineering'
  } else if (
    field === 'status' &&
    (value === 'pending' || value === 'approved' || value === 'rejected')
  ) {
    formData.reviewers[index][field] = value as 'pending' | 'approved' | 'rejected'
  }
}
</script>

<style scoped>
.feature-spec-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.form-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
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
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #dc2626;
}

.criteria-item,
.reviewer-item {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
}

.btn-add,
.btn-remove {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-add {
  background: #f3f4f6;
  color: #374151;
}

.btn-add:hover {
  background: #e5e7eb;
}

.btn-remove {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.btn-remove:hover {
  background: #fee2e2;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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
