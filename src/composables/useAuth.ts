import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Global auth state
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

// Check if we're in mock mode
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true'

// Initialize auth state
if (isMockMode) {
  // In mock mode, try to get session immediately
  const initializeAuth = async () => {
    try {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      session.value = initialSession
      user.value = initialSession?.user ?? null
      loading.value = false

      // If no session found, try auto-login
      if (!initialSession) {
        const { mockAuth } = await import('../lib/mockAuth')
        await mockAuth.autoLogin()

        // Get session again after auto-login
        const {
          data: { session: newSession },
        } = await supabase.auth.getSession()

        session.value = newSession
        user.value = newSession?.user ?? null
      }
    } catch (error) {
      console.warn('Failed to initialize auth in mock mode:', error)
      loading.value = false
    }
  }

  // In test environment, run immediately. In dev, use a small delay for MSW
  if (import.meta.env.MODE === 'test') {
    initializeAuth()
  } else {
    setTimeout(initializeAuth, 100)
  }
} else {
  // Real Supabase mode
  supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
    session.value = initialSession
    user.value = initialSession?.user ?? null
    loading.value = false
  })
}

// Listen for auth changes
supabase.auth.onAuthStateChange((event, newSession) => {
  session.value = newSession
  user.value = newSession?.user ?? null
  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => {
    const auth = !!user.value
    return auth
  })
  const isAdmin = computed(() => user.value?.user_metadata?.role === 'admin')

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (data.session) {
      session.value = data.session
      user.value = data.session.user
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updateProfile = async (updates: Record<string, any>) => {
    if (!user.value) throw new Error('No user logged in')

    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    })
    return { data, error }
  }

  return {
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }
}
