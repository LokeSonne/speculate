<template>
  <div class="review-sidepanel">
    <div class="review-sidepanel-content">
      <div class="add-reviewers-section">
        <span class="section-label">Current Reviewers </span>
        <PopoverRoot v-model:open="isPopoverOpen">
          <PopoverTrigger as-child>
            <BaseButton variant="text" size="sm">
              <PlusIcon :size="16" />
            </BaseButton>
          </PopoverTrigger>
          <PopoverContent class="popover-content">
            <Combobox
              :model-value="selectedUsers"
              :multiple="true"
              placeholder="Search users..."
              empty-text="No users found"
              :options="[
                {
                  name: 'Users',
                  children: availableUsers.map((user) => ({ value: user.id, label: user.name })),
                },
              ]"
              class="reviewer-combobox"
              @update:model-value="handleSelectionChange"
              @change="handleSelectionChange"
            />
          </PopoverContent>
        </PopoverRoot>
      </div>
      <div v-if="reviewers.length === 0" class="empty-state">
        <p>No reviewers assigned</p>
      </div>
      <div v-else class="reviewers-list">
        <div v-for="reviewer in reviewers" :key="reviewer.id" class="reviewer-item">
          <div class="reviewer-info">
            <AvatarRoot class="reviewer-avatar">
              <AvatarImage v-if="reviewer.avatar" :src="reviewer.avatar" :alt="reviewer.name" />
              <AvatarFallback>{{ getInitials(reviewer.name) }}</AvatarFallback>
            </AvatarRoot>
            <div class="reviewer-details">
              <span class="reviewer-name">{{ reviewer.name }}</span>
              <span class="reviewer-role">{{ reviewer.role }}</span>
            </div>
          </div>
          <div class="reviewer-status">
            <span class="status-badge" :class="`status-${reviewer.status}`">
              {{ reviewer.status }}
            </span>
            <button
              @click="removeReviewer(reviewer.id)"
              class="remove-button"
              aria-label="Remove reviewer"
            >
              <DeleteIcon :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Combobox from './ui/Combobox.vue'
import {
  AvatarRoot,
  AvatarImage,
  AvatarFallback,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from 'reka-ui'
import type { Reviewer } from '../types/feature'
import DeleteIcon from '../icons/DeleteIcon.vue'
import PlusIcon from '../icons/PlusIcon.vue'
import BaseButton from './ui/BaseButton.vue'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Props {
  reviewers: Reviewer[]
  availableUsers?: User[]
}

interface Emits {
  (e: 'update-reviewers', reviewers: Reviewer[]): void
}

const props = withDefaults(defineProps<Props>(), {
  availableUsers: () => [],
})

const emit = defineEmits<Emits>()

// Component state
const selectedUsers = ref<string[]>([])
const isPopoverOpen = ref(false)

// Mock available users for now - in a real app this would come from props or a composable
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  },
]

const availableUsers = computed(() => {
  // Filter out users who are already reviewers
  const reviewerUserIds = props.reviewers.map((r) => r.id)
  return (props.availableUsers.length > 0 ? props.availableUsers : mockUsers).filter(
    (user) => !reviewerUserIds.includes(user.id),
  )
})

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleSelectionChange = (newSelection: string | string[]) => {
  const selectionArray = Array.isArray(newSelection) ? newSelection : [newSelection]
  selectedUsers.value = selectionArray
}

const addSelectedReviewers = () => {
  if (selectedUsers.value.length === 0) return

  const newReviewers: Reviewer[] = selectedUsers.value
    .map((userId) => {
      const user = availableUsers.value.find((u) => u.id === userId)
      if (!user) return null

      return {
        id: userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'Product',
        status: 'pending' as const,
      }
    })
    .filter(Boolean) as Reviewer[]

  const updatedReviewers = [...props.reviewers, ...newReviewers]
  emit('update-reviewers', updatedReviewers)

  // Reset selection and close popover
  selectedUsers.value = []
  isPopoverOpen.value = false
}

const removeReviewer = (reviewerId: string) => {
  const updatedReviewers = props.reviewers.filter((r) => r.id !== reviewerId)
  emit('update-reviewers', updatedReviewers)
}

// Watch for changes in selected users to update available users
watch(selectedUsers, (newSelection) => {
  // If users are selected, add them as reviewers and close popover
  if (newSelection && newSelection.length > 0) {
    addSelectedReviewers()
  }
})
</script>

<style scoped>
.review-sidepanel {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
}

.review-sidepanel-content {
  padding: var(--spacing-4);
  flex: 1;
  overflow-y: auto;
}

.add-reviewers-section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-2);
}

.popover-content {
  background: white !important;
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-6);
  min-width: 300px;
  z-index: 1000;
}

/* Ensure popover content has proper background */
:deep(.popover-content) {
  background: white !important;
  border: 2px solid var(--color-gray-200) !important;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Additional specificity for Reka-ui components */
:deep([data-radix-popper-content-wrapper]) {
  background: white !important;
  border: 2px solid var(--color-gray-200) !important;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.section-label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
}

.reviewer-combobox {
  margin-bottom: var(--spacing-3);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-6);
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.reviewers-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.reviewer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.reviewer-avatar {
  width: 32px;
  height: 32px;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.reviewer-role {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
}

.reviewer-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.status-pending {
  background: var(--color-yellow-100);
  color: var(--color-yellow-800);
}

.status-approved {
  background: var(--color-green-100);
  color: var(--color-green-800);
}

.status-rejected {
  background: var(--color-red-100);
  color: var(--color-red-800);
}

.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  color: var(--color-gray-400);
  transition: color 0.2s ease;
}

.remove-button:hover {
  color: var(--color-red-500);
}
</style>
