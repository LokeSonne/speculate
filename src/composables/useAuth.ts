import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Global auth state
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

// Initialize auth state
supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
  session.value = initialSession
  user.value = initialSession?.user ?? null
  loading.value = false
})

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
  user.value = newSession?.user ?? null
  loading.value = false
})

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)
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
