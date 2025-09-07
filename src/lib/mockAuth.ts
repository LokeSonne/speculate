// Mock Authentication Helper
// This provides easy authentication setup for development and testing

import { supabase } from '../lib/supabase'

export class MockAuthHelper {
  private static instance: MockAuthHelper
  private currentUser: any = null

  static getInstance() {
    if (!MockAuthHelper.instance) {
      MockAuthHelper.instance = new MockAuthHelper()
    }
    return MockAuthHelper.instance
  }

  // Auto-login with a predefined user for development
  async autoLogin(email: string = 'john@example.com') {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123', // Mock password
      })

      if (error) {
        console.warn('Auto-login failed:', error.message)
        return false
      }

      this.currentUser = data.user

      // Manually set the session in the Supabase client
      if (data.session) {
        // This ensures the session is properly stored and accessible
        await supabase.auth.setSession(data.session)
      }

      return true
    } catch (error) {
      console.warn('Auto-login error:', error)
      return false
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }

  // Logout
  async logout() {
    try {
      await supabase.auth.signOut()
      this.currentUser = null
    } catch (error) {
      console.warn('Logout error:', error)
    }
  }

  // Create a test user
  async createTestUser(email: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      })

      if (error) {
        console.warn('Failed to create test user:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.warn('Create user error:', error)
      return false
    }
  }

  // List available test users
  getTestUsers() {
    return [
      { email: 'john@example.com', name: 'John Doe' },
      { email: 'jane@example.com', name: 'Jane Smith' },
    ]
  }
}

// Export singleton instance
export const mockAuth = MockAuthHelper.getInstance()

// Auto-setup for development
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true') {
  // Auto-login is now handled in useAuth composable
}
