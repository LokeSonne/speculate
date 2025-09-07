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
          actionName: 'Button Click',
          trigger: 'User clicks button',
          behavior: 'Button animates and triggers action',
          visualFeedback: 'Button changes color',
          endState: 'Action completed',
          loadingState: 'Show loading spinner',
          emptyState: 'Show empty message',
          errorStates: [
            {
              id: '1',
              type: 'Network Error',
              message: 'Network error occurred',
              recovery: 'Retry connection',
            },
            {
              id: '2',
              type: 'Validation Error',
              message: 'Validation error occurred',
              recovery: 'Fix input and retry',
            },
          ],
          businessRules: [],
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
      expect(result).toContain('**Behavior:** Button animates and triggers action')
      expect(result).toContain('**Visual Feedback:** Button changes color')
      expect(result).toContain('**End State:** Action completed')
      expect(result).toContain('**Loading State:** Show loading spinner')
      expect(result).toContain('**Empty State:** Show empty message')
      expect(result).toContain('**Error States:**')
      expect(result).toContain('- Network Error: Network error occurred')
      expect(result).toContain('- Validation Error: Validation error occurred')
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

  describe('Error Handling', () => {
    it('should handle undefined layoutStructure gracefully', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.layoutStructure = undefined as any

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('### Layout Structure')
      expect(result).toContain('Layout structure not defined')
    })

    it('should handle partial layoutStructure data', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.layoutStructure = {
        desktop: { breakpoint: '>1200px', description: 'Desktop layout' },
        tablet: undefined as any,
        mobile: { breakpoint: '<768px', description: 'Mobile layout' },
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('#### Desktop Layout (>1200px)')
      expect(result).toContain('Desktop layout')
      expect(result).toContain('#### Tablet Layout (768-1199px)')
      expect(result).toContain('Not specified')
      expect(result).toContain('#### Mobile Layout (<768px)')
      expect(result).toContain('Mobile layout')
    })

    it('should handle undefined visualHierarchy gracefully', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.visualHierarchy = undefined as any

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('### Visual Hierarchy')
      expect(result).toContain('Visual hierarchy not defined')
    })

    it('should handle partial visualHierarchy data', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.visualHierarchy = {
        primaryElements: ['Main nav'],
        secondaryElements: undefined as any,
        tertiaryElements: ['Footer'],
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('**Primary Elements:**')
      expect(result).toContain('- Main nav')
      expect(result).toContain('**Secondary Elements:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Tertiary Elements:**')
      expect(result).toContain('- Footer')
    })

    it('should handle undefined componentSpecs gracefully', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.componentSpecs = undefined as any

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('### Component Specifications')
      expect(result).toContain('No component specifications defined')
    })

    it('should handle componentSpec with missing data', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.componentSpecs = [
        {
          id: '1',
          name: 'Test Component',
          visualDescription: undefined as any,
          states: undefined as any,
          contentRequirements: undefined as any,
        },
      ]

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('#### Test Component')
      expect(result).toContain('**Visual Description:** Not specified')
      expect(result).toContain('**States:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Content Requirements:**')
      expect(result).toContain('**Text:**')
      expect(result).toContain('None defined')
    })

    it('should handle undefined typographyContent gracefully', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.typographyContent = undefined as any

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('### Typography & Content')
      expect(result).toContain('Typography content not defined')
    })

    it('should handle partial typographyContent data', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.typographyContent = {
        headlines: ['Page title'],
        bodyText: undefined as any,
        labels: ['Form labels'],
        errorMessages: undefined as any,
        successMessages: ['Success message'],
        emptyStateText: undefined as any,
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('#### Text Content')
      expect(result).toContain('**Headlines:**')
      expect(result).toContain('- Page title')
      expect(result).toContain('**Body Text:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Labels:**')
      expect(result).toContain('- Form labels')
      expect(result).toContain('**Error Messages:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Success Messages:**')
      expect(result).toContain('- Success message')
      expect(result).toContain('**Empty State Text:**')
      expect(result).toContain('None defined')
    })

    it('should handle undefined accessibilityRequirements gracefully', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.accessibilityRequirements = undefined as any

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('### Accessibility Requirements')
      expect(result).toContain('Accessibility requirements not defined')
    })

    it('should handle partial accessibilityRequirements data', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = 'Test Feature'
      spec.accessibilityRequirements = {
        keyboardNavigation: {
          tabOrder: ['Tab through fields'],
          shortcuts: undefined as any,
          focusManagement: ['Focus on errors'],
        },
        screenReaderSupport: undefined as any,
        visualAccessibility: {
          colorRequirements: ['High contrast'],
          focusIndicators: undefined as any,
          textScaling: ['Support zoom'],
        },
      }

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('#### Keyboard Navigation')
      expect(result).toContain('**Tab Order:**')
      expect(result).toContain('- Tab through fields')
      expect(result).toContain('**Shortcuts:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Focus Management:**')
      expect(result).toContain('- Focus on errors')
      expect(result).toContain('#### Screen Reader Support')
      expect(result).toContain('**Labels:**')
      expect(result).toContain('None defined')
      expect(result).toContain('#### Visual Accessibility')
      expect(result).toContain('**Color Requirements:**')
      expect(result).toContain('- High contrast')
      expect(result).toContain('**Focus Indicators:**')
      expect(result).toContain('None defined')
      expect(result).toContain('**Text Scaling:**')
      expect(result).toContain('- Support zoom')
    })

    it('should handle completely empty spec', () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = ''
      spec.author = ''
      spec.featureSummary = ''
      spec.targetUsers = []
      spec.userGoals = []
      spec.useCases = []
      spec.coreInteractions = []
      spec.loadingStates = []
      spec.emptyStates = []
      spec.errorStates = []
      spec.layoutStructure = undefined as any
      spec.visualHierarchy = undefined as any
      spec.componentSpecs = []
      spec.typographyContent = undefined as any
      spec.accessibilityRequirements = undefined as any
      spec.responsiveBehavior = undefined as any
      spec.animationRequirements = []
      spec.edgeCases = []
      spec.technicalConstraints = []
      spec.businessRules = []
      spec.approvals = []

      const result = markdownService.generateSpec(spec)

      expect(result).toContain('# Frontend Feature Spec: ')
      expect(result).toContain('## Overview')
      expect(result).toContain('**Author:** ')
      expect(result).toContain('**Status:** Draft')
      expect(result).toContain('### Feature Summary')
      expect(result).toContain('')
      expect(result).toContain('## User Requirements')
      expect(result).toContain('### Target Users')
      expect(result).toContain('No target users defined')
      expect(result).toContain('### User Goals')
      expect(result).toContain('No user goals defined')
      expect(result).toContain('### Use Cases')
      expect(result).toContain('No use cases defined')
      expect(result).toContain('## Behavioral Requirements')
      expect(result).toContain('### Core Interactions')
      expect(result).toContain('No core interactions defined')
      expect(result).toContain('### Loading & Empty States')
      expect(result).toContain('No loading states defined')
      expect(result).toContain('No empty states defined')
      expect(result).toContain('No error states defined')
      expect(result).toContain('## Visual Design Requirements')
      expect(result).toContain('### Layout Structure')
      expect(result).toContain('Layout structure not defined')
      expect(result).toContain('### Visual Hierarchy')
      expect(result).toContain('Visual hierarchy not defined')
      expect(result).toContain('### Component Specifications')
      expect(result).toContain('No component specifications defined')
      expect(result).toContain('### Typography & Content')
      expect(result).toContain('Typography content not defined')
      expect(result).toContain('### Accessibility Requirements')
      expect(result).toContain('Accessibility requirements not defined')
      expect(result).toContain('## Responsive Behavior Details')
      expect(result).toContain('No responsive behavior defined')
      expect(result).toContain('## Animation & Motion Requirements')
      expect(result).toContain('No animation requirements defined')
      expect(result).toContain('## Edge Cases & Constraints')
      expect(result).toContain('No content edge cases defined')
      expect(result).toContain('No technical constraints defined')
      expect(result).toContain('No business rules defined')
      expect(result).toContain('## Approval & Sign-off')
      expect(result).toContain('### Design Approval')
      expect(result).toContain('- [ ] Visual design approved')
      expect(result).toContain('### Current Approvals')
      expect(result).toContain('No approvals recorded')
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

    it('should handle empty feature name', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = ''

      const result = await markdownService.exportSpec(spec)

      expect(result.filename).toBe('spec.md')
      expect(result.content).toContain('# Frontend Feature Spec: ')
    })

    it('should handle undefined feature name', async () => {
      const spec = createDefaultFeatureSpec()
      spec.featureName = undefined as any

      const result = await markdownService.exportSpec(spec)

      expect(result.filename).toBe('spec.md')
      expect(result.content).toContain('# Frontend Feature Spec: ')
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

    it('should handle empty array', async () => {
      const result = await markdownService.exportSpecs([])

      expect(result).toHaveLength(0)
    })

    it('should handle specs with duplicate names', async () => {
      const spec1 = createDefaultFeatureSpec()
      spec1.featureName = 'Test Feature'

      const spec2 = createDefaultFeatureSpec()
      spec2.featureName = 'Test Feature'

      const result = await markdownService.exportSpecs([spec1, spec2])

      expect(result).toHaveLength(2)
      expect(result[0].filename).toBe('test-feature-spec.md')
      expect(result[1].filename).toBe('test-feature-spec.md')
    })
  })
})
