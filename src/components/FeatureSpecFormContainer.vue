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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeatureSpecs } from '../composables/useFeatureSpecsSupabase'
import { useFieldChanges } from '../composables/useFieldChanges'
import { useAuth } from '../composables/useAuth'
import FeatureSpecForm from './forms/FeatureSpecForm.vue'
import type { FrontendFeatureSpec, FeatureSpecFormData } from '../types/feature'

interface Props {
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { createFeatureSpec, updateFeatureSpec, fetchFeatureSpecs } = useFeatureSpecs()

const editingSpec = ref<FrontendFeatureSpec | null>(null)
const loading = ref(false)

// Load spec data for edit mode
onMounted(async () => {
  if (props.mode === 'edit' && route.params.id) {
    loading.value = true
    try {
      await fetchFeatureSpecs()
      // Find the spec by ID from the fetched specs
      const specs = await fetchFeatureSpecs()
      editingSpec.value =
        specs.find((spec: FrontendFeatureSpec) => spec.id === route.params.id) || null
    } catch (error) {
      console.error('Error loading spec:', error)
    } finally {
      loading.value = false
    }
  }
})

// Function to create field changes from form data
const createFieldChangesFromFormData = async (
  featureSpecId: string,
  formData: FeatureSpecFormData,
) => {
  const { createFieldChange } = useFieldChanges(featureSpecId)

  // Compare form data with original spec data and create field changes for differences
  const originalSpec = editingSpec.value
  if (!originalSpec) return

  const changes = []

  // Check each field for changes
  if (formData.featureName !== originalSpec.featureName) {
    changes.push({
      featureSpecId,
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: originalSpec.featureName,
      newValue: formData.featureName,
      changeDescription: `Changed feature name from "${originalSpec.featureName}" to "${formData.featureName}"`,
    })
  }

  if (formData.featureSummary !== originalSpec.featureSummary) {
    changes.push({
      featureSpecId,
      fieldPath: 'featureSummary',
      fieldType: 'string',
      oldValue: originalSpec.featureSummary,
      newValue: formData.featureSummary,
      changeDescription: `Changed feature summary`,
    })
  }

  if (formData.status !== originalSpec.status) {
    changes.push({
      featureSpecId,
      fieldPath: 'status',
      fieldType: 'string',
      oldValue: originalSpec.status,
      newValue: formData.status,
      changeDescription: `Changed status from "${originalSpec.status}" to "${formData.status}"`,
    })
  }

  if (formData.date !== originalSpec.date?.toISOString().split('T')[0]) {
    changes.push({
      featureSpecId,
      fieldPath: 'date',
      fieldType: 'date',
      oldValue: originalSpec.date?.toISOString().split('T')[0],
      newValue: formData.date,
      changeDescription: `Changed date from "${originalSpec.date?.toISOString().split('T')[0]}" to "${formData.date}"`,
    })
  }

  // Create field changes for all detected changes
  for (const change of changes) {
    try {
      await createFieldChange(change)
      console.log('✅ Created field change:', change.fieldPath)
    } catch (error) {
      console.error('❌ Failed to create field change:', error)
    }
  }

  console.log(`📝 Created ${changes.length} field changes`)
}

const handleSubmit = async (data: FeatureSpecFormData) => {
  try {
    if (props.mode === 'edit' && editingSpec.value) {
      console.log(
        '💾 Processing edits for feature spec:',
        editingSpec.value.id,
        'with data:',
        data.featureName,
      )

      // Check if user is the owner - if not, create field changes instead of direct updates
      const isOwner = editingSpec.value.author === user.value?.email

      if (isOwner) {
        console.log('👑 Owner editing - updating directly')
        await updateFeatureSpec(editingSpec.value.id, data)
      } else {
        console.log('👤 Non-owner editing - creating field changes')
        await createFieldChangesFromFormData(editingSpec.value.id, data)
      }
    } else {
      console.log('➕ Creating new feature spec with data:', data.featureName)
      await createFeatureSpec(data)
    }

    // Navigate back to dashboard
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
