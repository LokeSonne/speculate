import { describe, it, expect, beforeEach } from 'vitest'
import { MarkdownService } from '../../services/markdownService'
import { createDefaultFeatureSpec } from '../../types/feature'

describe('MarkdownService', () => {
  let markdownService: MarkdownService

  beforeEach(() => {
    markdownService = new MarkdownService()
  })

  describe('generateSpec', () => {
    it('should generate basic markdown structure', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.author = 'John Doe'
      spec.date = new Date('2024-01-01')
      spec.status = 'Draft'
      spec.featureSummary = 'This is a test feature'

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('# Frontend Feature Spec: Test Feature')
      expect(result).toContain('## Overview')
      expect(result).toContain('**Author:** John Doe')
      expect(result).toContain('**Status:** Draft')
      expect(result).toContain('### Feature Summary')
      expect(result).toContain('This is a test feature')
    })

    it('should generate user requirements section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.targetUsers = [
        {
          id: '1',
          type: 'Primary',
          description: 'Regular users',
          characteristics: ['Tech-savvy', 'Mobile-first'],
        },
      ]
      spec.userGoals = [
        {
          id: '1',
          description: 'Complete a task quickly',
          priority: 1,
        },
      ]
      spec.useCases = [
        {
          id: '1',
          name: 'User Login',
          type: 'Primary',
          context: 'User wants to access their account',
          userAction: 'Enter credentials and click login',
          expectedOutcome: 'User is logged in',
          successCondition: 'User sees dashboard',
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## User Requirements')
      expect(result).toContain('### Target Users')
      expect(result).toContain('**Primary:** Regular users')
      expect(result).toContain('### User Goals')
      expect(result).toContain('**Goal 1:** Complete a task quickly')
      expect(result).toContain('### Use Cases')
      expect(result).toContain('#### Primary Use Case: User Login')
      expect(result).toContain('**Context:** User wants to access their account')
    })

    it('should generate behavioral requirements section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.coreInteractions = [
        {
          id: '1',
          name: 'Button Click',
          trigger: 'User clicks button',
          behavior: 'Button animates and triggers action',
          visualFeedback: 'Button changes color',
          endState: 'Action completed',
          errorScenarios: ['Network error', 'Validation error'],
        },
      ]
      spec.loadingStates = [
        {
          id: '1',
          type: 'Initial Load',
          behavior: 'Show loading spinner',
          duration: '2-3 seconds',
          userFeedback: 'Loading spinner with progress',
          timeoutHandling: 'Show error message after 10 seconds',
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Behavioral Requirements')
      expect(result).toContain('### Core Interactions')
      expect(result).toContain('#### Interaction: Button Click')
      expect(result).toContain('**Trigger:** User clicks button')
      expect(result).toContain('### Loading & Empty States')
      expect(result).toContain('#### Initial Load')
      expect(result).toContain('**Behavior:** Show loading spinner')
    })

    it('should generate visual design requirements section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.layoutStructure = {
        desktop: { breakpoint: '>1200px', description: 'Three-column layout' },
        tablet: { breakpoint: '768-1199px', description: 'Two-column layout' },
        mobile: { breakpoint: '<768px', description: 'Single column layout' },
      }
      spec.visualHierarchy = {
        primaryElements: ['Main navigation', 'Primary CTA'],
        secondaryElements: ['Secondary buttons', 'Sidebar'],
        tertiaryElements: ['Footer links', 'Legal text'],
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Visual Design Requirements')
      expect(result).toContain('### Layout Structure')
      expect(result).toContain('#### Desktop Layout (>1200px)')
      expect(result).toContain('Three-column layout')
      expect(result).toContain('### Visual Hierarchy')
      expect(result).toContain('**Primary Elements:**')
      expect(result).toContain('- Main navigation')
    })

    it('should generate responsive behavior section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.responsiveBehavior = {
        breakpointTransitions: [
          {
            from: '1200px',
            to: '768px',
            changes: ['Hide sidebar', 'Stack columns'],
          },
        ],
        touchInteractions: [
          {
            touchTargets: ['Minimum 44px touch targets'],
            gestures: ['Swipe to navigate', 'Pinch to zoom'],
            hoverEquivalents: ['Long press for context menu'],
          },
        ],
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Responsive Behavior Details')
      expect(result).toContain('### Breakpoint Transitions')
      expect(result).toContain('**1200px → 768px:**')
      expect(result).toContain('- Hide sidebar')
      expect(result).toContain('### Touch vs Mouse Interactions')
      expect(result).toContain('**Touch Targets:**')
      expect(result).toContain('- Minimum 44px touch targets')
    })

    it('should generate animation and motion section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.animationRequirements = [
        {
          id: '1',
          type: 'Micro-interaction',
          name: 'Button Hover',
          description: 'Button scales up on hover',
          duration: '200ms',
          performanceRequirements: '60fps',
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Animation & Motion Requirements')
      expect(result).toContain('### Micro-interactions')
      expect(result).toContain('**Button Hover:**')
      expect(result).toContain('- **Type:** Micro-interaction')
      expect(result).toContain('- **Duration:** 200ms')
    })

    it('should generate edge cases and constraints section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.edgeCases = [
        {
          id: '1',
          type: 'Content',
          scenario: 'Very long text',
          behavior: 'Text truncates with ellipsis',
        },
      ]
      spec.technicalConstraints = [
        {
          id: '1',
          constraint: 'Slow networks',
          impact: 'Loading times increase',
          workaround: 'Show skeleton screens',
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Edge Cases & Constraints')
      expect(result).toContain('### Content Edge Cases')
      expect(result).toContain('**Content:** Very long text')
      expect(result).toContain('### Technical Constraints')
      expect(result).toContain('**Slow networks:**')
      expect(result).toContain('- **Impact:** Loading times increase')
    })

    it('should generate approval and sign-off section', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.approvals = [
        {
          id: '1',
          type: 'Design',
          status: 'approved',
          approver: 'Jane Designer',
          comments: 'Looks good',
          approvedAt: new Date('2024-01-01'),
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('## Approval & Sign-off')
      expect(result).toContain('### Design Approval')
      expect(result).toContain('- [ ] Visual design approved')
      expect(result).toContain('### Current Approvals')
      expect(result).toContain('✅ **Design:** Jane Designer')
    })
  })

  describe('exportSpec', () => {
    it('should generate filename from feature name', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'User Login Feature'

      const result = await markdownService.exportSpec(spec)

      expect(result.filename).toBe('user-login-feature-spec.md')
      expect(result.content).toContain('# Frontend Feature Spec: User Login Feature')
    })

    it('should sanitize filename for special characters', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Feature@#$%^&*()'

      const result = await markdownService.exportSpec(spec)

      expect(result.filename).toBe('feature-spec.md')
    })
  })

  describe('exportSpecs', () => {
    it('should export multiple specs', async () => {
      const spec1 = createDefaultFeatureSpec()
      spec1.featureName = 'Feature One'

      const spec2 = createDefaultFeatureSpec()
      spec2.featureName = 'Feature Two'

      const result = await markdownService.exportSpecs([spec1, spec2])

      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe('feature-one-spec.md')
      expect(result[1].filename).toBe('feature-two-spec.md')
      expect(result[0].content).toContain('# Frontend Feature Spec: Feature One')
      expect(result[1].content).toContain('# Frontend Feature Spec: Feature Two')
    })
  })
})
