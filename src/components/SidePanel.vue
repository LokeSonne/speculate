<template>
  <div class="side-panel">
    <div class="side-panel-header">
      <h3>Specifications</h3>
      <Button @click="handleCreateSpec" variant="primary" size="sm">
        <span class="mr-2">+</span>
        New Spec
      </Button>
    </div>

    <div class="side-panel-content">
      <!-- Owned Specifications -->
      <div class="spec-section">
        <div class="section-header">
          <h4>My Specifications</h4>
          <span class="count">{{ ownedSpecs.length }}</span>
        </div>
        <div v-if="ownedSpecs.length === 0" class="empty-state">
          <p class="text-secondary">No specifications created yet</p>
        </div>
        <div v-else class="spec-list">
          <SpecListItem
            v-for="spec in ownedSpecs"
            :key="spec.id"
            :spec="spec"
            :is-active="isActiveSpec(spec.id)"
            :show-status="true"
            :show-author="false"
            :show-edit-button="true"
            :show-review-button="false"
          />
        </div>
      </div>

      <!-- Review Requested Specifications -->
      <div class="spec-section">
        <div class="section-header">
          <h4>Review Requests</h4>
          <span class="count">{{ reviewSpecs.length }}</span>
        </div>
        <div v-if="reviewSpecs.length === 0" class="empty-state">
          <p class="text-secondary">No review requests</p>
        </div>
        <div v-else class="spec-list">
          <SpecListItem
            v-for="spec in reviewSpecs"
            :key="spec.id"
            :spec="spec"
            :is-active="isActiveSpec(spec.id)"
            :is-review-item="true"
            :show-status="false"
            :show-author="true"
            :show-edit-button="false"
            :show-review-button="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useFeatureSpecs } from '../composables/useFeatureSpecsSupabase'
import SpecListItem from './SpecListItem.vue'
import Button from './ui/Button.vue'
import type { FrontendFeatureSpec } from '../types/feature'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { featureSpecs } = useFeatureSpecs()

// Filter specifications based on ownership and review status
const ownedSpecs = computed(() => {
  if (!user.value) return []

  return featureSpecs.value.filter((spec: FrontendFeatureSpec) => {
    // Check if current user is the owner (author)
    return spec.author === user.value?.email || spec.author === user.value?.user_metadata?.full_name
  })
})

const reviewSpecs = computed(() => {
  if (!user.value) return []

  return featureSpecs.value.filter((spec: FrontendFeatureSpec) => {
    // Check if current user is a reviewer for this spec
    const isReviewer = spec.reviewers.some(
      (reviewer) =>
        reviewer.name === user.value?.email ||
        reviewer.name === user.value?.user_metadata?.full_name,
    )

    // Don't include specs where user is the owner
    const isOwner =
      spec.author === user.value?.email || spec.author === user.value?.user_metadata?.full_name

    return isReviewer && !isOwner && spec.status === 'In Review'
  })
})

// Check if a spec is currently active (being viewed/edited)
const isActiveSpec = (specId: string) => {
  return route.params.id === specId
}

// Event handlers
const handleCreateSpec = () => {
  router.push('/specs/create')
}
</script>

<style scoped>
.side-panel {
  width: 300px;
  height: 100vh;
  background: var(--color-background-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-panel-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-background);
}

.side-panel-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.side-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
}

.spec-section {
  margin-bottom: var(--spacing-4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.section-header h4 {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.count {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-4);
}

.empty-state p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.spec-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

/* Responsive design */
@media (max-width: 768px) {
  .side-panel {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .side-panel-content {
    max-height: 200px;
  }
}
</style>
