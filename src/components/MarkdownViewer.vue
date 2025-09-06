<template>
  <div class="markdown-viewer">
    <div class="markdown-content" v-html="markdownHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { FrontendFeatureSpec } from '@/types/feature'
import { MarkdownService } from '@/services/markdownService'

interface Props {
  spec: FrontendFeatureSpec
}

const props = defineProps<Props>()

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
})

const markdownService = new MarkdownService()

const markdownHtml = computed(() => {
  try {
    console.log('🔍 MarkdownViewer: Generating markdown for spec:', props.spec?.featureName)

    // Generate markdown content from the spec
    const { content } = markdownService.exportSpec(props.spec)

    console.log('📝 MarkdownViewer: Generated content length:', content?.length || 0)
    console.log('📝 MarkdownViewer: Content preview:', content?.substring(0, 200) || 'No content')

    if (!content) {
      console.error('❌ MarkdownViewer: No content generated')
      return '<p>No content available</p>'
    }

    // Convert markdown to HTML using marked
    const html = marked(content)

    return html
  } catch (error) {
    console.error('Error generating markdown HTML:', error)
    return '<p>Error generating markdown content</p>'
  }
})
</script>

<style scoped>
.markdown-viewer {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.markdown-content {
  background: var(--color-background-card);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

/* Markdown content styling */
.markdown-content :deep(h1) {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-2);
  border-bottom: 2px solid var(--color-border);
}

.markdown-content :deep(h2) {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-top: var(--spacing-8);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-1);
  border-bottom: 1px solid var(--color-border);
}

.markdown-content :deep(h3) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-top: var(--spacing-6);
  margin-bottom: var(--spacing-3);
}

.markdown-content :deep(h4) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-top: var(--spacing-4);
  margin-bottom: var(--spacing-2);
}

.markdown-content :deep(p) {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: var(--spacing-4);
  padding-left: var(--spacing-6);
}

.markdown-content :deep(li) {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
}

.markdown-content :deep(strong) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-content :deep(em) {
  font-style: italic;
  color: var(--color-text-secondary);
}

.markdown-content :deep(code) {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
}

.markdown-content :deep(pre) {
  background: var(--color-background-muted);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin-bottom: var(--spacing-4);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: var(--spacing-4);
  margin: var(--spacing-4) 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-4);
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--color-background-muted);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.markdown-content :deep(td) {
  color: var(--color-text-secondary);
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-8) 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .markdown-viewer {
    padding: var(--spacing-4);
  }

  .markdown-content {
    padding: var(--spacing-4);
  }

  .markdown-content :deep(h1) {
    font-size: var(--font-size-2xl);
  }

  .markdown-content :deep(h2) {
    font-size: var(--font-size-xl);
  }

  .markdown-content :deep(h3) {
    font-size: var(--font-size-lg);
  }
}
</style>
