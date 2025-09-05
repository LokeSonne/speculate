<template>
  <div class="feature-spec-form">
    <form @submit.prevent="handleSubmit">
      <!-- Overview Section -->
      <OverviewSection
        :data="{
          featureName: formData.featureName,
          author: formData.author,
          date: formData.date,
          status: formData.status,
          featureSummary: formData.featureSummary,
        }"
        :errors="errors"
        :is-editing="isEditing"
        @update="updateFormField"
      />

      <!-- User Requirements Section -->
      <UserRequirementsSection
        :data="{
          userGoals: formData.userGoals,
          useCases: formData.useCases,
        }"
        @update="updateFormField"
      />

      <!-- Behavioral Requirements Section -->
      <BehavioralRequirementsSection
        :data="{
          coreInteractions: formData.coreInteractions,
        }"
        @update="updateFormField"
      />

      <!-- Success Criteria Section -->
      <SuccessCriteriaSection
        :data="{
          successCriteria: formData.successCriteria,
        }"
        @update="updateFormField"
      />

      <!-- Reviewers Section -->
      <ReviewersSection
        :data="{
          reviewers: formData.reviewers,
        }"
        @update="updateFormField"
      />

      <!-- Approval Section -->
      <ApprovalSection
        :data="{
          approvals: formData.approvals,
        }"
        @update="updateFormField"
      />

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
import { useAuth } from '../../composables/useAuth'
import type { FeatureSpecFormData } from '../../types/feature'
import OverviewSection from './sections/OverviewSection.vue'
import UserRequirementsSection from './sections/UserRequirementsSection.vue'
import BehavioralRequirementsSection from './sections/BehavioralRequirementsSection.vue'
import SuccessCriteriaSection from './sections/SuccessCriteriaSection.vue'
import ReviewersSection from './sections/ReviewersSection.vue'
import ApprovalSection from './sections/ApprovalSection.vue'

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
const { user } = useAuth()

// Get user's display name (full name or email)
const getUserDisplayName = () => {
  if (!user.value) return ''

  // Try to get full name from user metadata first
  const fullName = user.value.user_metadata?.full_name
  if (fullName) return fullName

  // Fall back to email
  return user.value.email || ''
}

// Form data using Vue reactivity
const formData = reactive<FeatureSpecFormData>({
  featureName: props.initialData.featureName || '',
  author: props.initialData.author || getUserDisplayName(),
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

// Generic form field update handler
const updateFormField = (field: string, value: any) => {
  // Handle nested field updates (e.g., 'approvals.design.visualDesign')
  if (field.includes('.')) {
    const keys = field.split('.')
    let current = formData as any
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
  } else {
    // Handle direct field updates
    ;(formData as any)[field] = value
  }
}
</script>

<style scoped>
.feature-spec-form {
  max-width: var(--max-width-lg);
  margin: 0 auto;
  padding: var(--spacing-8);
  font-family: var(--font-family-sans);
}

.form-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border);
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

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  background: var(--color-gray-400);
  cursor: not-allowed;
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
