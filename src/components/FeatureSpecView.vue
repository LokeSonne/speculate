<template>
  <div class="feature-spec-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading specification...</p>
    </div>

    <div v-else-if="!spec" class="error-state">
      <h2>Specification not found</h2>
      <p>The requested specification could not be found.</p>
      <BaseButton @click="handleBack" variant="primary">Back to Dashboard</BaseButton>
    </div>

    <div v-else>
      <div class="spec-header">
        <div class="spec-title">
          <h1>{{ spec?.featureName || 'Loading...' }}</h1>
          <div class="spec-meta">
            <span class="spec-author">By {{ spec?.author || 'Unknown' }}</span>
            <span class="spec-date">{{ formatDate(spec?.date) }}</span>
            <span
              class="spec-status"
              :class="`status-${spec?.status?.toLowerCase().replace(' ', '-') || 'unknown'}`"
            >
              {{ spec?.status || 'Unknown' }}
            </span>
          </div>
        </div>
        <div class="spec-actions">
          <div class="view-toggle">
            <BaseButton
              @click="viewMode = 'rendered'"
              :class="{ active: viewMode === 'rendered' }"
              variant="ghost"
              size="sm"
              class="btn-toggle"
            >
              Rendered View
            </BaseButton>
            <BaseButton
              @click="viewMode = 'markdown'"
              :class="{ active: viewMode === 'markdown' }"
              variant="ghost"
              size="sm"
              class="btn-toggle"
            >
              Markdown Source
            </BaseButton>
          </div>
          <BaseButton @click="handleEdit" variant="secondary">Edit</BaseButton>
          <BaseButton @click="handleExport" variant="primary">Export</BaseButton>
          <BaseButton @click="handleBack" variant="secondary">← Back</BaseButton>
        </div>
      </div>

      <div class="spec-content">
        <MarkdownViewer v-if="viewMode === 'rendered'" :spec="spec" />
        <div v-else class="markdown-source">
          <pre><code>{{ markdownSource }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeatureSpec } from '../composables/useFeatureSpecsQuery'
import MarkdownViewer from './MarkdownViewer.vue'
import BaseButton from './ui/BaseButton.vue'
import { MarkdownService } from '../services/markdownService'
import type { FrontendFeatureSpec } from '../types/feature'

const route = useRoute()
const router = useRouter()

const markdownService = new MarkdownService()
const viewMode = ref<'rendered' | 'markdown'>('rendered')

// Use TanStack Query to fetch the specific feature spec
const { featureSpec: spec, isLoading: loading } = useFeatureSpec(route.params.id as string)

// TanStack Query will automatically fetch the spec data when needed

// Computed property for markdown source
const markdownSource = computed(() => {
  if (!spec.value) return 'Loading...'

  try {
    const { content } = markdownService.exportSpec(spec.value)
    return content
  } catch (error) {
    console.error('Error generating markdown source:', error)
    return 'Error generating markdown content'
  }
})

// Event handlers
const handleEdit = () => {
  if (spec.value) {
    router.push(`/specs/${spec.value.id}/edit`)
  }
}

const handleBack = () => {
  router.push('/dashboard')
}

const handleExport = () => {
  if (!spec.value) return

  try {
    const { content, filename } = markdownService.exportSpec(spec.value)

    // Create and download the file
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting spec:', error)
    alert('Failed to export specification')
  }
}

// Format date for display
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}
</script>

<style scoped>
.feature-spec-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-8);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
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

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 2px solid var(--color-border);
}

.spec-title h1 {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
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
  border-radius: var(--border-radius-full);
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

.spec-actions {
  display: flex;
  gap: var(--spacing-3);
}

.view-toggle {
  display: flex;
  background: var(--color-background-muted);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-1);
  margin-right: var(--spacing-4);
}

.btn-toggle {
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle:hover {
  background: var(--color-background-hover);
  color: var(--color-text-primary);
}

.btn-toggle.active {
  background: var(--color-primary);
  color: var(--color-background);
  box-shadow: var(--shadow-sm);
}

.btn-toggle.active:hover {
  background: var(--color-primary-dark);
}

.markdown-source {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  overflow-x: auto;
}

.markdown-source pre {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.markdown-source code {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

.spec-content {
  display: block;
}

.markdown-content {
  background: var(--color-background-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-8);
}

.markdown-body {
  font-family: var(--font-family-sans);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.markdown-body h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: var(--spacing-8) 0 var(--spacing-4) 0;
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-border);
  padding-bottom: var(--spacing-2);
}

.markdown-body h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-6) 0 var(--spacing-3) 0;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-1);
}

.markdown-body h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: var(--spacing-4) 0 var(--spacing-2) 0;
  color: var(--color-text-primary);
}

.markdown-body h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin: var(--spacing-3) 0 var(--spacing-2) 0;
  color: var(--color-text-primary);
}

.markdown-body p {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.markdown-body ul,
.markdown-body ol {
  margin: 0 0 var(--spacing-4) 0;
  padding-left: var(--spacing-6);
}

.markdown-body li {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.markdown-body strong {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-body em {
  font-style: italic;
  color: var(--color-text-secondary);
}

.markdown-body code {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.markdown-body pre {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin: 0 0 var(--spacing-4) 0;
}

.markdown-body pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: var(--spacing-4);
  margin: var(--spacing-4) 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 var(--spacing-4) 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
}

.markdown-body th {
  background: var(--color-background-muted);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-body td {
  color: var(--color-text-secondary);
}

.markdown-body hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-8) 0;
}

@media (max-width: 768px) {
  .feature-spec-view {
    padding: var(--spacing-4);
  }

  .spec-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }

  .spec-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .markdown-content {
    padding: var(--spacing-4);
  }

  .markdown-body h1 {
    font-size: var(--font-size-2xl);
  }

  .markdown-body h2 {
    font-size: var(--font-size-xl);
  }

  .markdown-body h3 {
    font-size: var(--font-size-lg);
  }
}
</style>
