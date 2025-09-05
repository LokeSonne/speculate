// MSW handlers for Supabase API mocking
import { http, HttpResponse } from 'msw'
import type {
  FrontendFeatureSpec,
  FeatureSpecFormData,
  ChangeRequest,
  CreateChangeRequestData,
  CreateChangeRequestCommentData,
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
        { id: 'user-1', userType: 'End Users', description: 'Primary users of the application' },
      ],
      userGoals: [{ id: 'goal-1', priority: 'High', goal: 'Quickly access important information' }],
      useCases: [
        {
          id: 'uc-1',
          title: 'View Dashboard',
          description: 'User opens the application and sees their dashboard',
          steps: ['Navigate to dashboard', 'View metrics', 'Interact with widgets'],
          expectedOutcome: 'User sees relevant data and can take action',
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
    const id = url.searchParams.get('id')?.replace('eq.', '')

    const index = mockData.featureSpecs.findIndex((spec) => spec.id === id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Feature spec not found' }, { status: 404 })
    }

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
]
