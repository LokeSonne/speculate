<template>
  <div
    class="spec-item"
    :class="[{ active: isActive }, { 'review-item': isReviewItem }]"
    @click="handleClick"
  >
    <div class="spec-info">
      <h5 class="spec-name">{{ spec.featureName }}</h5>
      <p class="spec-meta">
        <span
          v-if="showStatus"
          class="status"
          :class="`status-${spec.status.toLowerCase().replace(' ', '-')}`"
        >
          {{ spec.status }}
        </span>
        <span v-if="showAuthor" class="author">by {{ spec.author }}</span>
        <span class="date">{{ formatDate(spec.date) }}</span>
      </p>
    </div>
    <div class="spec-actions">
      <Button v-if="showEditButton" @click.stop="handleEdit" variant="text" size="sm" title="Edit">
        <EditIcon />
      </Button>
      <Button
        v-if="showReviewButton"
        @click.stop="handleReview"
        variant="ghost"
        size="sm"
        title="Review"
      >
        👁️
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from './ui/Button.vue'
import type { FrontendFeatureSpec } from '../types/feature'
import { EditIcon } from '@/icons'

interface Props {
  spec: FrontendFeatureSpec
  isActive?: boolean
  isReviewItem?: boolean
  showStatus?: boolean
  showAuthor?: boolean
  showEditButton?: boolean
  showReviewButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  isReviewItem: false,
  showStatus: true,
  showAuthor: false,
  showEditButton: true,
  showReviewButton: false,
})

const route = useRoute()
const router = useRouter()

// Format date for display
const formatDate = (date: Date | string) => {
  if (!date) return 'No date'

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

// Event handlers
const handleClick = () => {
  router.push(`/specs/${props.spec.id}/view`)
}

const handleEdit = () => {
  router.push(`/specs/${props.spec.id}/edit`)
}

const handleReview = () => {
  router.push(`/specs/${props.spec.id}/edit-view`)
}
</script>

<style scoped>
.spec-item {
  padding: var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.spec-item:hover {
  background: var(--color-background-hover);
  border-color: var(--color-primary-light);
}

.spec-item.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.spec-item.review-item {
  border-left: 3px solid var(--color-warning);
}

.spec-info {
  flex: 1;
  min-width: 0;
}

.spec-name {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spec-meta {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
}

.status {
  padding: var(--spacing-1) var(--spacing-1);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-draft {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.status-in-review {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.status-approved {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.status-locked {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.author {
  font-style: italic;
}

.date {
  color: var(--color-text-tertiary);
}

.spec-actions {
  display: flex;
  gap: var(--spacing-1);
  margin-left: var(--spacing-1);
}

/* Button styles are now handled by the Button component */
</style>
