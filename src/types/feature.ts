// Organization types
export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface OrganizationMembership {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  invitedBy?: string
  invitedAt?: Date
  joinedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  role: string
  defaultOrganizationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface FrontendFeatureSpec {
  id: string
  featureName: string
  organizationId: string

  // Overview Section
  author: string
  date: Date
  status: 'Draft' | 'In Review' | 'Approved' | 'Locked'
  reviewers: Reviewer[]
  featureSummary: string
  successCriteria: SuccessCriteria[]

  // User Requirements
  targetUsers: TargetUser[]
  userGoals: UserGoal[]
  useCases: UseCase[]

  // Behavioral Requirements
  coreInteractions: CoreInteraction[]
  loadingStates: LoadingState[]
  emptyStates: EmptyState[]
  errorStates: ErrorState[]
  formBehavior?: FormBehavior

  // Visual Design Requirements
  layoutStructure: LayoutStructure
  visualHierarchy: VisualHierarchy
  componentSpecs: ComponentSpec[]
  typographyContent: TypographyContent
  accessibilityRequirements: AccessibilityRequirements

  // Responsive Behavior
  responsiveBehavior: ResponsiveBehavior

  // Animation & Motion
  animationRequirements: AnimationRequirement[]

  // Edge Cases & Constraints
  edgeCases: EdgeCase[]
  technicalConstraints: TechnicalConstraint[]
  businessRules: BusinessRule[]

  // Approval & Sign-off
  approvals: Approval[]

  // Metadata
  createdAt: Date
  updatedAt: Date
  version: string
}

export interface Reviewer {
  id: string
  name: string
  email?: string
  avatar?: string
  role: 'Product' | 'Design' | 'Engineering'
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
}

export interface SuccessCriteria {
  id: string
  type: 'Primary' | 'Key'
  description: string
}

export interface TargetUser {
  id: string
  type: 'Primary' | 'Secondary'
  description: string
  characteristics: string[]
}

export interface UserGoal {
  id: string
  description: string
  priority: number
}

export interface UseCase {
  id: string
  name: string
  type: 'Primary' | 'Secondary'
  context: string
  userAction: string
  expectedOutcome: string
  successCondition: string
}

export interface CoreInteraction {
  id: string
  actionName: string
  trigger: string
  behavior: string
  visualFeedback: string
  endState: string
  loadingState: string
  emptyState: string
  errorStates: ErrorState[]
  businessRules: BusinessRule[]
}

export interface LoadingState {
  id: string
  type: 'Initial Load' | 'Data Loading'
  behavior: string
  duration?: string
  userFeedback: string
  timeoutHandling?: string
}

export interface EmptyState {
  id: string
  scenario: string
  message: string
  visual: string
  actions: string[]
}

export interface ErrorState {
  id: string
  type: 'Network Error' | 'Validation Error'
  trigger?: string
  message: string
  recovery: string
  fallback?: string
}

export interface FormBehavior {
  id: string
  inputValidation: InputValidation
  submitValidation: SubmitValidation
  autoSaveBehavior?: AutoSaveBehavior
}

export interface InputValidation {
  realTimeValidation: ValidationRule[]
  submitValidation: ValidationRule[]
}

export interface ValidationRule {
  field: string
  rules: string[]
  timing: string
}

export interface SubmitValidation {
  successPath: string
  errorPath: string
}

export interface AutoSaveBehavior {
  trigger: string
  frequency: string
  userFeedback: string
}

export interface LayoutStructure {
  desktop: LayoutBreakpoint
  tablet: LayoutBreakpoint
  mobile: LayoutBreakpoint
}

export interface LayoutBreakpoint {
  breakpoint: string
  description: string
}

export interface VisualHierarchy {
  primaryElements: string[]
  secondaryElements: string[]
  tertiaryElements: string[]
}

export interface ComponentSpec {
  id: string
  name: string
  visualDescription: string
  states: ComponentState[]
  contentRequirements: ContentRequirement
}

export interface ComponentState {
  name: 'Default' | 'Hover' | 'Active' | 'Disabled' | 'Loading'
  description: string
}

export interface ContentRequirement {
  text: string[]
  images?: ImageRequirement[]
  data: DataRequirement[]
}

export interface ImageRequirement {
  type: string
  size: string
  altText: string
}

export interface DataRequirement {
  type: string
  format: string
  display: string
}

export interface TypographyContent {
  headlines: string[]
  bodyText: string[]
  labels: string[]
  errorMessages: string[]
  successMessages: string[]
  emptyStateText: string[]
}

export interface AccessibilityRequirements {
  keyboardNavigation: KeyboardNavigation
  screenReaderSupport: ScreenReaderSupport
  visualAccessibility: VisualAccessibility
}

export interface KeyboardNavigation {
  tabOrder: string[]
  shortcuts: string[]
  focusManagement: string[]
}

export interface ScreenReaderSupport {
  labels: string[]
  announcements: string[]
  structure: string[]
}

export interface VisualAccessibility {
  colorRequirements: string[]
  focusIndicators: string[]
  textScaling: string[]
}

export interface ResponsiveBehavior {
  breakpointTransitions: BreakpointTransition[]
  touchInteractions: TouchInteraction[]
}

export interface BreakpointTransition {
  from: string
  to: string
  changes: string[]
}

export interface TouchInteraction {
  touchTargets: string[]
  gestures: string[]
  hoverEquivalents: string[]
}

export interface AnimationRequirement {
  id: string
  type: 'Micro-interaction' | 'Page Transition'
  name: string
  description: string
  duration: string
  performanceRequirements?: string
}

export interface EdgeCase {
  id: string
  type: 'Content' | 'Technical' | 'Business'
  scenario: string
  behavior: string
}

export interface TechnicalConstraint {
  id: string
  constraint: string
  impact: string
  workaround?: string
}

export interface BusinessRule {
  id: string
  rule: string
  impact: string
}

export interface Approval {
  id: string
  type: 'Design' | 'Product' | 'Engineering'
  status: 'pending' | 'approved' | 'rejected'
  approver: string
  comments?: string
  approvedAt?: Date
}

export interface ChangeRequest {
  id: string
  featureSpecId: string
  userId: string
  userEmail?: string
  userName?: string
  title: string
  description: string
  type: 'suggestion' | 'issue' | 'question' | 'improvement'
  status: 'open' | 'accepted' | 'rejected' | 'resolved'
  section?: string
  sectionId?: string
  suggestedChange?: string
  createdAt: Date
  updatedAt: Date
  comments?: ChangeRequestComment[]
}

export interface ChangeRequestComment {
  id: string
  changeRequestId: string
  userId: string
  userEmail?: string
  userName?: string
  content: string
  createdAt: Date
}

export interface CreateChangeRequestData {
  featureSpecId: string
  title: string
  description: string
  type: 'suggestion' | 'issue' | 'question' | 'improvement'
  section?: string
  sectionId?: string
  suggestedChange?: string
}

export interface CreateChangeRequestCommentData {
  changeRequestId: string
  content: string
}

// Field-level change tracking types
export type FieldChangeStatus = 'pending' | 'accepted' | 'rejected'

export interface FieldChange {
  id: string
  featureSpecId: string
  fieldPath: string // e.g., 'featureName', 'userGoals.0.description', 'coreInteractions.1.actionName'
  fieldType: 'string' | 'array' | 'object'
  oldValue: any
  newValue: any
  changeDescription?: string
  authorId: string
  authorEmail: string
  status: FieldChangeStatus
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  acceptedBy?: string
  rejectedAt?: string
  rejectedBy?: string
}

export interface CreateFieldChangeData {
  featureSpecId: string
  fieldPath: string
  fieldType: 'string' | 'array' | 'object'
  oldValue: any
  newValue: any
  changeDescription?: string
}

// Form field types for TanStack Forms
export interface FeatureSpecFormData {
  id?: string
  organizationId: string
  featureName: string
  author: string
  date: Date
  status: string
  featureSummary: string
  reviewers: Reviewer[]
  successCriteria: SuccessCriteria[]
  targetUsers: TargetUser[]
  userGoals: UserGoal[]
  useCases: UseCase[]
  coreInteractions: CoreInteraction[]
  loadingStates: LoadingState[]
  emptyStates: EmptyState[]
  errorStates: ErrorState[]
  formBehavior?: FormBehavior
  layoutStructure: LayoutStructure
  visualHierarchy: VisualHierarchy
  componentSpecs: ComponentSpec[]
  typographyContent: TypographyContent
  accessibilityRequirements: AccessibilityRequirements
  responsiveBehavior: ResponsiveBehavior
  animationRequirements: AnimationRequirement[]
  edgeCases: EdgeCase[]
  technicalConstraints: TechnicalConstraint[]
  businessRules: BusinessRule[]
  approvals: Approval[]
}

// Default values for creating new specs
// Organization management types
export interface CreateOrganizationData {
  name: string
  description?: string
  logoUrl?: string
  settings?: Record<string, unknown>
}

export interface UpdateOrganizationData {
  name?: string
  description?: string
  logoUrl?: string
  settings?: Record<string, unknown>
}

export interface InviteUserToOrganizationData {
  organizationId: string
  email: string
  role: OrganizationRole
}

export interface UpdateMembershipRoleData {
  membershipId: string
  role: OrganizationRole
}

export interface OrganizationWithMembers extends Organization {
  members: Array<
    OrganizationMembership & {
      user: UserProfile
    }
  >
  memberCount: number
}

export interface UserWithOrganizations extends UserProfile {
  organizations: Array<
    OrganizationMembership & {
      organization: Organization
    }
  >
}

// Default values for creating new specs
export const createDefaultFeatureSpec = (organizationId: string): FrontendFeatureSpec => ({
  id: crypto.randomUUID(),
  organizationId,
  featureName: '',
  author: '',
  date: new Date(),
  status: 'Draft',
  reviewers: [],
  featureSummary: '',
  successCriteria: [],
  targetUsers: [],
  userGoals: [],
  useCases: [],
  coreInteractions: [],
  loadingStates: [],
  emptyStates: [],
  errorStates: [],
  layoutStructure: {
    desktop: { breakpoint: '>1200px', description: '' },
    tablet: { breakpoint: '768-1199px', description: '' },
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
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
})
