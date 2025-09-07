import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MarkdownViewer from '../../components/MarkdownViewer.vue'
import { MarkdownService } from '../../services/markdownService'
import { createDefaultFeatureSpec } from '../../types/feature'
import type { FrontendFeatureSpec } from '../../types/feature'

// Mock the MarkdownService
vi.mock('../../services/markdownService', () => ({
  MarkdownService: vi.fn().mockImplementation(() => ({
    exportSpec: vi.fn(),
  })),
}))

// Mock marked
vi.mock('marked', () => ({
  default: vi.fn(),
  setOptions: vi.fn(),
}))

describe('MarkdownViewer', () => {
  let mockMarkdownService: any
  let mockMarked: any
  let mockSetOptions: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup MarkdownService mock
    mockMarkdownService = {
      exportSpec: vi.fn(),
    }
    ;(MarkdownService as any).mockImplementation(() => mockMarkdownService)

    // Setup marked mock
    mockMarked = vi.fn()
    mockSetOptions = vi.fn()

    // Get the mocked marked module
    const markedModule = vi.mocked(import('marked'))
    markedModule.default.mockImplementation(mockMarked)
    markedModule.setOptions.mockImplementation(mockSetOptions)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the markdown viewer container', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Test Feature\n\nThis is a test feature.',
        filename: 'test-feature-spec.md',
      })
      mockMarked.mockReturnValue('<h1>Test Feature</h1><p>This is a test feature.</p>')

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      expect(wrapper.find('.markdown-viewer').exists()).toBe(true)
      expect(wrapper.find('.markdown-content').exists()).toBe(true)
    })

    it('should apply correct CSS classes', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Test Feature',
        filename: 'test-feature-spec.md',
      })
      mockMarked.mockReturnValue('<h1>Test Feature</h1>')

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      const viewer = wrapper.find('.markdown-viewer')
      const content = wrapper.find('.markdown-content')

      expect(viewer.classes()).toContain('markdown-viewer')
      expect(content.classes()).toContain('markdown-content')
    })
  })

  describe('Markdown Generation', () => {
    it('should generate markdown content from spec', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'User Dashboard'
      spec.author = 'John Doe'
      spec.featureSummary = 'A comprehensive dashboard for users'

      const expectedContent =
        '# Frontend Feature Spec: User Dashboard\n\n## Overview\n**Author:** John Doe\n\n### Feature Summary\nA comprehensive dashboard for users'
      const expectedHtml =
        '<h1>Frontend Feature Spec: User Dashboard</h1><h2>Overview</h2><p><strong>Author:</strong> John Doe</p><h3>Feature Summary</h3><p>A comprehensive dashboard for users</p>'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: expectedContent,
        filename: 'user-dashboard-spec.md',
      })
      mockMarked.mockReturnValue(expectedHtml)

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(mockMarkdownService.exportSpec).toHaveBeenCalledWith(spec)
      expect(mockMarked).toHaveBeenCalledWith(expectedContent)
      expect(wrapper.find('.markdown-content').html()).toContain(expectedHtml)
    })

    it('should handle empty spec gracefully', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = ''

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Frontend Feature Spec: \n\n## Overview',
        filename: 'spec.md',
      })
      mockMarked.mockReturnValue('<h1>Frontend Feature Spec: </h1><h2>Overview</h2>')

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(mockMarkdownService.exportSpec).toHaveBeenCalledWith(spec)
      expect(wrapper.find('.markdown-content').html()).toContain('<h1>Frontend Feature Spec: </h1>')
    })

    it('should handle spec with minimal data', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Minimal Feature'
      // Leave other fields empty/default

      mockMarkdownService.exportSpec.mockReturnValue({
        content:
          '# Frontend Feature Spec: Minimal Feature\n\n## Overview\n**Author:** \n**Status:** Draft',
        filename: 'minimal-feature-spec.md',
      })
      mockMarked.mockReturnValue(
        '<h1>Frontend Feature Spec: Minimal Feature</h1><h2>Overview</h2><p><strong>Author:</strong> <br><strong>Status:</strong> Draft</p>',
      )

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(mockMarkdownService.exportSpec).toHaveBeenCalledWith(spec)
      expect(wrapper.find('.markdown-content').html()).toContain('Minimal Feature')
    })
  })

  describe('Error Handling', () => {
    it('should handle MarkdownService exportSpec error', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockImplementation(() => {
        throw new Error('Export failed')
      })

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(wrapper.find('.markdown-content').html()).toContain(
        'Error generating markdown content',
      )
    })

    it('should handle marked conversion error', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Test Feature',
        filename: 'test-feature-spec.md',
      })
      mockMarked.mockImplementation(() => {
        throw new Error('Markdown parsing failed')
      })

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(wrapper.find('.markdown-content').html()).toContain(
        'Error generating markdown content',
      )
    })

    it('should handle null/undefined content from MarkdownService', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: null,
        filename: 'test-feature-spec.md',
      })

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(wrapper.find('.markdown-content').html()).toContain('No content available')
    })

    it('should handle empty content from MarkdownService', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '',
        filename: 'test-feature-spec.md',
      })

      const wrapper = mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(wrapper.find('.markdown-content').html()).toContain('No content available')
    })
  })

  describe('Marked Configuration', () => {
    it('should configure marked with correct options', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Test Feature',
        filename: 'test-feature-spec.md',
      })
      mockMarked.mockReturnValue('<h1>Test Feature</h1>')

      mount(MarkdownViewer, {
        props: { spec },
      })

      expect(mockSetOptions).toHaveBeenCalledWith({
        breaks: true,
        gfm: true,
      })
    })
  })

  describe('Console Logging', () => {
    it('should log markdown generation process', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockReturnValue({
        content: '# Test Feature\n\nTest content',
        filename: 'test-feature-spec.md',
      })
      mockMarked.mockReturnValue('<h1>Test Feature</h1><p>Test content</p>')

      mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 MarkdownViewer: Generating markdown for spec:',
        'Test Feature',
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 MarkdownViewer: Generated content length:',
        expect.any(Number),
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 MarkdownViewer: Content preview:',
        expect.any(String),
      )

      consoleSpy.mockRestore()
    })

    it('should log error when content generation fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'

      mockMarkdownService.exportSpec.mockImplementation(() => {
        throw new Error('Export failed')
      })

      mount(MarkdownViewer, {
        props: { spec },
      })

      await nextTick()

      expect(consoleSpy).toHaveBeenCalledWith('Error generating markdown HTML:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('Reactivity', () => {
    it('should update when spec prop changes', async () => {
      const spec1 = createDefaultFeatureSpec()
      spec1.featureName = 'Feature One'

      const spec2 = createDefaultFeatureSpec()
      spec2.featureName = 'Feature Two'

      mockMarkdownService.exportSpec
        .mockReturnValueOnce({
          content: '# Frontend Feature Spec: Feature One',
          filename: 'feature-one-spec.md',
        })
        .mockReturnValueOnce({
          content: '# Frontend Feature Spec: Feature Two',
          filename: 'feature-two-spec.md',
        })

      mockMarked
        .mockReturnValueOnce('<h1>Frontend Feature Spec: Feature One</h1>')
        .mockReturnValueOnce('<h1>Frontend Feature Spec: Feature Two</h1>')

      const wrapper = mount(MarkdownViewer, {
        props: { spec: spec1 },
      })

      await nextTick()

      expect(wrapper.find('.markdown-content').html()).toContain('Feature One')

      // Update the spec prop
      await wrapper.setProps({ spec: spec2 })
      await nextTick()

      expect(mockMarkdownService.exportSpec).toHaveBeenCalledTimes(2)
      expect(mockMarkdownService.exportSpec).toHaveBeenLastCalledWith(spec2)
      expect(wrapper.find('.markdown-content').html()).toContain('Feature Two')
    })
  })
})
