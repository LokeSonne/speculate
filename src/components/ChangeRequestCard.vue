<template>
  <div class="change-request-card" :class="`status-${changeRequest.status}`">
    <div class="change-request-header">
      <div class="change-request-meta">
        <h4 class="change-request-title">{{ changeRequest.title }}</h4>
        <div class="change-request-info">
          <span class="change-request-type" :class="`type-${changeRequest.type}`">
            {{ changeRequest.type }}
          </span>
          <span class="change-request-author">
            by {{ changeRequest.userName || changeRequest.userEmail }}
          </span>
          <span class="change-request-date">
            {{ formatDate(changeRequest.createdAt) }}
          </span>
        </div>
      </div>
      <div class="change-request-actions">
        <select
          v-if="canUpdateStatus"
          :value="changeRequest.status"
          @change="handleStatusChange"
          class="status-select"
        >
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="resolved">Resolved</option>
        </select>
        <button
          v-if="canDelete"
          @click="handleDelete"
          class="btn-remove btn-sm"
          title="Delete change request"
        >
          Delete
        </button>
      </div>
    </div>

    <div class="change-request-content">
      <p class="change-request-description">{{ changeRequest.description }}</p>

      <div v-if="changeRequest.suggestedChange" class="suggested-change">
        <h5>Suggested Change:</h5>
        <div class="suggested-change-content">
          {{ changeRequest.suggestedChange }}
        </div>
      </div>

      <div v-if="changeRequest.section" class="change-request-section">
        <span class="section-label">Section:</span>
        <span class="section-name">{{ changeRequest.section }}</span>
      </div>
    </div>

    <!-- Comments Section -->
    <div class="change-request-comments">
      <div v-if="changeRequest.comments?.length" class="comments-list">
        <div v-for="comment in changeRequest.comments" :key="comment.id" class="comment">
          <div class="comment-header">
            <span class="comment-author">{{ comment.userName || comment.userEmail }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>

      <!-- Add Comment Form -->
      <div class="add-comment">
        <textarea
          v-model="newComment"
          placeholder="Add a comment..."
          class="comment-textarea"
          rows="3"
        ></textarea>
        <button
          @click="handleAddComment"
          :disabled="!newComment.trim() || loading"
          class="btn-primary btn-sm"
        >
          {{ loading ? 'Adding...' : 'Add Comment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useChangeRequests } from '../composables/useChangeRequests'
import type { ChangeRequest } from '../types/feature'

interface Props {
  changeRequest: ChangeRequest
}

interface Emits {
  (e: 'status-changed', id: string, status: ChangeRequest['status']): void
  (e: 'deleted', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { user } = useAuth()
const { addComment, updateChangeRequestStatus, deleteChangeRequest, loading } = useChangeRequests()

const newComment = ref('')

// Check if current user can update status (spec owner or change request author)
const canUpdateStatus = computed(() => {
  return (
    user.value &&
    (props.changeRequest.userId === user.value.id ||
      // Add logic to check if user is spec owner
      true) // For now, allow all authenticated users
  )
})

// Check if current user can delete (change request author)
const canDelete = computed(() => {
  return user.value && props.changeRequest.userId === user.value.id
})

const handleStatusChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as ChangeRequest['status']

  const success = await updateChangeRequestStatus(props.changeRequest.id, newStatus)
  if (success) {
    emit('status-changed', props.changeRequest.id, newStatus)
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  const comment = await addComment({
    changeRequestId: props.changeRequest.id,
    content: newComment.value.trim(),
  })

  if (comment) {
    newComment.value = ''
  }
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this change request?')) {
    const success = await deleteChangeRequest(props.changeRequest.id)
    if (success) {
      emit('deleted', props.changeRequest.id)
    }
  }
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'No date'

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return 'Invalid date'

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date)
    return 'Invalid date'
  }
}
</script>

<style scoped>
.change-request-card {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
  transition: box-shadow var(--transition-fast);
}

.change-request-card:hover {
  box-shadow: var(--shadow-md);
}

.change-request-card.status-open {
  border-left: 4px solid var(--color-blue-500);
}

.change-request-card.status-accepted {
  border-left: 4px solid var(--color-green-500);
}

.change-request-card.status-rejected {
  border-left: 4px solid var(--color-red-500);
}

.change-request-card.status-resolved {
  border-left: 4px solid var(--color-gray-500);
}

.change-request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.change-request-meta {
  flex: 1;
}

.change-request-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.change-request-info {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  flex-wrap: wrap;
}

.change-request-type {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.type-suggestion {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
}

.type-issue {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.type-question {
  background: var(--color-yellow-100);
  color: var(--color-yellow-700);
}

.type-improvement {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.change-request-author,
.change-request-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.change-request-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.status-select {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  background: var(--color-background-card);
}

.change-request-content {
  margin-bottom: var(--spacing-4);
}

.change-request-description {
  margin: 0 0 var(--spacing-3) 0;
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.suggested-change {
  background: var(--color-gray-50);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.suggested-change h5 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.suggested-change-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: pre-wrap;
}

.change-request-section {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.section-label {
  font-weight: var(--font-weight-medium);
}

.change-request-comments {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-4);
}

.comments-list {
  margin-bottom: var(--spacing-4);
}

.comment {
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

.comment-author {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.comment-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.comment-content {
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.add-comment {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.comment-textarea {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  resize: vertical;
  min-height: 80px;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  align-self: flex-start;
}
</style>
