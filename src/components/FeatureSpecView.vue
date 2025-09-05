<template>
  <div class="feature-spec-view">
    <div class="spec-header">
      <div class="spec-title">
        <h1>{{ spec.featureName }}</h1>
        <div class="spec-meta">
          <span class="spec-author">By {{ spec.author }}</span>
          <span class="spec-date">{{ formatDate(spec.date) }}</span>
          <span
            class="spec-status"
            :class="`status-${spec.status.toLowerCase().replace(' ', '-')}`"
          >
            {{ spec.status }}
          </span>
        </div>
      </div>
      <div class="spec-actions">
        <button @click="handleEdit" class="btn-secondary">Edit</button>
        <button @click="handleExport" class="btn-primary">Export</button>
        <button @click="handleBack" class="btn-secondary">← Back</button>
      </div>
    </div>

    <div class="spec-content">
      <div class="spec-main">
        <!-- Overview Section -->
        <section class="spec-section">
          <h2>Overview</h2>
          <div class="section-content">
            <p class="spec-summary">{{ spec.featureSummary }}</p>

            <div v-if="spec.successCriteria.length" class="subsection">
              <h3>Success Criteria</h3>
              <ul class="criteria-list">
                <li
                  v-for="criteria in spec.successCriteria"
                  :key="criteria.id"
                  class="criteria-item"
                >
                  <span class="criteria-type">{{ criteria.type }}:</span>
                  <span class="criteria-description">{{ criteria.description }}</span>
                </li>
              </ul>
            </div>

            <div v-if="spec.reviewers.length" class="subsection">
              <h3>Reviewers</h3>
              <div class="reviewers-list">
                <div v-for="reviewer in spec.reviewers" :key="reviewer.id" class="reviewer-item">
                  <span class="reviewer-name">{{ reviewer.name }}</span>
                  <span class="reviewer-role">{{ reviewer.role }}</span>
                  <span class="reviewer-status" :class="`status-${reviewer.status}`">
                    {{ reviewer.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- User Requirements Section -->
        <section
          v-if="spec.targetUsers.length || spec.userGoals.length || spec.useCases.length"
          class="spec-section"
        >
          <h2>User Requirements</h2>
          <div class="section-content">
            <div v-if="spec.targetUsers.length" class="subsection">
              <h3>Target Users</h3>
              <ul class="target-users-list">
                <li v-for="user in spec.targetUsers" :key="user.id" class="target-user-item">
                  <strong>{{ user.userType }}:</strong> {{ user.description }}
                </li>
              </ul>
            </div>

            <div v-if="spec.userGoals.length" class="subsection">
              <h3>User Goals</h3>
              <ul class="user-goals-list">
                <li v-for="goal in spec.userGoals" :key="goal.id" class="user-goal-item">
                  <strong>{{ goal.priority }}:</strong> {{ goal.goal }}
                </li>
              </ul>
            </div>

            <div v-if="spec.useCases.length" class="subsection">
              <h3>Use Cases</h3>
              <div class="use-cases-list">
                <div v-for="useCase in spec.useCases" :key="useCase.id" class="use-case-item">
                  <h4>{{ useCase.title }}</h4>
                  <p>{{ useCase.description }}</p>
                  <div v-if="useCase.steps.length" class="use-case-steps">
                    <h5>Steps:</h5>
                    <ol>
                      <li v-for="step in useCase.steps" :key="step">{{ step }}</li>
                    </ol>
                  </div>
                  <div class="use-case-outcome">
                    <strong>Expected Outcome:</strong> {{ useCase.expectedOutcome }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Behavioral Requirements Section -->
        <section v-if="spec.coreInteractions.length" class="spec-section">
          <h2>Behavioral Requirements</h2>
          <div class="section-content">
            <div class="subsection">
              <h3>Core Interactions</h3>
              <ul class="interactions-list">
                <li
                  v-for="interaction in spec.coreInteractions"
                  :key="interaction.id"
                  class="interaction-item"
                >
                  <strong>{{ interaction.interactionType }}:</strong> {{ interaction.description }}
                </li>
              </ul>
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

        <!-- Add Change Request Form -->
        <AddChangeRequest :feature-spec-id="spec.id" @created="handleChangeRequestCreated" />

        <!-- Change Requests List -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading change requests...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchChangeRequests" class="btn-primary btn-sm">Retry</button>
        </div>

        <div v-else-if="changeRequests.length === 0" class="empty-state">
          <p>No change requests yet</p>
          <p class="empty-hint">Be the first to add feedback!</p>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChangeRequests } from '../composables/useChangeRequests'
import { MarkdownService } from '../services/markdownService'
import AddChangeRequest from './AddChangeRequest.vue'
import ChangeRequestCard from './ChangeRequestCard.vue'
import type { FrontendFeatureSpec, ChangeRequest } from '../types/feature'

interface Props {
  spec: FrontendFeatureSpec
}

interface Emits {
  (e: 'edit', spec: FrontendFeatureSpec): void
  (e: 'back'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { changeRequests, loading, error, fetchChangeRequests } = useChangeRequests()

const markdownService = new MarkdownService()

// Load change requests when component mounts
onMounted(() => {
  fetchChangeRequests(props.spec.id)
})

// Computed properties for stats
const openRequests = computed(() => changeRequests.value.filter((cr) => cr.status === 'open'))

const totalRequests = computed(() => changeRequests.value.length)

// Event handlers
const handleEdit = () => {
  emit('edit', props.spec)
}

const handleBack = () => {
  emit('back')
}

const handleExport = async () => {
  try {
    const { filename, content } = await markdownService.exportSpec(props.spec)

    // Create and download file
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

const handleChangeRequestCreated = () => {
  // Refresh the change requests list
  fetchChangeRequests(props.spec.id)
}

const handleChangeRequestStatusChanged = () => {
  // Change request status was updated, no need to refresh
}

const handleChangeRequestDeleted = () => {
  // Refresh the change requests list
  fetchChangeRequests(props.spec.id)
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
.feature-spec-view {
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
}

.spec-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-8);
}

.spec-main {
  min-width: 0; /* Prevent grid overflow */
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

.subsection h4 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.subsection h5 {
  margin: var(--spacing-3) 0 var(--spacing-2) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.criteria-list,
.target-users-list,
.user-goals-list,
.interactions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.criteria-item,
.target-user-item,
.user-goal-item,
.interaction-item {
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-2);
}

.criteria-type {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.reviewers-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.reviewer-item {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
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

.use-cases-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.use-case-item {
  padding: var(--spacing-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-primary);
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

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
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
