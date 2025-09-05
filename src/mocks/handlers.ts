// MSW handlers for Supabase API mocking
import { http, HttpResponse } from 'msw'
import type {
  FrontendFeatureSpec,
  FeatureSpecFormData,
  ChangeRequest,
  CreateChangeRequestData,
  CreateChangeRequestCommentData,
  FieldChange,
  CreateFieldChangeData,
  User,
} from '../types/feature'

// Mock data storage
const mockData = {
  users: [
    {
      id: 'mock-user-1',
      email: 'john@example.com',
      user_metadata: { full_name: 'John Doe' },
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-user-2',
      email: 'jane@example.com',
      user_metadata: { full_name: 'Jane Smith' },
      created_at: new Date().toISOString(),
    },
  ],
  sessions: new Map<string, any>(), // Store active sessions
  featureSpecs: [
    {
      id: 'mock-spec-1',
      featureName: 'User Dashboard',
      author: 'John Doe',
      date: new Date('2024-01-15'),
      status: 'Draft',
      featureSummary: 'A comprehensive dashboard for users to view their data and analytics.',
      reviewers: [
        { id: 'rev-1', name: 'Alice Johnson', role: 'Product', status: 'pending' },
        { id: 'rev-2', name: 'Bob Wilson', role: 'Design', status: 'approved' },
      ],
      successCriteria: [
        { id: 'crit-1', type: 'Primary', description: 'Users can view their key metrics' },
        { id: 'crit-2', type: 'Key', description: 'Dashboard loads within 2 seconds' },
      ],
      targetUsers: [
        {
          id: 'user-1',
          type: 'Primary',
          description: 'Primary users of the application',
          characteristics: [],
        },
      ],
      userGoals: [
        { id: 'goal-1', priority: 1, description: 'Quickly access important information' },
      ],
      useCases: [
        {
          id: 'uc-1',
          name: 'View Dashboard',
          type: 'Primary',
          context: 'User opens the application',
          userAction: 'Navigate to dashboard and view metrics',
          expectedOutcome: 'User sees relevant data and can take action',
          successCondition: 'Dashboard loads with user data',
        },
      ],
      coreInteractions: [
        { id: 'int-1', interactionType: 'Click', description: 'Click on widget to expand details' },
      ],
      loadingStates: [],
      emptyStates: [],
      errorStates: [],
      formBehavior: undefined,
      layoutStructure: {
        desktop: { breakpoint: '>1200px', description: 'Full layout with sidebar' },
        tablet: { breakpoint: '768-1199px', description: 'Condensed layout' },
        mobile: { breakpoint: '<768px', description: 'Stacked layout' },
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
        keyboardNavigation: { tabOrder: [], shortcuts: [], focusManagement: [] },
        screenReaderSupport: { labels: [], announcements: [], structure: [] },
        visualAccessibility: { colorRequirements: [], focusIndicators: [], textScaling: [] },
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
    },
    {
      id: 'mock-spec-2',
      featureName: 'User Profile Management',
      author: 'Jane Smith',
      date: new Date('2024-01-20'),
      status: 'In Review',
      featureSummary:
        'Allow users to manage their profile information, preferences, and account settings.',
      reviewers: [
        { id: 'rev-3', name: 'Charlie Brown', role: 'Product', status: 'approved' },
        { id: 'rev-4', name: 'Diana Prince', role: 'Design', status: 'pending' },
        { id: 'rev-5', name: 'Eve Wilson', role: 'Engineering', status: 'approved' },
      ],
      successCriteria: [
        {
          id: 'crit-3',
          type: 'Primary',
          description: 'Users can update their profile information',
        },
        { id: 'crit-4', type: 'Key', description: 'Profile changes are saved automatically' },
        { id: 'crit-5', type: 'Primary', description: 'Users can change their password securely' },
      ],
      targetUsers: [
        {
          id: 'user-2',
          type: 'Primary',
          description: 'Users with existing accounts',
          characteristics: [],
        },
        {
          id: 'user-3',
          type: 'Secondary',
          description: 'Users setting up their profiles',
          characteristics: [],
        },
      ],
      userGoals: [
        { id: 'goal-2', priority: 1, description: 'Keep profile information up to date' },
        { id: 'goal-3', priority: 2, description: 'Customize account preferences' },
      ],
      useCases: [
        {
          id: 'uc-2',
          name: 'Update Profile',
          type: 'Primary',
          context: 'User wants to update their personal information',
          userAction: 'Navigate to profile, edit information, save changes',
          expectedOutcome: 'Profile information is updated successfully',
          successCondition: 'Changes are saved and reflected in the UI',
        },
        {
          id: 'uc-3',
          name: 'Change Password',
          type: 'Secondary',
          context: 'User wants to change their account password',
          userAction: 'Go to security settings, enter current password, set new password',
          expectedOutcome: 'Password is changed and user is logged out',
          successCondition: 'New password is active and user must re-authenticate',
        },
      ],
      coreInteractions: [
        { id: 'int-2', interactionType: 'Form Input', description: 'Fill out profile form fields' },
        { id: 'int-3', interactionType: 'Button Click', description: 'Save profile changes' },
        { id: 'int-4', interactionType: 'File Upload', description: 'Upload profile picture' },
      ],
      loadingStates: [],
      emptyStates: [],
      errorStates: [],
      formBehavior: undefined,
      layoutStructure: {
        desktop: { breakpoint: '>1200px', description: 'Two-column layout with form and preview' },
        tablet: { breakpoint: '768-1199px', description: 'Single column with stacked sections' },
        mobile: { breakpoint: '<768px', description: 'Mobile-optimized form layout' },
      },
      visualHierarchy: {
        primaryElements: ['Profile form', 'Save button'],
        secondaryElements: ['Navigation tabs', 'Help text'],
        tertiaryElements: ['Validation messages', 'Success indicators'],
      },
      componentSpecs: [],
      typographyContent: {
        headlines: ['Profile Settings', 'Account Information'],
        bodyText: ['Update your personal information', 'Manage your account preferences'],
        labels: ['First Name', 'Last Name', 'Email', 'Phone'],
        errorMessages: ['Please enter a valid email', 'Password must be at least 8 characters'],
        successMessages: ['Profile updated successfully', 'Password changed successfully'],
        emptyStateText: ['No profile picture uploaded', 'No preferences set'],
      },
      accessibilityRequirements: {
        keyboardNavigation: { tabOrder: [], shortcuts: [], focusManagement: [] },
        screenReaderSupport: { labels: [], announcements: [], structure: [] },
        visualAccessibility: { colorRequirements: [], focusIndicators: [], textScaling: [] },
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
    },
    {
      id: 'mock-spec-3',
      featureName: 'Search and Filter',
      author: 'Bob Wilson',
      date: new Date('2024-01-25'),
      status: 'Approved',
      featureSummary:
        'Advanced search and filtering capabilities to help users find content quickly.',
      reviewers: [
        { id: 'rev-6', name: 'Alice Johnson', role: 'Product', status: 'approved' },
        { id: 'rev-7', name: 'Charlie Brown', role: 'Design', status: 'approved' },
        { id: 'rev-8', name: 'Eve Wilson', role: 'Engineering', status: 'approved' },
      ],
      successCriteria: [
        { id: 'crit-6', type: 'Primary', description: 'Users can search across all content types' },
        { id: 'crit-7', type: 'Key', description: 'Search results appear within 500ms' },
        {
          id: 'crit-8',
          type: 'Primary',
          description: 'Users can apply multiple filters simultaneously',
        },
      ],
      targetUsers: [
        {
          id: 'user-4',
          type: 'Primary',
          description: 'Users who frequently search for content',
          characteristics: [],
        },
        {
          id: 'user-5',
          type: 'Secondary',
          description: 'Users who need to find specific items',
          characteristics: [],
        },
      ],
      userGoals: [
        { id: 'goal-4', priority: 1, description: 'Find specific content quickly' },
        { id: 'goal-5', priority: 2, description: 'Discover related content' },
      ],
      useCases: [
        {
          id: 'uc-4',
          name: 'Search Content',
          type: 'Primary',
          context: 'User wants to find specific content using search',
          userAction: 'Enter search term, view results, refine search if needed',
          expectedOutcome: 'Relevant content is displayed',
          successCondition: 'Search returns accurate results',
        },
        {
          id: 'uc-5',
          name: 'Apply Filters',
          type: 'Secondary',
          context: 'User wants to narrow down search results',
          userAction: 'Open filter panel, select filter options, apply filters',
          expectedOutcome: 'Results are filtered according to criteria',
          successCondition: 'Filtered results match selected criteria',
        },
      ],
      coreInteractions: [
        { id: 'int-5', interactionType: 'Text Input', description: 'Type search query' },
        { id: 'int-6', interactionType: 'Dropdown', description: 'Select filter options' },
        { id: 'int-7', interactionType: 'Button Click', description: 'Clear all filters' },
      ],
      loadingStates: [],
      emptyStates: [],
      errorStates: [],
      formBehavior: undefined,
      layoutStructure: {
        desktop: { breakpoint: '>1200px', description: 'Search bar with sidebar filters' },
        tablet: { breakpoint: '768-1199px', description: 'Collapsible filter panel' },
        mobile: { breakpoint: '<768px', description: 'Full-screen search with modal filters' },
      },
      visualHierarchy: {
        primaryElements: ['Search input', 'Search button'],
        secondaryElements: ['Filter panel', 'Result count'],
        tertiaryElements: ['Sort options', 'View toggles'],
      },
      componentSpecs: [],
      typographyContent: {
        headlines: ['Search', 'Filter Results'],
        bodyText: ['Enter your search term', 'Refine your search with filters'],
        labels: ['Search term', 'Category', 'Date range', 'Sort by'],
        errorMessages: ['No results found', 'Search term too short'],
        successMessages: ['Found 25 results', 'Filters applied'],
        emptyStateText: ['No search results', 'Try different keywords'],
      },
      accessibilityRequirements: {
        keyboardNavigation: { tabOrder: [], shortcuts: [], focusManagement: [] },
        screenReaderSupport: { labels: [], announcements: [], structure: [] },
        visualAccessibility: { colorRequirements: [], focusIndicators: [], textScaling: [] },
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
    },
  ],
  changeRequests: [
    {
      id: 'cr-1',
      featureSpecId: 'mock-spec-1',
      userId: 'mock-user-2',
      userEmail: 'jane@example.com',
      userName: 'Jane Smith',
      title: 'Add dark mode support',
      description: 'The dashboard should support dark mode for better user experience',
      type: 'improvement',
      status: 'open',
      section: 'Visual Design',
      suggestedChange: 'Add theme toggle in header',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      comments: [],
    },
  ],
  changeRequestComments: [
    {
      id: 'comment-1',
      changeRequestId: 'cr-1',
      userId: 'mock-user-1',
      userEmail: 'john@example.com',
      userName: 'John Doe',
      content: 'Great suggestion! This would definitely improve the user experience.',
      createdAt: new Date('2024-01-16'),
    },
  ],
  fieldChanges: [
    {
      id: 'fc-1',
      featureSpecId: 'mock-spec-1',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'User Dashboard',
      newValue: 'Enhanced User Dashboard',
      changeDescription: 'Updated feature name to be more descriptive',
      authorId: 'mock-user-2',
      authorEmail: 'jane@example.com',
      status: 'pending',
      createdAt: new Date('2024-01-17T10:30:00Z').toISOString(),
      updatedAt: new Date('2024-01-17T10:30:00Z').toISOString(),
    },
    {
      id: 'fc-2',
      featureSpecId: 'mock-spec-1',
      fieldPath: 'featureSummary',
      fieldType: 'string',
      oldValue: 'A comprehensive dashboard for users to view their data and analytics.',
      newValue:
        'A comprehensive dashboard for users to view their data, analytics, and take action on insights.',
      changeDescription: 'Added action capabilities to the summary',
      authorId: 'mock-user-2',
      authorEmail: 'jane@example.com',
      status: 'accepted',
      createdAt: new Date('2024-01-17T11:15:00Z').toISOString(),
      updatedAt: new Date('2024-01-17T11:45:00Z').toISOString(),
      acceptedAt: new Date('2024-01-17T11:45:00Z').toISOString(),
      acceptedBy: 'mock-user-1',
    },
    {
      id: 'fc-3',
      featureSpecId: 'mock-spec-1',
      fieldPath: 'status',
      fieldType: 'string',
      oldValue: 'Draft',
      newValue: 'In Review',
      changeDescription: 'Moved to review status',
      authorId: 'mock-user-1',
      authorEmail: 'john@example.com',
      status: 'accepted',
      createdAt: new Date('2024-01-17T14:20:00Z').toISOString(),
      updatedAt: new Date('2024-01-17T14:25:00Z').toISOString(),
      acceptedAt: new Date('2024-01-17T14:25:00Z').toISOString(),
      acceptedBy: 'mock-user-1',
    },
    {
      id: 'fc-4',
      featureSpecId: 'mock-spec-1',
      fieldPath: 'userGoals.0.description',
      fieldType: 'string',
      oldValue: 'Quickly access important information',
      newValue: 'Quickly access and understand important information',
      changeDescription: 'Added understanding aspect to user goal',
      authorId: 'mock-user-2',
      authorEmail: 'jane@example.com',
      status: 'rejected',
      createdAt: new Date('2024-01-17T15:10:00Z').toISOString(),
      updatedAt: new Date('2024-01-17T15:30:00Z').toISOString(),
      rejectedAt: new Date('2024-01-17T15:30:00Z').toISOString(),
      rejectedBy: 'mock-user-1',
    },
    {
      id: 'fc-5',
      featureSpecId: 'mock-spec-2',
      fieldPath: 'featureName',
      fieldType: 'string',
      oldValue: 'User Profile Management',
      newValue: 'Advanced User Profile Management',
      changeDescription: 'Added "Advanced" to better describe the feature capabilities',
      authorId: 'mock-user-1',
      authorEmail: 'john@example.com',
      status: 'pending',
      createdAt: new Date('2024-01-21T09:15:00Z').toISOString(),
      updatedAt: new Date('2024-01-21T09:15:00Z').toISOString(),
    },
    {
      id: 'fc-6',
      featureSpecId: 'mock-spec-2',
      fieldPath: 'successCriteria.0.description',
      fieldType: 'string',
      oldValue: 'Users can update their profile information',
      newValue: 'Users can update their profile information with real-time validation',
      changeDescription: 'Added real-time validation requirement',
      authorId: 'mock-user-2',
      authorEmail: 'jane@example.com',
      status: 'accepted',
      createdAt: new Date('2024-01-21T10:30:00Z').toISOString(),
      updatedAt: new Date('2024-01-21T11:00:00Z').toISOString(),
      acceptedAt: new Date('2024-01-21T11:00:00Z').toISOString(),
      acceptedBy: 'mock-user-1',
    },
    {
      id: 'fc-7',
      featureSpecId: 'mock-spec-3',
      fieldPath: 'status',
      fieldType: 'string',
      oldValue: 'In Review',
      newValue: 'Approved',
      changeDescription: 'Approved after final review',
      authorId: 'mock-user-1',
      authorEmail: 'john@example.com',
      status: 'accepted',
      createdAt: new Date('2024-01-26T14:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-26T14:05:00Z').toISOString(),
      acceptedAt: new Date('2024-01-26T14:05:00Z').toISOString(),
      acceptedBy: 'mock-user-1',
    },
    {
      id: 'fc-8',
      featureSpecId: 'mock-spec-3',
      fieldPath: 'successCriteria.1.description',
      fieldType: 'string',
      oldValue: 'Search results appear within 500ms',
      newValue: 'Search results appear within 300ms',
      changeDescription: 'Improved performance requirement',
      authorId: 'mock-user-2',
      authorEmail: 'jane@example.com',
      status: 'pending',
      createdAt: new Date('2024-01-26T15:20:00Z').toISOString(),
      updatedAt: new Date('2024-01-26T15:20:00Z').toISOString(),
    },
  ],
}

// Helper functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getCurrentUser = () => {
  // Return the first user as "current" for demo purposes
  return mockData.users[0]
}

// Session persistence helpers
const saveSessionToStorage = (session: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session))
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error)
    }
  }
}

const getSessionFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('supabase.auth.token')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.warn('Failed to get session from localStorage:', error)
      return null
    }
  }
  return null
}

const clearSessionFromStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('supabase.auth.token')
    } catch (error) {
      console.warn('Failed to clear session from localStorage:', error)
    }
  }
}

const createSession = (user: User) => {
  const session = {
    access_token: `mock-token-${Date.now()}`,
    refresh_token: `mock-refresh-${Date.now()}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  }

  // Store session in memory and localStorage
  mockData.sessions.set(user.id, session)
  saveSessionToStorage(session)

  return session
}

const getSessionFromToken = (token: string) => {
  // First check memory
  for (const [userId, session] of mockData.sessions.entries()) {
    if (session.access_token === token) {
      return session
    }
  }

  // If not found in memory, check localStorage
  const storedSession = getSessionFromStorage()
  if (storedSession && storedSession.access_token === token) {
    // Restore to memory
    mockData.sessions.set(storedSession.user.id, storedSession)
    return storedSession
  }

  return null
}

const authenticateRequest = (request: Request) => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return getSessionFromToken(token)
}

// MSW Handlers
// Initialize sessions from localStorage on startup
const initializeSessions = () => {
  const storedSession = getSessionFromStorage()
  if (storedSession) {
    console.log('🔄 Restoring session from localStorage:', storedSession.user.email)
    mockData.sessions.set(storedSession.user.id, storedSession)
  }
}

// Initialize on module load
initializeSessions()

export const handlers = [
  // Auth endpoints
  http.post('*/auth/v1/signup', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as {
      email: string
      password: string
      data?: { full_name?: string }
    }

    // Check if user already exists
    const existingUser = mockData.users.find((u) => u.email === body.email)
    if (existingUser) {
      return HttpResponse.json({ error: 'User already registered' }, { status: 400 })
    }

    const user: User = {
      id: `mock-user-${Date.now()}`,
      email: body.email,
      user_metadata: { full_name: body.data?.full_name || body.email.split('@')[0] },
      created_at: new Date().toISOString(),
    }

    mockData.users.push(user)
    const session = createSession(user)

    // Return the response in the exact format Supabase expects
    return HttpResponse.json({
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
      user: user,
    })
  }),

  http.post('*/auth/v1/token', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as { email: string; password: string }

    console.log('🔐 Sign-in attempt for:', body.email)

    const user = mockData.users.find((u) => u.email === body.email)
    if (!user) {
      console.log('❌ User not found:', body.email)
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const session = createSession(user)
    console.log('✅ Sign-in successful, created session:', session.access_token)
    console.log('📤 Returning response:', { user, session })

    // Return the response in the exact format Supabase expects
    return HttpResponse.json({
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
      user: user,
    })
  }),

  http.post('*/auth/v1/logout', async () => {
    await delay(200)
    // Clear session from localStorage
    clearSessionFromStorage()
    return HttpResponse.json({})
  }),

  http.post('*/auth/v1/token?grant_type=refresh_token', async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as { refresh_token: string }

    // Find session by refresh token
    for (const [userId, session] of mockData.sessions.entries()) {
      if (session.refresh_token === body.refresh_token) {
        // Create new session with updated tokens
        const newSession = createSession(session.user)
        return HttpResponse.json({
          access_token: newSession.access_token,
          token_type: newSession.token_type,
          expires_in: newSession.expires_in,
          expires_at: newSession.expires_at,
          refresh_token: newSession.refresh_token,
          user: session.user,
        })
      }
    }

    return HttpResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }),

  http.post('*/auth/v1/recover', async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as { email: string }
    console.log(`Password reset email sent to ${body.email}`)
    return HttpResponse.json({})
  }),

  http.get('*/auth/v1/user', async ({ request }) => {
    await delay(200)

    const session = authenticateRequest(request)
    if (!session) {
      console.log('❌ Auth failed: Invalid token')
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('✅ Auth successful for user:', session.user.email)
    return HttpResponse.json({ user: session.user })
  }),

  // Handle getSession requests - catch all auth endpoints
  http.get('*/auth/v1/*', async ({ request }) => {
    await delay(100)

    const url = new URL(request.url)
    console.log('🔍 Auth GET request to:', url.pathname)

    // Handle getSession specifically
    if (url.pathname.includes('/auth/v1/session') || url.pathname.endsWith('/auth/v1/')) {
      const session = authenticateRequest(request)
      if (!session) {
        console.log('🔍 getSession: No valid session found')
        return HttpResponse.json({ session: null })
      }

      console.log('🔍 getSession: Returning session for user:', session.user.email)
      return HttpResponse.json({ session })
    }

    // For other auth endpoints, return 404 to let specific handlers take over
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.put('*/auth/v1/user', async ({ request }) => {
    await delay(300)

    const session = authenticateRequest(request)
    if (!session) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = (await request.json()) as { data: { full_name?: string } }
    if (body.data) {
      session.user.user_metadata = { ...session.user.user_metadata, ...body.data }
    }

    return HttpResponse.json({ user: session.user })
  }),

  // Feature Specs endpoints
  http.get('*/rest/v1/feature_specs', async ({ request }) => {
    await delay(300)

    const session = authenticateRequest(request)
    if (!session) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const url = new URL(request.url)
    const select = url.searchParams.get('select')

    // Return all feature specs with related data
    const specs = mockData.featureSpecs.map((spec) => ({
      ...spec,
      feature_name: spec.featureName, // Map featureName to feature_name for API response
      feature_summary: spec.featureSummary, // Map featureSummary to feature_summary
      success_criteria: spec.successCriteria,
      reviewers: spec.reviewers,
      target_users: spec.targetUsers,
      user_goals: spec.userGoals,
      use_cases: spec.useCases,
      core_interactions: spec.coreInteractions,
      loading_states: spec.loadingStates,
      empty_states: spec.emptyStates,
      error_states: spec.errorStates,
      form_behavior: spec.formBehavior,
      layout_structure: spec.layoutStructure,
      visual_hierarchy: spec.visualHierarchy,
      component_specs: spec.componentSpecs,
      typography_content: spec.typographyContent,
      accessibility_requirements: spec.accessibilityRequirements,
      responsive_behavior: spec.responsiveBehavior,
      animation_requirements: spec.animationRequirements,
      edge_cases: spec.edgeCases,
      technical_constraints: spec.technicalConstraints,
      business_rules: spec.businessRules,
      approvals: spec.approvals,
    }))

    console.log(
      '📡 GET feature_specs called, returning:',
      specs.map((s) => ({ id: s.id, name: s.feature_name })),
    )

    // Log the first spec in detail to see the structure
    if (specs.length > 0) {
      console.log('🔍 First spec detail:', {
        id: specs[0].id,
        feature_name: specs[0].feature_name,
        author: specs[0].author,
        status: specs[0].status,
      })
    }

    return HttpResponse.json(specs)
  }),

  http.post('*/rest/v1/feature_specs', async ({ request }) => {
    await delay(500)

    const session = authenticateRequest(request)
    if (!session) {
      return HttpResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = (await request.json()) as any

    const spec: FrontendFeatureSpec = {
      id: `mock-spec-${Date.now()}`,
      featureName: body.feature_name,
      author: body.author,
      date: new Date(body.date),
      status: body.status,
      featureSummary: body.feature_summary,
      reviewers: body.reviewers || [],
      successCriteria: body.success_criteria || [],
      targetUsers: body.target_users || [],
      userGoals: body.user_goals || [],
      useCases: body.use_cases || [],
      coreInteractions: body.core_interactions || [],
      loadingStates: body.loading_states || [],
      emptyStates: body.empty_states || [],
      errorStates: body.error_states || [],
      formBehavior: body.form_behavior,
      layoutStructure: body.layout_structure || {
        desktop: { breakpoint: '>1200px', description: '' },
        tablet: { breakpoint: '768-1199px', description: '' },
        mobile: { breakpoint: '<768px', description: '' },
      },
      visualHierarchy: body.visual_hierarchy || {
        primaryElements: [],
        secondaryElements: [],
        tertiaryElements: [],
      },
      componentSpecs: body.component_specs || [],
      typographyContent: body.typography_content || {
        headlines: [],
        bodyText: [],
        labels: [],
        errorMessages: [],
        successMessages: [],
        emptyStateText: [],
      },
      accessibilityRequirements: body.accessibility_requirements || {
        keyboardNavigation: { tabOrder: [], shortcuts: [], focusManagement: [] },
        screenReaderSupport: { labels: [], announcements: [], structure: [] },
        visualAccessibility: { colorRequirements: [], focusIndicators: [], textScaling: [] },
      },
      responsiveBehavior: body.responsive_behavior || {
        breakpointTransitions: [],
        touchInteractions: [],
      },
      animationRequirements: body.animation_requirements || [],
      edgeCases: body.edge_cases || [],
      technicalConstraints: body.technical_constraints || [],
      businessRules: body.business_rules || [],
      approvals: body.approvals || [],
    }

    mockData.featureSpecs.push(spec)

    return HttpResponse.json([spec])
  }),

  http.patch('*/rest/v1/feature_specs', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as any
    const url = new URL(request.url)

    // Supabase sends the ID in the URL path, not as a query parameter
    const pathParts = url.pathname.split('/')
    const pathId = pathParts[pathParts.length - 1]

    // Also check for id in query params as fallback
    const queryId = url.searchParams.get('id')?.replace('eq.', '')

    // Use queryId if it exists and is not the table name, otherwise use pathId
    const finalId = queryId && queryId !== 'feature_specs' ? queryId : pathId

    console.log('🔧 PATCH feature_specs called:', {
      url: url.pathname,
      pathId: pathId,
      queryId,
      finalId,
      body,
    })

    const index = mockData.featureSpecs.findIndex((spec) => spec.id === finalId)
    if (index === -1) {
      console.log('❌ Feature spec not found:', finalId)
      return HttpResponse.json({ error: 'Feature spec not found' }, { status: 404 })
    }

    console.log(
      '📝 Updating feature spec at index:',
      index,
      'from:',
      mockData.featureSpecs[index].featureName,
      'to:',
      body.feature_name,
    )

    // Update the spec
    const updatedSpec = {
      ...mockData.featureSpecs[index],
      featureName: body.feature_name || mockData.featureSpecs[index].featureName,
      author: body.author || mockData.featureSpecs[index].author,
      date: body.date ? new Date(body.date) : mockData.featureSpecs[index].date,
      status: body.status || mockData.featureSpecs[index].status,
      featureSummary: body.feature_summary || mockData.featureSpecs[index].featureSummary,
      reviewers: body.reviewers || mockData.featureSpecs[index].reviewers,
      successCriteria: body.success_criteria || mockData.featureSpecs[index].successCriteria,
      targetUsers: body.target_users || mockData.featureSpecs[index].targetUsers,
      userGoals: body.user_goals || mockData.featureSpecs[index].userGoals,
      useCases: body.use_cases || mockData.featureSpecs[index].useCases,
      coreInteractions: body.core_interactions || mockData.featureSpecs[index].coreInteractions,
      loadingStates: body.loading_states || mockData.featureSpecs[index].loadingStates,
      emptyStates: body.empty_states || mockData.featureSpecs[index].emptyStates,
      errorStates: body.error_states || mockData.featureSpecs[index].errorStates,
      formBehavior:
        body.form_behavior !== undefined
          ? body.form_behavior
          : mockData.featureSpecs[index].formBehavior,
      layoutStructure: body.layout_structure || mockData.featureSpecs[index].layoutStructure,
      visualHierarchy: body.visual_hierarchy || mockData.featureSpecs[index].visualHierarchy,
      componentSpecs: body.component_specs || mockData.featureSpecs[index].componentSpecs,
      typographyContent: body.typography_content || mockData.featureSpecs[index].typographyContent,
      accessibilityRequirements:
        body.accessibility_requirements || mockData.featureSpecs[index].accessibilityRequirements,
      responsiveBehavior:
        body.responsive_behavior || mockData.featureSpecs[index].responsiveBehavior,
      animationRequirements:
        body.animation_requirements || mockData.featureSpecs[index].animationRequirements,
      edgeCases: body.edge_cases || mockData.featureSpecs[index].edgeCases,
      technicalConstraints:
        body.technical_constraints || mockData.featureSpecs[index].technicalConstraints,
      businessRules: body.business_rules || mockData.featureSpecs[index].businessRules,
      approvals: body.approvals || mockData.featureSpecs[index].approvals,
    }

    mockData.featureSpecs[index] = updatedSpec

    console.log('✅ Feature spec updated successfully:', updatedSpec.featureName)
    console.log(
      '📊 Current mock data:',
      mockData.featureSpecs.map((s) => ({ id: s.id, name: s.featureName })),
    )

    return HttpResponse.json([updatedSpec])
  }),

  http.delete('*/rest/v1/feature_specs', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const id = url.searchParams.get('id')?.replace('eq.', '')

    const index = mockData.featureSpecs.findIndex((spec) => spec.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Feature spec not found' }, { status: 404 })
    }

    mockData.featureSpecs.splice(index, 1)

    return HttpResponse.json({})
  }),

  // Change Requests endpoints
  http.get('*/rest/v1/change_requests', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    let requests = mockData.changeRequests
    if (featureSpecId) {
      requests = requests.filter((cr) => cr.featureSpecId === featureSpecId)
    }

    // Add comments to each request
    const requestsWithComments = requests.map((cr) => ({
      ...cr,
      comments: mockData.changeRequestComments.filter(
        (comment) => comment.changeRequestId === cr.id,
      ),
    }))

    return HttpResponse.json(requestsWithComments)
  }),

  http.post('*/rest/v1/change_requests', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as any

    const changeRequest: ChangeRequest = {
      id: `cr-${Date.now()}`,
      featureSpecId: body.feature_spec_id,
      userId: body.user_id,
      userEmail: body.user_email,
      userName: body.user_name,
      title: body.title,
      description: body.description,
      type: body.type,
      status: body.status || 'open',
      section: body.section,
      suggestedChange: body.suggested_change,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    }

    mockData.changeRequests.push(changeRequest)

    return HttpResponse.json([changeRequest])
  }),

  http.patch('*/rest/v1/change_requests', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any
    const url = new URL(request.url)
    const id = url.searchParams.get('id')?.replace('eq.', '')

    const index = mockData.changeRequests.findIndex((cr) => cr.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Change request not found' }, { status: 404 })
    }

    const updatedRequest = {
      ...mockData.changeRequests[index],
      ...body,
      updatedAt: new Date(),
    }

    mockData.changeRequests[index] = updatedRequest

    return HttpResponse.json([updatedRequest])
  }),

  http.delete('*/rest/v1/change_requests', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const id = url.searchParams.get('id')?.replace('eq.', '')

    const index = mockData.changeRequests.findIndex((cr) => cr.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Change request not found' }, { status: 404 })
    }

    mockData.changeRequests.splice(index, 1)

    return HttpResponse.json({})
  }),

  // Change Request Comments endpoints
  http.get('*/rest/v1/change_request_comments', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const changeRequestId = url.searchParams.get('change_request_id')?.replace('eq.', '')

    let comments = mockData.changeRequestComments
    if (changeRequestId) {
      comments = comments.filter((comment) => comment.changeRequestId === changeRequestId)
    }

    return HttpResponse.json(comments)
  }),

  http.post('*/rest/v1/change_request_comments', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const comment = {
      id: `comment-${Date.now()}`,
      changeRequestId: body.change_request_id,
      userId: body.user_id,
      userEmail: body.user_email,
      userName: body.user_name,
      content: body.content,
      createdAt: new Date(),
    }

    mockData.changeRequestComments.push(comment)

    return HttpResponse.json([comment])
  }),

  // Field Changes endpoints
  http.get('*/rest/v1/field_changes', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')
    const fieldPath = url.searchParams.get('field_path')

    console.log('🔍 Mock API: Field changes request', { featureSpecId, fieldPath })
    console.log('🔍 Mock API: All field changes', mockData.fieldChanges)

    let changes = mockData.fieldChanges

    if (featureSpecId) {
      changes = changes.filter((change) => change.featureSpecId === featureSpecId)
      console.log('🔍 Mock API: Filtered by featureSpecId', changes)
    }

    if (fieldPath) {
      changes = changes.filter((change) => change.fieldPath === fieldPath)
      console.log('🔍 Mock API: Filtered by fieldPath', changes)
    }

    console.log('🔍 Mock API: Returning field changes', changes)
    return HttpResponse.json(changes)
  }),

  http.post('*/rest/v1/field_changes', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const change: FieldChange = {
      id: `fc-${Date.now()}`,
      featureSpecId: body.feature_spec_id,
      fieldPath: body.field_path,
      fieldType: body.field_type,
      oldValue: body.old_value,
      newValue: body.new_value,
      changeDescription: body.change_description,
      authorId: body.author_id,
      authorEmail: body.author_email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockData.fieldChanges.push(change)
    return HttpResponse.json(change)
  }),

  http.patch('*/rest/v1/field_changes', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const changeId = url.searchParams.get('id')
    const body = (await request.json()) as any

    const changeIndex = mockData.fieldChanges.findIndex((change) => change.id === changeId)
    if (changeIndex === -1) {
      return HttpResponse.json({ error: 'Field change not found' }, { status: 404 })
    }

    const change = mockData.fieldChanges[changeIndex]
    const updatedChange = {
      ...change,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    mockData.fieldChanges[changeIndex] = updatedChange
    return HttpResponse.json(updatedChange)
  }),

  http.delete('*/rest/v1/field_changes', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const changeId = url.searchParams.get('id')

    const changeIndex = mockData.fieldChanges.findIndex((change) => change.id === changeId)
    if (changeIndex === -1) {
      return HttpResponse.json({ error: 'Field change not found' }, { status: 404 })
    }

    mockData.fieldChanges.splice(changeIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  // Reviewers endpoints
  http.get('*/rest/v1/reviewers', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let reviewers = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      reviewers = spec?.reviewers || []
    }

    return HttpResponse.json(reviewers)
  }),

  http.post('*/rest/v1/reviewers', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const reviewer = {
      id: `reviewer-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      name: body.name,
      role: body.role,
      status: body.status || 'pending',
    }

    return HttpResponse.json([reviewer])
  }),

  http.delete('*/rest/v1/reviewers', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    // In a real app, this would delete from the database
    // For mock purposes, we just return success
    return HttpResponse.json({ success: true })
  }),

  // Success Criteria endpoints
  http.get('*/rest/v1/success_criteria', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let criteria = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      criteria = spec?.successCriteria || []
    }

    return HttpResponse.json(criteria)
  }),

  http.post('*/rest/v1/success_criteria', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const criterion = {
      id: `criteria-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      type: body.type,
      description: body.description,
    }

    return HttpResponse.json([criterion])
  }),

  http.delete('*/rest/v1/success_criteria', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    return HttpResponse.json({ success: true })
  }),

  // Target Users endpoints
  http.get('*/rest/v1/target_users', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let users = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      users = spec?.targetUsers || []
    }

    return HttpResponse.json(users)
  }),

  http.post('*/rest/v1/target_users', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const user = {
      id: `target-user-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      type: body.type,
      description: body.description,
      characteristics: body.characteristics || [],
    }

    return HttpResponse.json([user])
  }),

  http.delete('*/rest/v1/target_users', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    return HttpResponse.json({ success: true })
  }),

  // User Goals endpoints
  http.get('*/rest/v1/user_goals', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let goals = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      goals = spec?.userGoals || []
    }

    return HttpResponse.json(goals)
  }),

  http.post('*/rest/v1/user_goals', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const goal = {
      id: `goal-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      description: body.description,
      priority: body.priority,
    }

    return HttpResponse.json([goal])
  }),

  http.delete('*/rest/v1/user_goals', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    return HttpResponse.json({ success: true })
  }),

  // Use Cases endpoints
  http.get('*/rest/v1/use_cases', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let useCases = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      useCases = spec?.useCases || []
    }

    return HttpResponse.json(useCases)
  }),

  http.post('*/rest/v1/use_cases', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const useCase = {
      id: `use-case-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      name: body.name,
      type: body.type,
      context: body.context,
      userAction: body.user_action,
      expectedOutcome: body.expected_outcome,
      successCondition: body.success_condition,
    }

    return HttpResponse.json([useCase])
  }),

  http.delete('*/rest/v1/use_cases', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    return HttpResponse.json({ success: true })
  }),

  // Core Interactions endpoints
  http.get('*/rest/v1/core_interactions', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')

    let interactions = []
    if (featureSpecId) {
      const spec = mockData.featureSpecs.find((s) => s.id === featureSpecId)
      interactions = spec?.coreInteractions || []
    }

    return HttpResponse.json(interactions)
  }),

  http.post('*/rest/v1/core_interactions', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as any

    const interaction = {
      id: `interaction-${Date.now()}`,
      feature_spec_id: body.feature_spec_id,
      actionName: body.action_name,
      trigger: body.trigger,
      behavior: body.behavior,
      visualFeedback: body.visual_feedback,
      endState: body.end_state,
      loadingState: body.loading_state,
      emptyState: body.empty_state,
      errorStates: body.error_states || [],
      businessRules: body.business_rules || [],
    }

    return HttpResponse.json([interaction])
  }),

  http.delete('*/rest/v1/core_interactions', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const featureSpecId = url.searchParams.get('feature_spec_id')?.replace('eq.', '')

    return HttpResponse.json({ success: true })
  }),
]
