<template>
  <div class="side-panel">
    <div class="side-panel-header">
      <h3>Specifications</h3>
      <Button @click="handleCreateSpec" variant="primary" size="sm">
        <span class="mr-2">+</span>
        New Spec
      </Button>
    </div>

    <ScrollAreaRoot class="side-panel-scroll-area">
      <ScrollAreaViewport class="side-panel-viewport">
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
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical" class="side-panel-scrollbar">
        <ScrollAreaThumb class="side-panel-thumb" />
      </ScrollAreaScrollbar>
    </ScrollAreaRoot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb } from 'reka-ui'
import { useAuth } from '../composables/useAuth'
import { useFeatureSpecs } from '../composables/useFeatureSpecsQuery'
import SpecListItem from './SpecListItem.vue'
import Button from './ui/Button.vue'
import type { FrontendFeatureSpec } from '../types/feature'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { featureSpecs } = useFeatureSpecs()

// Filter specifications based on ownership and review status
const ownedSpecs = computed(() => {
  if (!user.value || !featureSpecs.value) return []

  return featureSpecs.value.filter((spec: FrontendFeatureSpec) => {
    // Check if current user is the owner (author)
    return spec.author === user.value?.email || spec.author === user.value?.user_metadata?.full_name
  })
})

const reviewSpecs = computed(() => {
  if (!user.value || !featureSpecs.value) return []

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
  height: calc(100vh - 60px); /* Subtract header height */
  background: var(--color-background-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  position: fixed;
  top: 60px; /* Start below the header */
  left: 0;
  z-index: 10;
}

.side-panel-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-background);
  flex-shrink: 0;
}

.side-panel-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.side-panel-scroll-area {
  flex: 1;
  overflow: hidden;
}

.side-panel-viewport {
  width: 100%;
  height: 100%;
}

.side-panel-content {
  padding: var(--spacing-4);
}

.side-panel-scrollbar {
  width: 8px;
  background: var(--color-background-muted);
  border-radius: var(--radius-sm);
}

.side-panel-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.side-panel-thumb:hover {
  background: var(--color-text-secondary);
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
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    position: relative;
    top: auto;
    left: auto;
    z-index: auto;
  }
}
</style>
