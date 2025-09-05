<template>
  <div class="form-section">
    <h2>User Requirements</h2>

    <!-- User Goals -->
    <div class="form-group">
      <label>User Goals</label>
      <div v-for="(goal, index) in data.userGoals" :key="goal.id" class="goal-item">
        <div class="form-row">
          <div class="form-group flex-1">
            <input
              :value="goal.description"
              @input="updateGoal(index, 'description', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="What user wants to accomplish"
              class="form-input"
            />
          </div>
          <button type="button" @click="removeGoal(index)" class="btn-remove">Remove</button>
        </div>
      </div>
      <button type="button" @click="addGoal" class="btn-add">+ Add User Goal</button>
    </div>

    <!-- Use Cases -->
    <div class="form-group">
      <label>Use Cases</label>
      <div v-for="(useCase, index) in data.useCases" :key="useCase.id" class="use-case-item">
        <div class="use-case-header">
          <input
            :value="useCase.name"
            @input="updateUseCase(index, 'name', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Use Case Name"
            class="form-input use-case-name"
          />
          <button type="button" @click="removeUseCase(index)" class="btn-remove">Remove</button>
        </div>

        <div class="use-case-fields">
          <div class="form-group">
            <label>Context</label>
            <textarea
              :value="useCase.context"
              @input="updateUseCase(index, 'context', ($event.target as HTMLTextAreaElement).value)"
              placeholder="When/where this happens"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>User Action</label>
            <textarea
              :value="useCase.userAction"
              @input="
                updateUseCase(index, 'userAction', ($event.target as HTMLTextAreaElement).value)
              "
              placeholder="What user does step by step"
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Expected Outcome</label>
            <textarea
              :value="useCase.expectedOutcome"
              @input="
                updateUseCase(
                  index,
                  'expectedOutcome',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="What user sees/gets"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Success Condition</label>
            <textarea
              :value="useCase.successCondition"
              @input="
                updateUseCase(
                  index,
                  'successCondition',
                  ($event.target as HTMLTextAreaElement).value,
                )
              "
              placeholder="How we know it worked"
              rows="2"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
      </div>
      <button type="button" @click="addUseCase" class="btn-add">+ Add Use Case</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserGoal, UseCase } from '../../../types/feature'

interface Props {
  data: {
    userGoals: UserGoal[]
    useCases: UseCase[]
  }
}

interface Emits {
  (e: 'update', field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// User Goals management
const addGoal = () => {
  const newGoal: UserGoal = {
    id: crypto.randomUUID(),
    description: '',
  }
  const updatedGoals = [...props.data.userGoals, newGoal]
  emit('update', 'userGoals', updatedGoals)
}

const removeGoal = (index: number) => {
  const updatedGoals = props.data.userGoals.filter((_, i) => i !== index)
  emit('update', 'userGoals', updatedGoals)
}

const updateGoal = (index: number, field: keyof UserGoal, value: string) => {
  const updatedGoals = [...props.data.userGoals]
  updatedGoals[index] = { ...updatedGoals[index], [field]: value }
  emit('update', 'userGoals', updatedGoals)
}

// Use Cases management
const addUseCase = () => {
  const newUseCase: UseCase = {
    id: crypto.randomUUID(),
    name: '',
    context: '',
    userAction: '',
    expectedOutcome: '',
    successCondition: '',
  }
  const updatedUseCases = [...props.data.useCases, newUseCase]
  emit('update', 'useCases', updatedUseCases)
}

const removeUseCase = (index: number) => {
  const updatedUseCases = props.data.useCases.filter((_, i) => i !== index)
  emit('update', 'useCases', updatedUseCases)
}

const updateUseCase = (index: number, field: keyof UseCase, value: string) => {
  const updatedUseCases = [...props.data.useCases]
  updatedUseCases[index] = { ...updatedUseCases[index], [field]: value }
  emit('update', 'useCases', updatedUseCases)
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

.goal-item,
.use-case-item {
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-card);
}

.use-case-header {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.use-case-name {
  flex: 1;
}

.use-case-fields {
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
