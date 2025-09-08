import type { FeatureSpecFormData } from '../types/feature'

export function createDefaultFormData(author: string, organizationId: string): FeatureSpecFormData {
  return {
    organizationId,
    featureName: '',
    author,
    date: new Date(),
    status: 'Draft',
    featureSummary: '',
    userGoals: [],
    useCases: [],
    successCriteria: [],
    reviewers: [],
    targetUsers: [],
    coreInteractions: [],
    loadingStates: [],
    emptyStates: [],
    errorStates: [],
    formBehavior: undefined,
    layoutStructure: {
      desktop: { breakpoint: '>1200px', description: '' },
      tablet: { breakpoint: '768px-1200px', description: '' },
      mobile: { breakpoint: '<768px', description: '' },
    },
    visualHierarchy: {
      primaryElements: [],
      secondaryElements: [],
      tertiaryElements: [],
    },
    componentSpecs: [],
    typographyContent: {
      headlines: [],
      bodyText: [],
      labels: [],
      errorMessages: [],
      successMessages: [],
      emptyStateText: [],
    },
    accessibilityRequirements: {
      keyboardNavigation: {
        tabOrder: [],
        shortcuts: [],
        focusManagement: [],
      },
      screenReaderSupport: {
        labels: [],
        announcements: [],
        structure: [],
      },
      visualAccessibility: {
        colorRequirements: [],
        focusIndicators: [],
        textScaling: [],
      },
    },
    responsiveBehavior: {
      breakpointTransitions: [],
      touchInteractions: [],
    },
    animationRequirements: [],
    edgeCases: [],
    technicalConstraints: [],
    businessRules: [],
    approvals: [],
  }
}
