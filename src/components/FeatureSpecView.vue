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
        <div class="view-toggle">
          <button 
            @click="viewMode = 'rendered'" 
            :class="{ active: viewMode === 'rendered' }"
            class="btn-toggle"
          >
            Rendered View
          </button>
          <button 
            @click="viewMode = 'markdown'" 
            :class="{ active: viewMode === 'markdown' }"
            class="btn-toggle"
          >
            Markdown Source
          </button>
        </div>
        <button @click="handleEdit" class="btn-secondary">Edit</button>
        <button @click="handleExport" class="btn-primary">Export</button>
        <button @click="handleBack" class="btn-secondary">← Back</button>
      </div>
    </div>

    <div class="spec-content">
      <MarkdownViewer v-if="viewMode === 'rendered'" :spec="spec" />
      <div v-else class="markdown-source">
        <pre><code>{{ markdownSource }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownViewer from './MarkdownViewer.vue'
import { MarkdownService } from '../services/markdownService'
import type { FrontendFeatureSpec } from '../types/feature'

interface Props {
  spec: FrontendFeatureSpec
}

interface Emits {
  (e: 'edit', spec: FrontendFeatureSpec): void
  (e: 'back'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const markdownService = new MarkdownService()
const viewMode = ref<'rendered' | 'markdown'>('rendered')

// Computed property for markdown source
const markdownSource = computed(() => {
  try {
    const { content } = markdownService.exportSpec(props.spec)
    return content
  } catch (error) {
    console.error('Error generating markdown source:', error)
    return 'Error generating markdown content'
  }
})

// Event handlers
const handleEdit = () => {
  emit('edit', props.spec)
}

const handleBack = () => {
  emit('back')
}

const handleExport = async () => {
  try {
    const { content, filename } = await markdownService.exportSpec(props.spec)

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

.markdown-body p {
  margin: var(--spacing-3) 0;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.markdown-body ul {
  margin: var(--spacing-3) 0;
  padding-left: var(--spacing-6);
}

.markdown-body li {
  margin: var(--spacing-2) 0;
  font-size: var(--font-size-base);
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
  background: var(--color-gray-100);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
}

.markdown-body pre {
  background: var(--color-gray-100);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: var(--spacing-4) 0;
}

.markdown-body pre code {
  background: none;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: var(--spacing-4);
  margin: var(--spacing-4) 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-4) 0;
}

.markdown-body th,
.markdown-body td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.markdown-body th {
  font-weight: var(--font-weight-semibold);
  background: var(--color-gray-50);
}

/* Responsive Design */
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
}
</style>
