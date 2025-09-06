import type { FrontendFeatureSpec } from '../types/feature'

export class MarkdownService {
  /**
   * Generate markdown content from a feature specification
   */
  generateSpec(spec: FrontendFeatureSpec): string {
    const sections = [
      this.generateHeader(spec),
      this.generateOverview(spec),
      this.generateUserRequirements(spec),
      this.generateBehavioralRequirements(spec),
      this.generateVisualDesignRequirements(spec),
      this.generateResponsiveBehavior(spec),
      this.generateAnimationMotion(spec),
      this.generateEdgeCasesConstraints(spec),
      this.generateApprovalSignoff(spec),
    ]

    return sections.filter(Boolean).join('\n\n')
  }

  /**
   * Generate the main header
   */
  private generateHeader(spec: FrontendFeatureSpec): string {
    return `# Frontend Feature Spec: ${spec.featureName}`
  }

  /**
   * Generate the overview section
   */
  private generateOverview(spec: FrontendFeatureSpec): string {
    const reviewers = spec.reviewers.map((r) => r.name).join(', ')
    const successCriteria = spec.successCriteria
      .map((sc) => `- ${sc.type.toLowerCase()} goal: ${sc.description}`)
      .join('\n')

    return `## Overview
**Author:** ${spec.author}  
**Date:** ${this.formatDate(spec.date)}  
**Status:** ${spec.status}  
**Reviewers:** ${reviewers || 'None assigned'}

### Feature Summary
${spec.featureSummary}

### Success Criteria
${successCriteria || 'No success criteria defined'}`
  }

  /**
   * Generate the user requirements section
   */
  private generateUserRequirements(spec: FrontendFeatureSpec): string {
    const targetUsers = spec.targetUsers
      .map((user) => `- **${user.type}:** ${user.description}`)
      .join('\n')

    const userGoals = spec.userGoals
      .map((goal, index) => `- **Goal ${index + 1}:** ${goal.description}`)
      .join('\n')

    const useCases = spec.useCases.map((useCase) => this.generateUseCase(useCase)).join('\n\n')

    return `## User Requirements

### Target Users
${targetUsers || 'No target users defined'}

### User Goals
${userGoals || 'No user goals defined'}

### Use Cases
${useCases || 'No use cases defined'}`
  }

  /**
   * Generate a single use case
   */
  private generateUseCase(useCase: any): string {
    return `#### ${useCase.type} Use Case: ${useCase.name}
**Context:** ${useCase.context}  
**User Action:** ${useCase.userAction}  
**Expected Outcome:** ${useCase.expectedOutcome}  
**Success Condition:** ${useCase.successCondition}`
  }

  /**
   * Generate the behavioral requirements section
   */
  private generateBehavioralRequirements(spec: FrontendFeatureSpec): string {
    const coreInteractions = (spec.coreInteractions || [])
      .map((interaction) => this.generateCoreInteraction(interaction))
      .join('\n\n')

    const loadingStates = (spec.loadingStates || [])
      .map((state) => this.generateLoadingState(state))
      .join('\n\n')

    const emptyStates = (spec.emptyStates || [])
      .map((state) => this.generateEmptyState(state))
      .join('\n\n')

    const errorStates = (spec.errorStates || [])
      .map((state) => this.generateErrorState(state))
      .join('\n\n')

    const formBehavior = spec.formBehavior ? this.generateFormBehavior(spec.formBehavior) : ''

    return `## Behavioral Requirements

### Core Interactions
${coreInteractions || 'No core interactions defined'}

### Loading & Empty States
#### Initial Load
${loadingStates || 'No loading states defined'}

#### Empty States
${emptyStates || 'No empty states defined'}

#### Error States
${errorStates || 'No error states defined'}

${
  formBehavior
    ? `### Form Behavior (if applicable)
${formBehavior}`
    : ''
}`
  }

  /**
   * Generate a core interaction
   */
  private generateCoreInteraction(interaction: any): string {
    const errorScenarios = (interaction.errorScenarios || [])
      .map((scenario: string) => `- ${scenario}`)
      .join('\n')

    return `#### Interaction: ${interaction.name}
**Trigger:** ${interaction.trigger}  
**Behavior:** ${interaction.behavior}  
**Visual Feedback:** ${interaction.visualFeedback}  
**End State:** ${interaction.endState}  
**Error Scenarios:** 
${errorScenarios || 'None defined'}`
  }

  /**
   * Generate a loading state
   */
  private generateLoadingState(state: any): string {
    return `#### ${state.type}
**Behavior:** ${state.behavior}  
${state.duration ? `**Duration:** ${state.duration}` : ''}  
**User Feedback:** ${state.userFeedback}  
${state.timeoutHandling ? `**Timeout Handling:** ${state.timeoutHandling}` : ''}`
  }

  /**
   * Generate an empty state
   */
  private generateEmptyState(state: any): string {
    const actions = (state.actions || []).map((action) => `- ${action}`).join('\n')
    return `**Scenario:** ${state.scenario}  
- **Message:** ${state.message}  
- **Visual:** ${state.visual}  
- **Actions:** 
${actions}`
  }

  /**
   * Generate an error state
   */
  private generateErrorState(state: any): string {
    return `**${state.type}:**  
- **Message:** ${state.message}  
- **Recovery:** ${state.recovery}  
${state.fallback ? `- **Fallback:** ${state.fallback}` : ''}`
  }

  /**
   * Generate form behavior section
   */
  private generateFormBehavior(formBehavior: any): string {
    const realTimeValidation = formBehavior.inputValidation.realTimeValidation
      .map((rule) => `- **${rule.field}:** ${rule.rules.join(', ')} (${rule.timing})`)
      .join('\n')

    const submitValidation = formBehavior.inputValidation.submitValidation
      .map((rule) => `- **${rule.field}:** ${rule.rules.join(', ')} (${rule.timing})`)
      .join('\n')

    return `#### Input Validation
**Real-time Validation:**  
${realTimeValidation || 'No real-time validation defined'}

**Submit Validation:**  
${submitValidation || 'No submit validation defined'}

**Auto-save/Draft Behavior:**  
${
  formBehavior.autoSaveBehavior
    ? `
- **Trigger:** ${formBehavior.autoSaveBehavior.trigger}
- **Frequency:** ${formBehavior.autoSaveBehavior.frequency}
- **User Feedback:** ${formBehavior.autoSaveBehavior.userFeedback}
`
    : 'No auto-save behavior defined'
}`
  }

  /**
   * Generate the visual design requirements section
   */
  private generateVisualDesignRequirements(spec: FrontendFeatureSpec): string {
    const layoutStructure = this.generateLayoutStructure(spec.layoutStructure)
    const visualHierarchy = this.generateVisualHierarchy(spec.visualHierarchy)
    const componentSpecs = spec.componentSpecs
      .map((spec) => this.generateComponentSpec(spec))
      .join('\n\n')
    const typographyContent = this.generateTypographyContent(spec.typographyContent)
    const accessibilityRequirements = this.generateAccessibilityRequirements(
      spec.accessibilityRequirements,
    )

    return `## Visual Design Requirements

### Layout Structure
${layoutStructure}

### Visual Hierarchy
${visualHierarchy}

### Component Specifications
${componentSpecs || 'No component specifications defined'}

### Typography & Content
${typographyContent}

### Accessibility Requirements
${accessibilityRequirements}`
  }

  /**
   * Generate layout structure
   */
  private generateLayoutStructure(layoutStructure: any): string {
    return `#### Desktop Layout (>1200px)
${layoutStructure.desktop.description}

#### Tablet Layout (768-1199px)  
${layoutStructure.tablet.description}

#### Mobile Layout (<768px)
${layoutStructure.mobile.description}`
  }

  /**
   * Generate visual hierarchy
   */
  private generateVisualHierarchy(hierarchy: any): string {
    const primary = hierarchy.primaryElements.map((el) => `- ${el}`).join('\n')
    const secondary = hierarchy.secondaryElements.map((el) => `- ${el}`).join('\n')
    const tertiary = hierarchy.tertiaryElements.map((el) => `- ${el}`).join('\n')

    return `**Primary Elements:** 
${primary || 'None defined'}

**Secondary Elements:** 
${secondary || 'None defined'}

**Tertiary Elements:** 
${tertiary || 'None defined'}`
  }

  /**
   * Generate component specification
   */
  private generateComponentSpec(spec: any): string {
    const states = spec.states.map((state) => `- ${state.name}: ${state.description}`).join('\n')

    const text = spec.contentRequirements.text.map((t) => `- ${t}`).join('\n')
    const data = spec.contentRequirements.data
      .map((d) => `- ${d.type}: ${d.format} (${d.display})`)
      .join('\n')

    return `#### ${spec.name}
**Visual Description:** ${spec.visualDescription}  
**States:**
${states}

**Content Requirements:**
- **Text:** 
${text || 'None defined'}
- **Data:** 
${data || 'None defined'}`
  }

  /**
   * Generate typography content
   */
  private generateTypographyContent(content: any): string {
    const headlines = content.headlines.map((h) => `- ${h}`).join('\n')
    const bodyText = content.bodyText.map((t) => `- ${t}`).join('\n')
    const labels = content.labels.map((l) => `- ${l}`).join('\n')
    const errorMessages = content.errorMessages.map((e) => `- ${e}`).join('\n')
    const successMessages = content.successMessages.map((s) => `- ${s}`).join('\n')
    const emptyStateText = content.emptyStateText.map((e) => `- ${e}`).join('\n')

    return `#### Text Content
**Headlines:** 
${headlines || 'None defined'}

**Body Text:** 
${bodyText || 'None defined'}

**Labels:** 
${labels || 'None defined'}

**Error Messages:** 
${errorMessages || 'None defined'}

**Success Messages:** 
${successMessages || 'None defined'}

**Empty State Text:** 
${emptyStateText || 'None defined'}`
  }

  /**
   * Generate accessibility requirements
   */
  private generateAccessibilityRequirements(requirements: any): string {
    const tabOrder = requirements.keyboardNavigation.tabOrder
      .map((order) => `- ${order}`)
      .join('\n')
    const shortcuts = requirements.keyboardNavigation.shortcuts
      .map((shortcut) => `- ${shortcut}`)
      .join('\n')
    const focusManagement = requirements.keyboardNavigation.focusManagement
      .map((focus) => `- ${focus}`)
      .join('\n')

    const labels = requirements.screenReaderSupport.labels.map((label) => `- ${label}`).join('\n')
    const announcements = requirements.screenReaderSupport.announcements
      .map((announcement) => `- ${announcement}`)
      .join('\n')
    const structure = requirements.screenReaderSupport.structure
      .map((struct) => `- ${struct}`)
      .join('\n')

    const colorRequirements = requirements.visualAccessibility.colorRequirements
      .map((req) => `- ${req}`)
      .join('\n')
    const focusIndicators = requirements.visualAccessibility.focusIndicators
      .map((indicator) => `- ${indicator}`)
      .join('\n')
    const textScaling = requirements.visualAccessibility.textScaling
      .map((scaling) => `- ${scaling}`)
      .join('\n')

    return `#### Keyboard Navigation
**Tab Order:** 
${tabOrder || 'None defined'}

**Shortcuts:** 
${shortcuts || 'None defined'}

**Focus Management:** 
${focusManagement || 'None defined'}

#### Screen Reader Support
**Labels:** 
${labels || 'None defined'}

**Announcements:** 
${announcements || 'None defined'}

**Structure:** 
${structure || 'None defined'}

#### Visual Accessibility
**Color Requirements:** 
${colorRequirements || 'None defined'}

**Focus Indicators:** 
${focusIndicators || 'None defined'}

**Text Scaling:** 
${textScaling || 'None defined'}`
  }

  /**
   * Generate responsive behavior section
   */
  private generateResponsiveBehavior(spec: FrontendFeatureSpec): string {
    const breakpointTransitions = spec.responsiveBehavior.breakpointTransitions
      .map((transition) => this.generateBreakpointTransition(transition))
      .join('\n\n')

    const touchInteractions = spec.responsiveBehavior.touchInteractions
      .map((interaction) => this.generateTouchInteraction(interaction))
      .join('\n\n')

    return `## Responsive Behavior Details

### Breakpoint Transitions
${breakpointTransitions || 'No breakpoint transitions defined'}

### Touch vs Mouse Interactions
${touchInteractions || 'No touch interactions defined'}`
  }

  /**
   * Generate breakpoint transition
   */
  private generateBreakpointTransition(transition: any): string {
    const changes = transition.changes.map((change) => `- ${change}`).join('\n')
    return `**${transition.from} → ${transition.to}:**  
${changes}`
  }

  /**
   * Generate touch interaction
   */
  private generateTouchInteraction(interaction: any): string {
    const touchTargets = interaction.touchTargets.map((target) => `- ${target}`).join('\n')
    const gestures = interaction.gestures.map((gesture) => `- ${gesture}`).join('\n')
    const hoverEquivalents = interaction.hoverEquivalents
      .map((equivalent) => `- ${equivalent}`)
      .join('\n')

    return `**Touch Targets:** 
${touchTargets || 'None defined'}

**Gestures:** 
${gestures || 'None defined'}

**Hover Equivalents:** 
${hoverEquivalents || 'None defined'}`
  }

  /**
   * Generate animation and motion section
   */
  private generateAnimationMotion(spec: FrontendFeatureSpec): string {
    const animations = spec.animationRequirements
      .map((animation) => this.generateAnimationRequirement(animation))
      .join('\n\n')

    return `## Animation & Motion Requirements

### Micro-interactions
${animations || 'No animation requirements defined'}

### Performance Requirements
**Animation Performance:** Frame rate requirements  
**Reduced Motion:** Behavior when user prefers reduced motion`
  }

  /**
   * Generate animation requirement
   */
  private generateAnimationRequirement(animation: any): string {
    return `**${animation.name}:**  
- **Type:** ${animation.type}
- **Description:** ${animation.description}
- **Duration:** ${animation.duration}
${animation.performanceRequirements ? `- **Performance:** ${animation.performanceRequirements}` : ''}`
  }

  /**
   * Generate edge cases and constraints section
   */
  private generateEdgeCasesConstraints(spec: FrontendFeatureSpec): string {
    const edgeCases = spec.edgeCases.map((edgeCase) => this.generateEdgeCase(edgeCase)).join('\n\n')

    const technicalConstraints = spec.technicalConstraints
      .map((constraint) => this.generateTechnicalConstraint(constraint))
      .join('\n\n')

    const businessRules = spec.businessRules
      .map((rule) => this.generateBusinessRule(rule))
      .join('\n\n')

    return `## Edge Cases & Constraints

### Content Edge Cases
${edgeCases || 'No content edge cases defined'}

### Technical Constraints
${technicalConstraints || 'No technical constraints defined'}

### Business Rules
${businessRules || 'No business rules defined'}`
  }

  /**
   * Generate edge case
   */
  private generateEdgeCase(edgeCase: any): string {
    return `**${edgeCase.type}:** ${edgeCase.scenario}  
- **Behavior:** ${edgeCase.behavior}`
  }

  /**
   * Generate technical constraint
   */
  private generateTechnicalConstraint(constraint: any): string {
    return `**${constraint.constraint}:**  
- **Impact:** ${constraint.impact}  
${constraint.workaround ? `- **Workaround:** ${constraint.workaround}` : ''}`
  }

  /**
   * Generate business rule
   */
  private generateBusinessRule(rule: any): string {
    return `**${rule.rule}:**  
- **Impact:** ${rule.impact}`
  }

  /**
   * Generate approval and sign-off section
   */
  private generateApprovalSignoff(spec: FrontendFeatureSpec): string {
    const approvals = spec.approvals.map((approval) => this.generateApproval(approval)).join('\n')

    return `## Approval & Sign-off

### Design Approval
- [ ] Visual design approved
- [ ] Interaction design approved  
- [ ] Accessibility requirements approved
- [ ] Responsive behavior approved

### Product Approval  
- [ ] User requirements approved
- [ ] Behavioral requirements approved
- [ ] Success criteria approved

### Engineering Feasibility
- [ ] Technical approach confirmed
- [ ] Performance requirements achievable
- [ ] Timeline confirmed

### Current Approvals
${approvals || 'No approvals recorded'}`
  }

  /**
   * Generate approval
   */
  private generateApproval(approval: any): string {
    const status =
      approval.status === 'approved' ? '✅' : approval.status === 'rejected' ? '❌' : '⏳'
    const approvedAt = approval.approvedAt ? ` (${this.formatDate(approval.approvedAt)})` : ''

    return `- ${status} **${approval.type}:** ${approval.approver}${approvedAt}
${approval.comments ? `  - Comments: ${approval.comments}` : ''}`
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  /**
   * Export multiple specs to markdown files
   */
  async exportSpecs(
    specs: FrontendFeatureSpec[],
  ): Promise<{ filename: string; content: string }[]> {
    return specs.map((spec) => ({
      filename: `${spec.featureName
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()}-spec.md`,
      content: this.generateSpec(spec),
    }))
  }

  /**
   * Export a single spec to markdown file
   */
  exportSpec(spec: FrontendFeatureSpec): { filename: string; content: string } {
    return {
      filename: `${spec.featureName
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()}-spec.md`,
      content: this.generateSpec(spec),
    }
  }
}
