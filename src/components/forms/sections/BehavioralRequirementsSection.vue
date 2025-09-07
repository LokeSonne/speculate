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
          <Button type="button" @click="removeInteraction(index)" variant="danger" size="sm">
            <DeleteIcon :size="16" />
          </Button>
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

          <!-- Error States for this interaction -->
          <div class="form-group">
            <label>Error States</label>
            <div
              v-for="(errorState, errorIndex) in interaction.errorStates"
              :key="errorState.id"
              class="error-state-item"
            >
              <div class="error-state-header">
                <input
                  :value="errorState.type"
                  @input="
                    updateInteractionErrorState(
                      index,
                      errorIndex,
                      'type',
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  type="text"
                  placeholder="Error Type (e.g., Network Error, Validation Error)"
                  class="form-input error-state-name"
                />
                <Button
                  type="button"
                  @click="removeInteractionErrorState(index, errorIndex)"
                  variant="danger"
                  size="sm"
                >
                  <DeleteIcon :size="16" />
                </Button>
              </div>

              <div class="error-state-fields">
                <div class="form-group">
                  <label>Trigger</label>
                  <textarea
                    :value="errorState.trigger"
                    @input="
                      updateInteractionErrorState(
                        index,
                        errorIndex,
                        'trigger',
                        ($event.target as HTMLTextAreaElement).value,
                      )
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
                      updateInteractionErrorState(
                        index,
                        errorIndex,
                        'message',
                        ($event.target as HTMLTextAreaElement).value,
                      )
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
                      updateInteractionErrorState(
                        index,
                        errorIndex,
                        'recovery',
                        ($event.target as HTMLTextAreaElement).value,
                      )
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
                      updateInteractionErrorState(
                        index,
                        errorIndex,
                        'fallback',
                        ($event.target as HTMLTextAreaElement).value,
                      )
                    "
                    placeholder="What shows if recovery fails"
                    rows="2"
                    class="form-textarea"
                  ></textarea>
                </div>
              </div>
            </div>
            <Button
              type="button"
              @click="addInteractionErrorState(index)"
              variant="secondary"
              size="sm"
            >
              + Add Error State
            </Button>
          </div>

          <div class="form-group">
            <label>Loading State</label>
            <textarea
              :value="interaction.loadingState"
              @input="
                updateInteraction(
                  index,
                  'loadingState',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="Describe loading behavior, duration, user feedback, and timeout handling"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Empty State</label>
            <textarea
              :value="interaction.emptyState"
              @input="
                updateInteraction(index, 'emptyState', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="Describe empty state scenario, message, visual, and actions"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Business Rules for this interaction -->
          <div class="form-group">
            <label>Business Rules</label>
            <div
              v-for="(rule, ruleIndex) in interaction.businessRules"
              :key="rule.id"
              class="business-rule-item"
            >
              <div class="form-row">
                <div class="form-group flex-1">
                  <textarea
                    :value="rule.description"
                    @input="
                      updateInteractionBusinessRule(
                        index,
                        ruleIndex,
                        'description',
                        ($event.target as HTMLTextAreaElement).value,
                      )
                    "
                    placeholder="Permissions, feature flags, analytics requirements"
                    rows="2"
                    class="form-textarea"
                  ></textarea>
                </div>
                <Button
                  type="button"
                  @click="removeInteractionBusinessRule(index, ruleIndex)"
                  variant="danger"
                  size="sm"
                >
                  <DeleteIcon :size="16" />
                </Button>
              </div>
            </div>
            <Button
              type="button"
              @click="addInteractionBusinessRule(index)"
              variant="secondary"
              size="sm"
            >
              + Add Business Rule
            </Button>
          </div>
        </div>
      </div>
      <Button type="button" @click="addInteraction" variant="secondary" size="sm"
        >+ Add Interaction</Button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoreInteraction } from '../../../types/feature'
import Button from '../../ui/Button.vue'
import DeleteIcon from '../../../icons/DeleteIcon.vue'

interface Props {
  data: {
    coreInteractions: CoreInteraction[]
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
    loadingState: '',
    emptyState: '',
    errorStates: [],
    businessRules: [],
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

// Interaction Error States management
const addInteractionErrorState = (interactionIndex: number) => {
  const newErrorState = {
    id: crypto.randomUUID(),
    type: '',
    trigger: '',
    message: '',
    recovery: '',
    fallback: '',
  }
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].errorStates.push(newErrorState)
  emit('update', 'coreInteractions', updatedInteractions)
}

const removeInteractionErrorState = (interactionIndex: number, errorIndex: number) => {
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].errorStates.splice(errorIndex, 1)
  emit('update', 'coreInteractions', updatedInteractions)
}

const updateInteractionErrorState = (
  interactionIndex: number,
  errorIndex: number,
  field: string,
  value: string,
) => {
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].errorStates[errorIndex] = {
    ...updatedInteractions[interactionIndex].errorStates[errorIndex],
    [field]: value,
  }
  emit('update', 'coreInteractions', updatedInteractions)
}

// Interaction Business Rules management
const addInteractionBusinessRule = (interactionIndex: number) => {
  const newBusinessRule = {
    id: crypto.randomUUID(),
    description: '',
  }
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].businessRules.push(newBusinessRule)
  emit('update', 'coreInteractions', updatedInteractions)
}

const removeInteractionBusinessRule = (interactionIndex: number, ruleIndex: number) => {
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].businessRules.splice(ruleIndex, 1)
  emit('update', 'coreInteractions', updatedInteractions)
}

const updateInteractionBusinessRule = (
  interactionIndex: number,
  ruleIndex: number,
  field: string,
  value: string,
) => {
  const updatedInteractions = [...props.data.coreInteractions]
  updatedInteractions[interactionIndex].businessRules[ruleIndex] = {
    ...updatedInteractions[interactionIndex].businessRules[ruleIndex],
    [field]: value,
  }
  emit('update', 'coreInteractions', updatedInteractions)
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
.error-state-item,
.business-rule-item {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-card);
}

.interaction-header,
.error-state-header {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.interaction-name,
.error-state-name {
  flex: 1;
}

.interaction-fields,
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
