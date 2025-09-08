<template>
  <div class="editable-feature-spec-view">
    <div class="spec-header">
      <div class="spec-title">
        <h1>
          <input
            v-if="isEditing"
            v-model="editableSpec.featureName"
            type="text"
            class="editable-title"
            @blur="trackChange('featureName', localSpec.featureName, editableSpec.featureName)"
          />
          <span v-else>{{ localSpec.featureName }}</span>
        </h1>
        <div class="spec-meta">
          <span class="spec-author">By {{ localSpec.author }}</span>
          <span class="spec-date">{{ formatDate(localSpec.date) }}</span>
          <span
            class="spec-status"
            :class="`status-${localSpec.status.toLowerCase().replace(' ', '-')}`"
          >
            {{ localSpec.status }}
          </span>
        </div>
      </div>
      <div class="spec-actions">
        <button v-if="!isEditing" @click="startEditing" class="btn-primary">Edit Spec</button>
        <div v-else class="edit-actions">
          <button @click="saveChanges" :disabled="!hasChanges || isSaving" class="btn-primary">
            {{ isSaving ? 'Saving...' : `Save Changes (${changeCount})` }}
          </button>
          <button @click="addSuggestions" :disabled="!hasChanges || isSaving" class="btn-secondary">
            Add Suggestions
          </button>
          <button @click="cancelEditing" class="btn-secondary">Cancel</button>
        </div>
        <button @click="handleExport" class="btn-secondary">Export</button>
        <button @click="handleBack" class="btn-secondary">← Back</button>
      </div>
    </div>

    <div class="spec-content">
      <div class="spec-main">
        <!-- Overview Section -->
        <section class="spec-section">
          <h2>Overview</h2>
          <div class="section-content">
            <div class="editable-field">
              <label>Feature Summary</label>
              <textarea
                v-if="isEditing"
                v-model="editableSpec.featureSummary"
                class="editable-textarea"
                rows="3"
                @blur="
                  trackChange(
                    'featureSummary',
                    localSpec.featureSummary,
                    editableSpec.featureSummary,
                  )
                "
              />
              <p v-else class="spec-summary">{{ localSpec.featureSummary }}</p>
            </div>

            <div
              v-if="localSpec.successCriteria && localSpec.successCriteria.length"
              class="subsection"
            >
              <h3>Success Criteria</h3>
              <div class="criteria-list">
                <div
                  v-for="(criteria, index) in localSpec.successCriteria"
                  :key="criteria.id"
                  class="criteria-item"
                >
                  <div v-if="isEditing" class="editable-criteria">
                    <select
                      v-model="editableSpec.successCriteria[index].type"
                      class="editable-select"
                      @change="trackCriteriaChange(index, 'type')"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Key">Key</option>
                    </select>
                    <input
                      v-model="editableSpec.successCriteria[index].description"
                      type="text"
                      class="editable-input"
                      @blur="trackCriteriaChange(index, 'description')"
                    />
                    <button @click="removeCriteria(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="criteria-display">
                    <span class="criteria-type">{{ criteria.type }}:</span>
                    <span class="criteria-description">{{ criteria.description }}</span>
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addCriteria" class="btn-add">
                + Add Success Criteria
              </button>
            </div>

            <div v-if="localSpec.reviewers && localSpec.reviewers.length" class="subsection">
              <h3>Reviewers</h3>
              <div class="reviewers-list">
                <div
                  v-for="(reviewer, index) in localSpec.reviewers"
                  :key="reviewer.id"
                  class="reviewer-item"
                >
                  <div v-if="isEditing" class="editable-reviewer">
                    <input
                      v-model="editableSpec.reviewers[index].name"
                      type="text"
                      class="editable-input"
                      @blur="trackReviewerChange(index, 'name')"
                    />
                    <select
                      v-model="editableSpec.reviewers[index].role"
                      class="editable-select"
                      @change="trackReviewerChange(index, 'role')"
                    >
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Engineering">Engineering</option>
                    </select>
                    <button @click="removeReviewer(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="reviewer-display">
                    <span class="reviewer-name">{{ reviewer.name }}</span>
                    <span class="reviewer-role">{{ reviewer.role }}</span>
                    <span class="reviewer-status" :class="`status-${reviewer.status}`">
                      {{ reviewer.status }}
                    </span>
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addReviewer" class="btn-add">+ Add Reviewer</button>
            </div>
          </div>
        </section>

        <!-- User Requirements Section -->
        <section
          v-if="
            (localSpec.targetUsers && localSpec.targetUsers.length) ||
            (localSpec.userGoals && localSpec.userGoals.length) ||
            (localSpec.useCases && localSpec.useCases.length)
          "
          class="spec-section"
        >
          <h2>User Requirements</h2>
          <div class="section-content">
            <div v-if="localSpec.targetUsers && localSpec.targetUsers.length" class="subsection">
              <h3>Target Users</h3>
              <div class="target-users-list">
                <div
                  v-for="(user, index) in localSpec.targetUsers"
                  :key="user.id"
                  class="target-user-item"
                >
                  <div v-if="isEditing" class="editable-target-user">
                    <select
                      v-model="editableSpec.targetUsers[index].type"
                      class="editable-select"
                      @change="trackTargetUserChange(index, 'type')"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                    </select>
                    <textarea
                      v-model="editableSpec.targetUsers[index].description"
                      placeholder="Description"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackTargetUserChange(index, 'description')"
                    />
                    <button @click="removeTargetUser(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="target-user-display">
                    <strong>{{ user.type }}:</strong> {{ user.description }}
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addTargetUser" class="btn-add">
                + Add Target User
              </button>
            </div>

            <div v-if="localSpec.userGoals && localSpec.userGoals.length" class="subsection">
              <h3>User Goals</h3>
              <div class="user-goals-list">
                <div
                  v-for="(goal, index) in localSpec.userGoals"
                  :key="goal.id"
                  class="user-goal-item"
                >
                  <div v-if="isEditing" class="editable-user-goal">
                    <select
                      v-model="editableSpec.userGoals[index].priority"
                      class="editable-select"
                      @change="trackUserGoalChange(index, 'priority')"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <input
                      v-model="editableSpec.userGoals[index].description"
                      type="text"
                      class="editable-input"
                      @blur="trackUserGoalChange(index, 'description')"
                    />
                    <button @click="removeUserGoal(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="user-goal-display">
                    <strong>{{ goal.priority }}:</strong> {{ goal.description }}
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addUserGoal" class="btn-add">+ Add User Goal</button>
            </div>

            <div v-if="localSpec.useCases && localSpec.useCases.length" class="subsection">
              <h3>Use Cases</h3>
              <div class="use-cases-list">
                <div
                  v-for="(useCase, index) in localSpec.useCases"
                  :key="useCase.id"
                  class="use-case-item"
                >
                  <div v-if="isEditing" class="editable-use-case">
                    <input
                      v-model="editableSpec.useCases[index].name"
                      type="text"
                      placeholder="Use case name"
                      class="editable-input"
                      @blur="trackUseCaseChange(index, 'name')"
                    />
                    <textarea
                      v-model="editableSpec.useCases[index].context"
                      placeholder="Context"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackUseCaseChange(index, 'context')"
                    />
                    <textarea
                      v-model="editableSpec.useCases[index].userAction"
                      placeholder="User action"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackUseCaseChange(index, 'userAction')"
                    />
                    <textarea
                      v-model="editableSpec.useCases[index].expectedOutcome"
                      placeholder="Expected outcome"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackUseCaseChange(index, 'expectedOutcome')"
                    />
                    <button @click="removeUseCase(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="use-case-display">
                    <h4>{{ useCase.name }}</h4>
                    <p><strong>Context:</strong> {{ useCase.context }}</p>
                    <p><strong>User Action:</strong> {{ useCase.userAction }}</p>
                    <div class="use-case-outcome">
                      <strong>Expected Outcome:</strong> {{ useCase.expectedOutcome }}
                    </div>
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addUseCase" class="btn-add">+ Add Use Case</button>
            </div>
          </div>
        </section>

        <!-- Behavioral Requirements Section -->
        <section
          v-if="localSpec.coreInteractions && localSpec.coreInteractions.length"
          class="spec-section"
        >
          <h2>Behavioral Requirements</h2>
          <div class="section-content">
            <div class="subsection">
              <h3>Core Interactions</h3>
              <div class="interactions-list">
                <div
                  v-for="(interaction, index) in localSpec.coreInteractions"
                  :key="interaction.id"
                  class="interaction-item"
                >
                  <div v-if="isEditing" class="editable-interaction">
                    <input
                      v-model="editableSpec.coreInteractions[index].actionName"
                      type="text"
                      placeholder="Action name"
                      class="editable-input"
                      @blur="trackInteractionChange(index, 'actionName')"
                    />
                    <textarea
                      v-model="editableSpec.coreInteractions[index].trigger"
                      placeholder="Trigger"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackInteractionChange(index, 'trigger')"
                    />
                    <textarea
                      v-model="editableSpec.coreInteractions[index].behavior"
                      placeholder="Behavior"
                      class="editable-textarea"
                      rows="2"
                      @blur="trackInteractionChange(index, 'behavior')"
                    />
                    <button @click="removeInteraction(index)" class="btn-remove btn-sm">
                      <DeleteIcon :size="16" />
                    </button>
                  </div>
                  <div v-else class="interaction-display">
                    <strong>{{ interaction.actionName }}:</strong>
                    <p><strong>Trigger:</strong> {{ interaction.trigger }}</p>
                    <p><strong>Behavior:</strong> {{ interaction.behavior }}</p>
                  </div>
                </div>
              </div>
              <button v-if="isEditing" @click="addInteraction" class="btn-add">
                + Add Core Interaction
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Change Requests Sidebar -->
      <div class="change-requests-sidebar">
        <div class="sidebar-header">
          <h3>Change Requests</h3>
          <div class="change-request-stats">
            <span class="stat-item">
              <span class="stat-number">{{ openRequests.length }}</span>
              <span class="stat-label">Open</span>
            </span>
            <span class="stat-item">
              <span class="stat-number">{{ totalRequests }}</span>
              <span class="stat-label">Total</span>
            </span>
          </div>
        </div>

        <!-- Pending Changes -->
        <div v-if="isEditing && pendingChanges.length > 0" class="pending-changes">
          <h4>Pending Changes</h4>
          <div class="changes-list">
            <div v-for="(change, index) in pendingChanges" :key="index" class="change-item">
              <div class="change-field">{{ change.field }}</div>
              <div class="change-diff">
                <div class="change-old">{{ change.oldValue }}</div>
                <div class="change-new">{{ change.newValue }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Change Requests List -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading change requests...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="() => fetchChangeRequests(props.spec.id)" class="btn-primary btn-sm">
            Retry
          </button>
        </div>

        <div v-else-if="changeRequests.length === 0" class="empty-state">
          <p>No change requests yet</p>
          <p class="empty-hint">Start editing to create change requests!</p>
        </div>

        <div v-else class="change-requests-list">
          <ChangeRequestCard
            v-for="changeRequest in changeRequests"
            :key="changeRequest.id"
            :change-request="changeRequest"
            @status-changed="handleChangeRequestStatusChanged"
            @deleted="handleChangeRequestDeleted"
          />
        </div>

        <!-- Field Changes (Edit Suggestions) -->
        <div class="field-changes-section">
          <h4>Edit Suggestions</h4>
          <FieldChangeHistory
            :changes="fieldChanges"
            :is-owner="isOwner"
            :loading="isSaving"
            @accept="handleAcceptFieldChange"
            @reject="handleRejectFieldChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useChangeRequests } from '../composables/useChangeRequests'
import { useFeatureSpecs } from '../composables/useFeatureSpecsSupabase'
import { useFieldChanges } from '../composables/useFieldChanges'
import { useAuth } from '../composables/useAuth'
import { MarkdownService } from '../services/markdownService'
import ChangeRequestCard from './ChangeRequestCard.vue'
import FieldChangeHistory from './FieldChangeHistory.vue'
import DeleteIcon from '../icons/DeleteIcon.vue'
import type {
  FrontendFeatureSpec,
  FeatureSpecFormData,
  CreateFieldChangeData,
} from '../types/feature'

interface Props {
  spec: FrontendFeatureSpec
}

interface Emits {
  (e: 'back'): void
}

interface PendingChange {
  field: string
  oldValue: string
  newValue: string
  section?: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { changeRequests, loading, error, fetchChangeRequests, createChangeRequest } =
  useChangeRequests()

const { updateFeatureSpec } = useFeatureSpecs()
const { createFieldChange, updateFieldChangeStatus, fieldChanges, fetchFieldChanges } =
  useFieldChanges(props.spec.id)
const { user } = useAuth()
const markdownService = new MarkdownService()

// Editing state
const isEditing = ref(false)
const isSaving = ref(false)
const localSpec = ref<FrontendFeatureSpec>({ ...props.spec })
const editableSpec = reactive<FeatureSpecFormData>({
  organizationId: props.spec.organizationId,
  featureName: props.spec.featureName,
  author: props.spec.author,
  date: props.spec.date,
  status: props.spec.status,
  featureSummary: props.spec.featureSummary,
  reviewers: [...props.spec.reviewers],
  successCriteria: [...props.spec.successCriteria],
  targetUsers: [...props.spec.targetUsers],
  userGoals: [...props.spec.userGoals],
  useCases: [...props.spec.useCases],
  coreInteractions: [...props.spec.coreInteractions],
  loadingStates: [...props.spec.loadingStates],
  emptyStates: [...props.spec.emptyStates],
  errorStates: [...props.spec.errorStates],
  formBehavior: props.spec.formBehavior,
  layoutStructure: { ...props.spec.layoutStructure },
  visualHierarchy: { ...props.spec.visualHierarchy },
  componentSpecs: [...props.spec.componentSpecs],
  typographyContent: { ...props.spec.typographyContent },
  accessibilityRequirements: { ...props.spec.accessibilityRequirements },
  responsiveBehavior: { ...props.spec.responsiveBehavior },
  animationRequirements: [...props.spec.animationRequirements],
  edgeCases: [...props.spec.edgeCases],
  technicalConstraints: [...props.spec.technicalConstraints],
  businessRules: [...props.spec.businessRules],
  approvals: [...props.spec.approvals],
})

const pendingChanges = ref<PendingChange[]>([])

// Load change requests when component mounts
onMounted(() => {
  fetchChangeRequests(props.spec.id)
})

// Computed properties
const openRequests = computed(() => changeRequests.value.filter((cr) => cr.status === 'open'))

const totalRequests = computed(() => changeRequests.value.length)

const changeCount = computed(() => pendingChanges.value.length)

const hasChanges = computed(() => pendingChanges.value.length > 0)

const isOwner = computed(() => localSpec.value.author === user.value?.email)

// Change tracking
const trackChange = (field: string, oldValue: unknown, newValue: unknown, section?: string) => {
  if (oldValue !== newValue) {
    const existingChange = pendingChanges.value.find((c) => c.field === field)
    if (existingChange) {
      existingChange.newValue = String(newValue)
    } else {
      pendingChanges.value.push({
        field,
        oldValue: String(oldValue),
        newValue: String(newValue),
        section,
      })
    }
  }
}

const trackCriteriaChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.successCriteria[index]?.[
      field as keyof (typeof localSpec.value.successCriteria)[0]
    ]
  const newValue =
    editableSpec.successCriteria[index]?.[field as keyof (typeof editableSpec.successCriteria)[0]]
  trackChange(`successCriteria[${index}].${field}`, oldValue, newValue, 'Success Criteria')
}

const trackReviewerChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.reviewers[index]?.[field as keyof (typeof localSpec.value.reviewers)[0]]
  const newValue =
    editableSpec.reviewers[index]?.[field as keyof (typeof editableSpec.reviewers)[0]]
  trackChange(`reviewers[${index}].${field}`, oldValue, newValue, 'Reviewers')
}

const trackTargetUserChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.targetUsers[index]?.[field as keyof (typeof localSpec.value.targetUsers)[0]]
  const newValue =
    editableSpec.targetUsers[index]?.[field as keyof (typeof editableSpec.targetUsers)[0]]
  trackChange(`targetUsers[${index}].${field}`, oldValue, newValue, 'Target Users')
}

const trackUserGoalChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.userGoals[index]?.[field as keyof (typeof localSpec.value.userGoals)[0]]
  const newValue =
    editableSpec.userGoals[index]?.[field as keyof (typeof editableSpec.userGoals)[0]]
  trackChange(`userGoals[${index}].${field}`, oldValue, newValue, 'User Goals')
}

const trackUseCaseChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.useCases[index]?.[field as keyof (typeof localSpec.value.useCases)[0]]
  const newValue = editableSpec.useCases[index]?.[field as keyof (typeof editableSpec.useCases)[0]]
  trackChange(`useCases[${index}].${field}`, oldValue, newValue, 'Use Cases')
}

const trackInteractionChange = (index: number, field: string) => {
  const oldValue =
    localSpec.value.coreInteractions[index]?.[
      field as keyof (typeof localSpec.value.coreInteractions)[0]
    ]
  const newValue =
    editableSpec.coreInteractions[index]?.[field as keyof (typeof editableSpec.coreInteractions)[0]]
  trackChange(`coreInteractions[${index}].${field}`, oldValue, newValue, 'Core Interactions')
}

// Editing functions
const startEditing = () => {
  isEditing.value = true
  pendingChanges.value = []
}

const cancelEditing = () => {
  isEditing.value = false
  pendingChanges.value = []
  // Reset editable spec to current local spec values
  Object.assign(editableSpec, {
    featureName: localSpec.value.featureName,
    author: localSpec.value.author,
    date: localSpec.value.date,
    status: localSpec.value.status,
    featureSummary: localSpec.value.featureSummary,
    reviewers: [...localSpec.value.reviewers],
    successCriteria: [...localSpec.value.successCriteria],
    targetUsers: [...localSpec.value.targetUsers],
    userGoals: [...localSpec.value.userGoals],
    useCases: [...localSpec.value.useCases],
    coreInteractions: [...localSpec.value.coreInteractions],
    loadingStates: [...localSpec.value.loadingStates],
    emptyStates: [...localSpec.value.emptyStates],
    errorStates: [...localSpec.value.errorStates],
    formBehavior: localSpec.value.formBehavior,
    layoutStructure: { ...localSpec.value.layoutStructure },
    visualHierarchy: { ...localSpec.value.visualHierarchy },
    componentSpecs: [...localSpec.value.componentSpecs],
    typographyContent: { ...localSpec.value.typographyContent },
    accessibilityRequirements: { ...localSpec.value.accessibilityRequirements },
    responsiveBehavior: { ...localSpec.value.responsiveBehavior },
    animationRequirements: [...localSpec.value.animationRequirements],
    edgeCases: [...localSpec.value.edgeCases],
    technicalConstraints: [...localSpec.value.technicalConstraints],
    businessRules: [...localSpec.value.businessRules],
    approvals: [...localSpec.value.approvals],
  })
}

const saveChanges = async () => {
  if (!hasChanges.value) return

  isSaving.value = true

  try {
    // Update the feature spec directly without creating field changes
    await updateFeatureSpec(props.spec.id, editableSpec)

    // Update local spec and exit editing mode
    localSpec.value = {
      ...localSpec.value,
      ...editableSpec,
      status: editableSpec.status as 'Draft' | 'In Review' | 'Approved' | 'Locked',
    }
    isEditing.value = false
    pendingChanges.value = []

    // Refresh change requests
    await fetchChangeRequests(props.spec.id)
  } catch (error) {
    console.error('Error saving changes:', error)
  } finally {
    isSaving.value = false
  }
}

const addSuggestions = async () => {
  if (!hasChanges.value) return

  isSaving.value = true

  try {
    // Create field changes for each pending change
    for (const change of pendingChanges.value) {
      const fieldChangeData: CreateFieldChangeData = {
        featureSpecId: props.spec.id,
        fieldPath: change.field,
        fieldType: typeof change.newValue === 'string' ? 'string' : 'object',
        oldValue: change.oldValue,
        newValue: change.newValue,
        changeDescription: `Changed ${change.field} from "${change.oldValue}" to "${change.newValue}"`,
      }

      await createFieldChange(fieldChangeData)
    }

    // Update the feature spec
    await updateFeatureSpec(props.spec.id, editableSpec)

    // Update local spec and exit editing mode
    localSpec.value = {
      ...localSpec.value,
      ...editableSpec,
      status: editableSpec.status as 'Draft' | 'In Review' | 'Approved' | 'Locked',
    }
    isEditing.value = false
    pendingChanges.value = []

    // Refresh change requests
    await fetchChangeRequests(props.spec.id)
  } catch (error) {
    console.error('Error adding suggestions:', error)
  } finally {
    isSaving.value = false
  }
}

// Add/Remove functions for arrays
const addCriteria = () => {
  editableSpec.successCriteria.push({
    id: crypto.randomUUID(),
    type: 'Primary',
    description: '',
  })
}

const removeCriteria = (index: number) => {
  editableSpec.successCriteria.splice(index, 1)
}

const addReviewer = () => {
  editableSpec.reviewers.push({
    id: crypto.randomUUID(),
    name: '',
    role: 'Product',
    status: 'pending',
  })
}

const removeReviewer = (index: number) => {
  editableSpec.reviewers.splice(index, 1)
}

const addTargetUser = () => {
  editableSpec.targetUsers.push({
    id: crypto.randomUUID(),
    type: 'Primary',
    description: '',
    characteristics: [],
  })
}

const removeTargetUser = (index: number) => {
  editableSpec.targetUsers.splice(index, 1)
}

const addUserGoal = () => {
  editableSpec.userGoals.push({
    id: crypto.randomUUID(),
    description: '',
    priority: 1,
  })
}

const removeUserGoal = (index: number) => {
  editableSpec.userGoals.splice(index, 1)
}

const addUseCase = () => {
  editableSpec.useCases.push({
    id: crypto.randomUUID(),
    name: '',
    type: 'Primary',
    context: '',
    userAction: '',
    expectedOutcome: '',
    successCondition: '',
  })
}

const removeUseCase = (index: number) => {
  editableSpec.useCases.splice(index, 1)
}

const addInteraction = () => {
  editableSpec.coreInteractions.push({
    id: crypto.randomUUID(),
    actionName: '',
    trigger: '',
    behavior: '',
    visualFeedback: '',
    endState: '',
    loadingState: '',
    emptyState: '',
    errorStates: [],
    businessRules: [],
  })
}

const removeInteraction = (index: number) => {
  editableSpec.coreInteractions.splice(index, 1)
}

// Event handlers
const handleBack = () => {
  emit('back')
}

const handleExport = async () => {
  try {
    const { filename, content } = await markdownService.exportSpec(localSpec.value)

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting spec:', err)
  }
}

const handleChangeRequestStatusChanged = () => {
  // Change request status was updated, no need to refresh
}

const handleChangeRequestDeleted = () => {
  // Refresh the change requests list
  fetchChangeRequests(props.spec.id)
}

const handleAcceptFieldChange = async (changeId: string) => {
  try {
    await updateFieldChangeStatus(changeId, 'accepted')
    // Refresh field changes
    await fetchFieldChanges()
  } catch (error) {
    console.error('Failed to accept field change:', error)
  }
}

const handleRejectFieldChange = async (changeId: string) => {
  try {
    await updateFieldChangeStatus(changeId, 'rejected')
    // Refresh field changes
    await fetchFieldChanges()
  } catch (error) {
    console.error('Failed to reject field change:', error)
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
</script>

<style scoped>
.editable-feature-spec-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 2px solid var(--color-border);
}

.spec-title h1 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.editable-title {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  padding: 0;
  width: 100%;
}

.editable-title:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  background: var(--color-background-card);
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
}

.spec-meta {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  flex-wrap: wrap;
}

.spec-author,
.spec-date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.spec-status {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-draft {
  background: var(--color-yellow-100);
  color: var(--color-amber-600);
}

.status-in-review {
  background: var(--color-blue-100);
  color: var(--color-blue-600);
}

.status-approved {
  background: var(--color-green-100);
  color: var(--color-green-600);
}

.status-locked {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.spec-actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: var(--spacing-3);
}

.spec-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-8);
}

.spec-main {
  min-width: 0;
}

.spec-section {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.spec-section h2 {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-2);
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.editable-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.editable-field label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.editable-textarea,
.editable-input,
.editable-select {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--color-background);
  transition: border-color var(--transition-fast);
}

.editable-textarea:focus,
.editable-input:focus,
.editable-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.editable-textarea {
  resize: vertical;
  min-height: 80px;
}

.spec-summary {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin: 0;
}

.subsection {
  margin-top: var(--spacing-4);
}

.subsection h3 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.criteria-list,
.reviewers-list,
.target-users-list,
.user-goals-list,
.use-cases-list,
.interactions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.criteria-item,
.reviewer-item,
.target-user-item,
.user-goal-item,
.use-case-item,
.interaction-item {
  padding: var(--spacing-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.editable-criteria,
.editable-reviewer,
.editable-target-user,
.editable-user-goal,
.editable-use-case,
.editable-interaction {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
}

.editable-criteria .editable-select,
.editable-reviewer .editable-select {
  min-width: 120px;
}

.editable-criteria .editable-input,
.editable-reviewer .editable-input,
.editable-target-user .editable-input,
.editable-user-goal .editable-input,
.editable-interaction .editable-input {
  flex: 1;
}

.editable-target-user,
.editable-user-goal,
.editable-use-case,
.editable-interaction {
  flex-direction: column;
  gap: var(--spacing-2);
}

.editable-target-user .editable-input,
.editable-user-goal .editable-input,
.editable-interaction .editable-input {
  width: 100%;
}

.editable-use-case {
  gap: var(--spacing-3);
}

.editable-use-case .editable-input,
.editable-use-case .editable-textarea {
  width: 100%;
}

.criteria-display,
.reviewer-display,
.target-user-display,
.user-goal-display,
.use-case-display,
.interaction-display {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.criteria-type {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.reviewer-name {
  font-weight: var(--font-weight-medium);
}

.reviewer-role {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.reviewer-status {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.reviewer-status.status-pending {
  background: var(--color-yellow-100);
  color: var(--color-amber-600);
}

.reviewer-status.status-approved {
  background: var(--color-green-100);
  color: var(--color-green-600);
}

.reviewer-status.status-rejected {
  background: var(--color-red-100);
  color: var(--color-red-600);
}

.use-case-steps ol {
  margin: var(--spacing-2) 0;
  padding-left: var(--spacing-6);
}

.use-case-outcome {
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
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

.btn-sm {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
}

/* Change Requests Sidebar */
.change-requests-sidebar {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  height: fit-content;
  position: sticky;
  top: var(--spacing-6);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.change-request-stats {
  display: flex;
  gap: var(--spacing-4);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.pending-changes {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--color-yellow-50);
  border: 1px solid var(--color-yellow-200);
  border-radius: var(--radius-md);
}

.pending-changes h4 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-amber-700);
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.change-item {
  padding: var(--spacing-2);
  background: var(--color-background);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-yellow-100);
}

.change-field {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-amber-600);
  text-transform: uppercase;
}

.change-diff {
  margin-top: var(--spacing-1);
}

.change-old {
  font-size: var(--font-size-xs);
  color: var(--color-red-600);
  text-decoration: line-through;
}

.change-new {
  font-size: var(--font-size-xs);
  color: var(--color-green-600);
  font-weight: var(--font-weight-medium);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-8);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-gray-200);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-4);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: var(--spacing-2);
}

.change-requests-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.field-changes-section {
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.field-changes-section h4 {
  margin: 0 0 var(--spacing-3) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
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

/* Responsive Design */
@media (max-width: 1200px) {
  .spec-content {
    grid-template-columns: 1fr;
  }

  .change-requests-sidebar {
    position: static;
    order: -1;
  }
}
</style>
