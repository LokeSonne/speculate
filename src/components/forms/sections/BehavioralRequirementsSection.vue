<template>
  <div class="form-section">
    <h2>Behavioral Requirements</h2>

    <!-- Core Interactions -->
    <div class="form-group">
      <label>Core Interactions</label>
      <div
        v-for="(interaction, index) in data.coreInteractions"
        :key="interaction.id"
        class="interaction-item"
      >
        <div class="interaction-header">
          <input
            :value="interaction.actionName"
            @input="
              updateInteraction(index, 'actionName', ($event.target as HTMLInputElement).value)
            "
            type="text"
            placeholder="Action Name"
            class="form-input interaction-name"
          />
          <button type="button" @click="removeInteraction(index)" class="btn-remove">Remove</button>
        </div>

        <div class="interaction-fields">
          <div class="form-group">
            <label>Trigger</label>
            <textarea
              :value="interaction.trigger"
              @input="
                updateInteraction(index, 'trigger', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What starts this interaction"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Behavior</label>
            <textarea
              :value="interaction.behavior"
              @input="
                updateInteraction(index, 'behavior', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="Detailed step-by-step behavior"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Visual Feedback</label>
            <textarea
              :value="interaction.visualFeedback"
              @input="
                updateInteraction(
                  index,
                  'visualFeedback',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="What user sees during interaction"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>End State</label>
            <textarea
              :value="interaction.endState"
              @input="
                updateInteraction(index, 'endState', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="Where user ends up"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Error Scenarios</label>
            <textarea
              :value="interaction.errorScenarios"
              @input="
                updateInteraction(
                  index,
                  'errorScenarios',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="What happens when things go wrong"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <button type="button" @click="addInteraction" class="btn-add">+ Add Interaction</button>
    </div>

    <!-- Loading States -->
    <div class="form-group">
      <label>Loading States</label>
      <div
        v-for="(loadingState, index) in data.loadingStates"
        :key="loadingState.id"
        class="loading-state-item"
      >
        <div class="loading-state-header">
          <input
            :value="loadingState.name"
            @input="updateLoadingState(index, 'name', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Loading State Name (e.g., Initial Load, Data Loading)"
            class="form-input loading-state-name"
          />
          <button type="button" @click="removeLoadingState(index)" class="btn-remove">
            Remove
          </button>
        </div>

        <div class="loading-state-fields">
          <div class="form-group">
            <label>Behavior</label>
            <textarea
              :value="loadingState.behavior"
              @input="
                updateLoadingState(index, 'behavior', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What happens during this loading state"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Duration</label>
            <input
              :value="loadingState.duration"
              @input="
                updateLoadingState(index, 'duration', ($event.target as HTMLInputElement).value)
              "
              type="text"
              placeholder="Expected time ranges"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>User Feedback</label>
            <textarea
              :value="loadingState.userFeedback"
              @input="
                updateLoadingState(
                  index,
                  'userFeedback',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="Loading indicators, skeleton states, progress bars"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Timeout Handling</label>
            <textarea
              :value="loadingState.timeoutHandling"
              @input="
                updateLoadingState(
                  index,
                  'timeoutHandling',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="What happens if loading fails/times out"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <button type="button" @click="addLoadingState" class="btn-add">+ Add Loading State</button>
    </div>

    <!-- Empty States -->
    <div class="form-group">
      <label>Empty States</label>
      <div
        v-for="(emptyState, index) in data.emptyStates"
        :key="emptyState.id"
        class="empty-state-item"
      >
        <div class="empty-state-header">
          <input
            :value="emptyState.scenario"
            @input="updateEmptyState(index, 'scenario', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Empty State Scenario"
            class="form-input empty-state-name"
          />
          <button type="button" @click="removeEmptyState(index)" class="btn-remove">Remove</button>
        </div>

        <div class="empty-state-fields">
          <div class="form-group">
            <label>Message</label>
            <textarea
              :value="emptyState.message"
              @input="
                updateEmptyState(index, 'message', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="Exact text to display"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Visual</label>
            <textarea
              :value="emptyState.visual"
              @input="
                updateEmptyState(index, 'visual', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What user sees"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Actions</label>
            <textarea
              :value="emptyState.actions"
              @input="
                updateEmptyState(index, 'actions', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What user can do from here"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <button type="button" @click="addEmptyState" class="btn-add">+ Add Empty State</button>
    </div>

    <!-- Error States -->
    <div class="form-group">
      <label>Error States</label>
      <div
        v-for="(errorState, index) in data.errorStates"
        :key="errorState.id"
        class="error-state-item"
      >
        <div class="error-state-header">
          <input
            :value="errorState.type"
            @input="updateErrorState(index, 'type', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Error Type (e.g., Network Error, Validation Error)"
            class="form-input error-state-name"
          />
          <button type="button" @click="removeErrorState(index)" class="btn-remove">Remove</button>
        </div>

        <div class="error-state-fields">
          <div class="form-group">
            <label>Trigger</label>
            <textarea
              :value="errorState.trigger"
              @input="
                updateErrorState(index, 'trigger', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What causes this error"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Message</label>
            <textarea
              :value="errorState.message"
              @input="
                updateErrorState(index, 'message', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="Exact error text and placement"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Recovery</label>
            <textarea
              :value="errorState.recovery"
              @input="
                updateErrorState(index, 'recovery', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="How user can recover/fix it"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Fallback</label>
            <textarea
              :value="errorState.fallback"
              @input="
                updateErrorState(index, 'fallback', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What shows if recovery fails"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <button type="button" @click="addErrorState" class="btn-add">+ Add Error State</button>
    </div>

    <!-- Business Rules -->
    <div class="form-group">
      <label>Business Rules</label>
      <div v-for="(rule, index) in data.businessRules" :key="rule.id" class="business-rule-item">
        <div class="form-row">
          <div class="form-group flex-1">
            <textarea
              :value="rule.description"
              @input="
                updateBusinessRule(
                  index,
                  'description',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="Permissions, feature flags, analytics requirements"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
          <button type="button" @click="removeBusinessRule(index)" class="btn-remove">
            Remove
          </button>
        </div>
      </div>
      <button type="button" @click="addBusinessRule" class="btn-add">+ Add Business Rule</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CoreInteraction,
  LoadingState,
  EmptyState,
  ErrorState,
  BusinessRule,
} from '../../../types/feature'

interface Props {
  data: {
    coreInteractions: CoreInteraction[]
    loadingStates: LoadingState[]
    emptyStates: EmptyState[]
    errorStates: ErrorState[]
    businessRules: BusinessRule[]
  }
}

interface Emits {
  (e: 'update', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Core Interactions management
const addInteraction = () => {
  const newInteraction: CoreInteraction = {
    id: crypto.randomUUID(),
    actionName: '',
    trigger: '',
    behavior: '',
    visualFeedback: '',
    endState: '',
    errorScenarios: '',
  }
  const updatedInteractions = [...props.data.coreInteractions, newInteraction]
  emit('update', 'coreInteractions', updatedInteractions)
}

const removeInteraction = (index: number) => {
  const updatedInteractions = props.data.coreInteractions.filter((_, i) => i !== index)
  emit('update', 'coreInteractions', updatedInteractions)
}

const updateInteraction = (index: number, field: keyof CoreInteraction, value: string) => {
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[index] = { ...updatedInteractions[index], [field]: value }
  emit('update', 'coreInteractions', updatedInteractions)
}

// Loading States management
const addLoadingState = () => {
  const newLoadingState: LoadingState = {
    id: crypto.randomUUID(),
    name: '',
    behavior: '',
    duration: '',
    userFeedback: '',
    timeoutHandling: '',
  }
  const updatedLoadingStates = [...props.data.loadingStates, newLoadingState]
  emit('update', 'loadingStates', updatedLoadingStates)
}

const removeLoadingState = (index: number) => {
  const updatedLoadingStates = props.data.loadingStates.filter((_, i) => i !== index)
  emit('update', 'loadingStates', updatedLoadingStates)
}

const updateLoadingState = (index: number, field: keyof LoadingState, value: string) => {
  const updatedLoadingStates = [...props.data.loadingStates]
  updatedLoadingStates[index] = { ...updatedLoadingStates[index], [field]: value }
  emit('update', 'loadingStates', updatedLoadingStates)
}

// Empty States management
const addEmptyState = () => {
  const newEmptyState: EmptyState = {
    id: crypto.randomUUID(),
    scenario: '',
    message: '',
    visual: '',
    actions: '',
  }
  const updatedEmptyStates = [...props.data.emptyStates, newEmptyState]
  emit('update', 'emptyStates', updatedEmptyStates)
}

const removeEmptyState = (index: number) => {
  const updatedEmptyStates = props.data.emptyStates.filter((_, i) => i !== index)
  emit('update', 'emptyStates', updatedEmptyStates)
}

const updateEmptyState = (index: number, field: keyof EmptyState, value: string) => {
  const updatedEmptyStates = [...props.data.emptyStates]
  updatedEmptyStates[index] = { ...updatedEmptyStates[index], [field]: value }
  emit('update', 'emptyStates', updatedEmptyStates)
}

// Error States management
const addErrorState = () => {
  const newErrorState: ErrorState = {
    id: crypto.randomUUID(),
    type: '',
    trigger: '',
    message: '',
    recovery: '',
    fallback: '',
  }
  const updatedErrorStates = [...props.data.errorStates, newErrorState]
  emit('update', 'errorStates', updatedErrorStates)
}

const removeErrorState = (index: number) => {
  const updatedErrorStates = props.data.errorStates.filter((_, i) => i !== index)
  emit('update', 'errorStates', updatedErrorStates)
}

const updateErrorState = (index: number, field: keyof ErrorState, value: string) => {
  const updatedErrorStates = [...props.data.errorStates]
  updatedErrorStates[index] = { ...updatedErrorStates[index], [field]: value }
  emit('update', 'errorStates', updatedErrorStates)
}

// Business Rules management
const addBusinessRule = () => {
  const newBusinessRule: BusinessRule = {
    id: crypto.randomUUID(),
    description: '',
  }
  const updatedBusinessRules = [...props.data.businessRules, newBusinessRule]
  emit('update', 'businessRules', updatedBusinessRules)
}

const removeBusinessRule = (index: number) => {
  const updatedBusinessRules = props.data.businessRules.filter((_, i) => i !== index)
  emit('update', 'businessRules', updatedBusinessRules)
}

const updateBusinessRule = (index: number, field: keyof BusinessRule, value: string) => {
  const updatedBusinessRules = [...props.data.businessRules]
  updatedBusinessRules[index] = { ...updatedBusinessRules[index], [field]: value }
  emit('update', 'businessRules', updatedBusinessRules)
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
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.interaction-item,
.loading-state-item,
.empty-state-item,
.error-state-item,
.business-rule-item {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-card);
}

.interaction-header,
.loading-state-header,
.empty-state-header,
.error-state-header {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.interaction-name,
.loading-state-name,
.empty-state-name,
.error-state-name {
  flex: 1;
}

.interaction-fields,
.loading-state-fields,
.empty-state-fields,
.error-state-fields {
  display: grid;
  gap: var(--spacing-4);
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
