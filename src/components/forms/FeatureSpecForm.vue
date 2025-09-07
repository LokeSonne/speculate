<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Overview Section -->
      <OverviewSection
        :data="{
          featureName: formData.featureName,
          author: formData.author,
          date: formData.date,
          status: formData.status,
          featureSummary: formData.featureSummary,
        }"
        :errors="errors || {}"
        :is-editing="props.isEditing"
        :feature-spec-id="props.initialData.id"
        @update="updateFormField"
        @field-change="handleFieldChange"
        @apply-accepted-change="applyAcceptedChange"
      />

      <!-- User Requirements Section -->
      <UserRequirementsSection
        :data="{
          userGoals: formData.userGoals,
          useCases: formData.useCases,
        }"
        :feature-spec-id="props.initialData.id"
        :is-owner="true"
        :is-editing="props.isEditing"
        @update="updateFormField"
        @field-change="handleFieldChange"
        @apply-accepted-change="applyAcceptedChange"
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
        :feature-spec-id="props.initialData.id"
        :is-owner="true"
        :is-editing="props.isEditing"
        @update="updateFormField"
        @apply-accepted-change="applyAcceptedChange"
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
        <Button type="button" @click="handleCancel" variant="secondary">Cancel</Button>
        <Button type="submit" :disabled="isSubmitting" variant="primary">
          {{ isSubmitting ? 'Saving...' : 'Save Feature Spec' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useFieldChanges } from '../../composables/useFieldChangesQuery'
import { useFeatureSpecForm } from '../../composables/useFeatureSpecForm'
import Button from '../ui/Button.vue'
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

// Field changes functionality
const { createFieldChange } =
  props.isEditing && props.initialData.id
    ? useFieldChanges(props.initialData.id)
    : {
        createFieldChange: async () => {},
      }

// Get user's display name (full name or email)
const getUserDisplayName = () => {
  if (!user.value) return ''

  // Try to get full name from user metadata first
  const fullName = user.value.user_metadata?.full_name
  if (fullName) return fullName

  // Fall back to email
  return user.value.email || ''
}

// Initialize TanStack Form with user data
const initialFormData = computed(() => ({
  ...props.initialData,
  author: props.initialData.author || getUserDisplayName(),
}))

const { formData, errors, isSubmitting, isValid, updateField } = useFeatureSpecForm(
  initialFormData.value,
)

// Form handlers
const handleSubmit = async () => {
  // Don't submit if we're applying an accepted change
  if (isApplyingAcceptedChange.value) {
    return
  }

  // Only emit submit if the form is valid
  if (isValid.value) {
    emit('submit', formData.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// Generic form field update handler
const updateFormField = (field: string, value: unknown) => {
  console.trace('Call stack for updateFormField')
  updateField(field, value)
}

// Handle field changes for collaborative editing
const handleFieldChange = async (fieldPath: string, oldValue: unknown, newValue: unknown) => {
  console.trace('Call stack for handleFieldChange')

  if (!props.isEditing || !props.initialData.id) return

  try {
    await createFieldChange({
      featureSpecId: props.initialData.id,
      fieldPath,
      fieldType: typeof newValue === 'string' ? 'string' : 'object',
      oldValue,
      newValue,
      changeDescription: `Changed ${fieldPath} from "${oldValue}" to "${newValue}"`,
    })
  } catch (error) {
    console.error('Failed to create field change:', error)
  }
}

// Flag to prevent form submission when applying accepted changes
const isApplyingAcceptedChange = ref(false)

// Watch for form data changes to reset the flag
watch(
  formData,
  () => {
    if (isApplyingAcceptedChange.value) {
      isApplyingAcceptedChange.value = false
    }
  },
  { deep: true },
)

// Special handler for applying accepted changes without triggering form submission
const applyAcceptedChange = (field: string, value: unknown) => {
  isApplyingAcceptedChange.value = true
  updateField(field, value)
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-8);
}

.space-y-8 > * + * {
  margin-top: var(--spacing-8);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
