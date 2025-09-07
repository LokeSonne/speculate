<template>
  <div class="field-change-history">
    <div v-if="!changes || changes.length === 0" class="no-changes">
      <span class="text-sm text-muted">No changes yet</span>
    </div>

    <div v-else class="changes-list">
      <div
        v-for="change in changes"
        :key="change?.id || Math.random()"
        class="change-item"
        :class="`change-${change?.status || 'unknown'}`"
      >
        <!-- Main change information -->
        <div class="change-main">
          <div class="change-content">
            <div class="change-value">
              <span class="change-label">New value:</span>
              <span class="change-text">{{ formatValue(change?.newValue) }}</span>
            </div>
            <div
              v-if="change?.oldValue !== null && change?.oldValue !== undefined"
              class="change-old"
            >
              <span class="change-label">Previous:</span>
              <span class="change-text old-value">{{ formatValue(change?.oldValue) }}</span>
            </div>
            <div v-if="change?.changeDescription" class="change-description">
              <span class="change-label">Description:</span>
              <span class="change-text">{{ change.changeDescription }}</span>
            </div>
          </div>

          <!-- Owner controls -->
          <div v-if="isOwner && change?.status === 'pending'" class="owner-controls">
            <button
              @click="acceptChange(change?.id)"
              class="btn btn-success btn-sm"
              :disabled="loading"
            >
              Accept
            </button>
            <button
              @click="rejectChange(change?.id)"
              class="btn btn-error btn-sm"
              :disabled="loading"
            >
              Reject
            </button>
          </div>
        </div>

        <!-- Secondary information (accepted state) -->
        <div v-if="change?.status === 'accepted'" class="change-secondary">
          <span class="badge badge-success">Accepted</span>
        </div>
        <div v-else-if="change?.status === 'rejected'" class="change-secondary">
          <span class="badge badge-error">Rejected</span>
        </div>
        <div v-else class="change-secondary">
          <span class="badge badge-warning">Pending</span>
        </div>

        <!-- Tertiary information (author and date) -->
        <div class="change-tertiary">
          <span class="change-author">{{ change?.authorEmail }}</span>
          <span class="change-date">{{ formatDate(change?.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldChange, FieldChangeStatus } from '../../types/feature'

interface Props {
  changes: FieldChange[]
  isOwner: boolean
  loading?: boolean
}

interface Emits {
  (e: 'accept', changeId: string): void
  (e: 'reject', changeId: string): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const acceptChange = (changeId: string) => {
  emit('accept', changeId)
}

const rejectChange = (changeId: string) => {
  emit('reject', changeId)
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'Empty'
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}
</script>

<style scoped>
.field-change-history {
  margin-top: var(--spacing-2);
}

.no-changes {
  padding: var(--spacing-2);
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.change-item {
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background-elevated);
  transition: var(--transition-colors);
}

.change-item:hover {
  border-color: var(--color-border);
}

.change-item.change-accepted {
  border-left: 3px solid var(--color-success);
}

.change-item.change-rejected {
  border-left: 3px solid var(--color-error);
}

.change-item.change-pending {
  border-left: 3px solid var(--color-warning);
}

.change-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.change-content {
  flex: 1;
}

.change-value,
.change-old,
.change-description {
  margin-bottom: var(--spacing-1);
}

.change-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-right: var(--spacing-2);
}

.change-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  word-break: break-word;
}

.change-text.old-value {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.owner-controls {
  display: flex;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.change-secondary {
  margin-bottom: var(--spacing-1);
}

.change-tertiary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.change-author {
  font-weight: var(--font-weight-medium);
}

.change-date {
  font-style: italic;
}

@media (max-width: 768px) {
  .change-main {
    flex-direction: column;
    align-items: stretch;
  }

  .owner-controls {
    align-self: flex-end;
  }

  .change-tertiary {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-1);
  }
}
</style>
