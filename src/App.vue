<template>
  <AuthGuard>
    <div class="app">
      <!-- Mock Authentication Status (Development Only) -->
      <MockAuthStatus />

      <header class="app-header">
        <div class="header-content">
          <div class="header-text">
            <h1>Frontend Feature Specs</h1>
            <p>Create and manage frontend feature specifications</p>
          </div>
          <div class="user-info">
            <span class="user-email">Welcome, {{ user?.email }}</span>
            <button @click="handleSignOut" class="btn btn-secondary btn-sm">Sign Out</button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <Dashboard
          v-if="!showForm && !viewingSpec"
          @create-spec="handleCreateSpec"
          @edit-spec="handleEditSpec"
          @view-spec="handleViewSpec"
          :refresh-trigger="refreshDashboard"
        />

        <FeatureSpecView
          v-else-if="viewingSpec"
          :spec="viewingSpec"
          @back="handleBackToDashboard"
        />

        <FeatureSpecFormContainer
          v-else
          :editing-spec="editingSpec"
          @submit="handleFormSubmit"
          @cancel="handleFormCancel"
        />
      </main>
    </div>
  </AuthGuard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from './composables/useAuth'
import { useFeatureSpecs } from './composables/useFeatureSpecsSupabase'
import { useFieldChanges } from './composables/useFieldChanges'
import AuthGuard from './components/AuthGuard.vue'
import Dashboard from './components/Dashboard.vue'
import FeatureSpecView from './components/EditableFeatureSpecView.vue'
import FeatureSpecFormContainer from './components/FeatureSpecFormContainer.vue'
import MockAuthStatus from './components/MockAuthStatus.vue'
import type { FrontendFeatureSpec, FeatureSpecFormData } from './types/feature'

const { user, signOut } = useAuth()
const { createFeatureSpec, updateFeatureSpec } = useFeatureSpecs()

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

const showForm = ref(false)
const viewingSpec = ref<FrontendFeatureSpec | null>(null)
const editingSpec = ref<FrontendFeatureSpec | null>(null)
const refreshDashboard = ref(false)

const handleCreateSpec = () => {
  editingSpec.value = null
  showForm.value = true
}

const handleEditSpec = (spec: FrontendFeatureSpec) => {
  editingSpec.value = spec
  showForm.value = true
}

const handleViewSpec = (spec: FrontendFeatureSpec) => {
  viewingSpec.value = spec
  showForm.value = false
}

const handleBackToDashboard = () => {
  viewingSpec.value = null
  showForm.value = false
}

const handleFormSubmit = async (data: FeatureSpecFormData) => {
  if (editingSpec.value) {
    console.log(
      '💾 Processing edits for feature spec:',
      editingSpec.value.id,
      'with data:',
      data.featureName,
    )

    // Check if user is the owner - if not, create field changes instead of direct updates
    const { user } = useAuth()
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

  // Refresh the dashboard data to show updated information
  console.log('🔄 Triggering dashboard refresh...')
  refreshDashboard.value = !refreshDashboard.value

  showForm.value = false
  editingSpec.value = null
}

const handleFormCancel = () => {
  showForm.value = false
  editingSpec.value = null
}

const handleSignOut = async () => {
  await signOut()
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--color-background);
  font-family: var(--font-family-sans);
}

.app-header {
  background: var(--color-background-card);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.header-content {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.header-text {
  flex: 1;
}

.app-header h1 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.app-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-shrink: 0;
}

.user-email {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
}

.app-main {
  max-width: var(--max-width-2xl);
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-6);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }

  .user-info {
    align-self: flex-end;
  }

  .app-header h1 {
    font-size: var(--font-size-2xl);
  }

  .app-main {
    padding: var(--spacing-6) var(--spacing-4);
  }
}
</style>
