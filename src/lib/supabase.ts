import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
// Default to mock API in development if not explicitly set
const useMockApi =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false')

// When using mock API, provide dummy values to prevent URL construction errors
const finalSupabaseUrl = useMockApi ? 'https://mock.supabase.co' : supabaseUrl
const finalSupabaseAnonKey = useMockApi ? 'mock-anon-key' : supabaseAnonKey

if (!useMockApi && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

console.log('🔧 Supabase config:', {
  useMockApi,
  finalSupabaseUrl,
  hasAnonKey: !!finalSupabaseAnonKey,
  DEV: import.meta.env.DEV,
})

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: globalThis.fetch, // Use global fetch for MSW interception
  },
})

// Database types will be generated here later
export type Database = {
  public: {
    Tables: {
      // Tables will be defined here
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
