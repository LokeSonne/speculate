<template>
  <div v-if="props.mode === 'edit' && isLoading" class="loading-container">
    <div class="loading-spinner">Loading...</div>
  </div>
  <FeatureSpecForm
    v-else-if="props.mode === 'create'"
    :initial-data="defaultFormData"
    :is-editing="false"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
  <FeatureSpecForm
    v-else-if="props.mode === 'edit' && editingSpec"
    :initial-data="editingSpec"
    :is-editing="true"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
  <div v-else class="error-container">
    <div class="error-message">Specification not found</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeatureSpecs, useFeatureSpec } from '../composables/useFeatureSpecsQuery'
import { useFieldChanges } from '../composables/useFieldChangesQuery'
import { useAuth } from '../composables/useAuth'
import { useOrganizationContext } from '../composables/useOrganizationContext'
import FeatureSpecForm from './forms/FeatureSpecForm.vue'
import { createDefaultFormData } from '../utils/defaultFormData'
import type { FeatureSpecFormData, FieldChange, CreateFieldChangeData } from '../types/feature'

interface Props {
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { currentOrganizationId } = useOrganizationContext()

// Use TanStack Query composables
const { createSpecAsync, updateSpecAsync } = useFeatureSpecs()
const { featureSpec: editingSpec, isLoading } = useFeatureSpec(
  props.mode === 'edit' ? (route.params.id as string) : '',
)

// Get field changes functionality for non-owner editing
const { createFieldChangeAsync } = useFieldChanges(
  props.mode === 'edit' ? (route.params.id as string) : '',
)

// Default form data for create mode
const defaultFormData = computed(() =>
  createDefaultFormData(user.value?.email || '', currentOrganizationId.value || ''),
)

// Function to create field changes from form data
const createFieldChangesFromFormData = async (
  featureSpecId: string,
  formData: FeatureSpecFormData,
  createFieldChange: (change: CreateFieldChangeData) => Promise<FieldChange>,
) => {
  // Compare form data with original spec data and create field changes for differences
  const originalSpec = editingSpec.value
  if (!originalSpec) return

  const changes = []

  // Check each field for changes
  if (formData.featureName !== originalSpec.featureName) {
    changes.push({
      featureSpecId,
      fieldPath: 'featureName',
      fieldType: 'string' as const,
      oldValue: originalSpec.featureName,
      newValue: formData.featureName,
      changeDescription: `Changed feature name from "${originalSpec.featureName}" to "${formData.featureName}"`,
    })
  }

  if (formData.featureSummary !== originalSpec.featureSummary) {
    changes.push({
      featureSpecId,
      fieldPath: 'featureSummary',
      fieldType: 'string' as const,
      oldValue: originalSpec.featureSummary,
      newValue: formData.featureSummary,
      changeDescription: `Changed feature summary`,
    })
  }

  if (formData.status !== originalSpec.status) {
    changes.push({
      featureSpecId,
      fieldPath: 'status',
      fieldType: 'string' as const,
      oldValue: originalSpec.status,
      newValue: formData.status,
      changeDescription: `Changed status from "${originalSpec.status}" to "${formData.status}"`,
    })
  }

  // Date comparison - compare Date objects directly
  if (formData.date.getTime() !== originalSpec.date?.getTime()) {
    changes.push({
      featureSpecId,
      fieldPath: 'date',
      fieldType: 'object' as const,
      oldValue: originalSpec.date,
      newValue: formData.date,
      changeDescription: `Changed date from "${originalSpec.date?.toISOString()}" to "${formData.date.toISOString()}"`,
    })
  }

  // Create field changes for all detected changes
  for (const change of changes) {
    try {
      await createFieldChange(change)
    } catch (error) {
      console.error('❌ Failed to create field change:', error)
    }
  }
}

const handleSubmit = async (data: FeatureSpecFormData) => {
  try {
    if (props.mode === 'edit' && editingSpec.value) {
      // Check if user is the owner - if not, create field changes instead of direct updates
      const isOwner = editingSpec.value.author === user.value?.email

      if (isOwner) {
        await updateSpecAsync({ id: editingSpec.value.id, data })
      } else {
        await createFieldChangesFromFormData(editingSpec.value.id, data, createFieldChangeAsync)
      }
    } else {
      await createSpecAsync(data)
    }

    // Navigate back to dashboard only after explicit form submission
    router.push('/dashboard')
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

const handleCancel = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.form-container {
  background: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  position: fixed;
  margin-right: var(--spacing-6);
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

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: var(--spacing-8);
}

.loading-spinner,
.error-message {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}
</style>
