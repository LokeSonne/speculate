<template>
  <div class="field-change-history">
    <div v-if="!changes || changes.length === 0" class="no-changes">
      <span class="text-sm text-muted">No changes yet</span>
    </div>

    <div v-else class="changes-list">
      <AccordionRoot
        v-for="change in changes"
        :key="change?.id || Math.random()"
        type="single"
        collapsible
        class="change-accordion"
      >
        <AccordionItem :value="change?.id || 'unknown'" class="change-item">
          <AccordionTrigger class="change-trigger">
            <div class="change-summary">
              <div class="change-text">
                {{ formatValue(change?.newValue) }}
              </div>
            </div>
            <div class="change-status-actions">
              <span class="status-badge" :class="`status-${change?.status || 'unknown'}`">
                {{ getStatusText(change?.status) }}
              </span>
              <div v-if="isOwner && change?.status === 'pending'" class="action-buttons">
                <button
                  @click.stop="acceptChange(change?.id)"
                  class="action-btn accept-btn"
                  :disabled="loading"
                  title="Accept change"
                >
                  <CheckIcon class="icon" />
                </button>
                <button
                  @click.stop="rejectChange(change?.id)"
                  class="action-btn reject-btn"
                  :disabled="loading"
                  title="Reject change"
                >
                  <CloseIcon class="icon" />
                </button>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent class="change-content">
            <div class="change-details">
              <div class="change-meta">
                <span class="change-author">{{ change?.authorEmail }}</span>
                <span class="change-date">{{ formatDate(change?.createdAt) }}</span>
              </div>
              <div
                v-if="change?.oldValue !== null && change?.oldValue !== undefined"
                class="change-old"
              >
                <span class="change-label">Previous:</span>
                <span class="change-text old-value">{{ formatValue(change?.oldValue) }}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AccordionRoot, AccordionItem, AccordionTrigger, AccordionContent } from 'reka-ui'
import { CheckIcon, CloseIcon } from '../icons'
import type { FieldChange, FieldChangeStatus } from '../types/feature'

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

const getStatusText = (status: FieldChangeStatus | undefined): string => {
  switch (status) {
    case 'accepted':
      return 'Accepted'
    case 'rejected':
      return 'Rejected'
    case 'pending':
      return 'Pending'
    default:
      return 'Unknown'
  }
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
  gap: var(--spacing-1);
}

.change-accordion {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-background-elevated);
  transition: var(--transition-colors);
}

.change-accordion:hover {
  border-color: var(--color-border);
}

.change-item {
  border: none;
}

.change-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--spacing-3);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: var(--transition-colors);
  text-align: left;
}

.change-trigger:hover {
  background: var(--color-background-hover);
}

.change-trigger:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.change-summary {
  flex: 1;
  min-width: 0;
}

.change-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  word-break: break-word;
  font-weight: var(--font-weight-medium);
}

.change-meta {
  display: flex;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-2);
}

.change-author {
  font-weight: var(--font-weight-medium);
}

.change-date {
  font-style: italic;
}

.change-status-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.status-accepted {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-badge.status-rejected {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.status-badge.status-pending {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status-badge.status-unknown {
  background: var(--color-text-muted-light);
  color: var(--color-text-muted-dark);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-colors);
  background: transparent;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-background-hover);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.accept-btn:hover:not(:disabled) {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.reject-btn:hover:not(:disabled) {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.action-btn .icon {
  width: 14px;
  height: 14px;
}

.change-content {
  padding: 0 var(--spacing-3) var(--spacing-3);
  border-top: 1px solid var(--color-border-light);
}

.change-details {
  padding-top: var(--spacing-2);
}

.change-old {
  margin-bottom: var(--spacing-2);
}

.change-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-right: var(--spacing-2);
  display: inline-block;
  min-width: 80px;
}

.change-text.old-value {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

@media (max-width: 768px) {
  .change-trigger {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .change-status-actions {
    align-self: flex-end;
  }
}
</style>
