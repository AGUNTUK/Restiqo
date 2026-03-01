'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, UserRole } from '@/types/database'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  session: Session | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  isHost: boolean
  isAdmin: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: string | null }>
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  becomeHost: () => Promise<{ error: string | null }>
  hasRole: (requiredRole: UserRole) => boolean
  hasMinimumRole: (minimumRole: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  host: 1,
  admin: 2,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    role: 'guest',
    isLoading: true,
    isAuthenticated: false,
    isHost: false,
    isAdmin: false,
  })

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase])

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        const role = profile?.role || 'guest'

        setState({
          user: session.user,
          profile,
          session,
          role,
          isLoading: false,
          isAuthenticated: true,
          isHost: role === 'host' || role === 'admin',
          isAdmin: role === 'admin',
        })
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          profile: null,
          session: null,
          role: 'guest',
          isLoading: false,
          isAuthenticated: false,
          isHost: false,
          isAdmin: false,
        }))
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [fetchProfile, supabase.auth])

  // Listen for auth changes
  useEffect(() => {
    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id)
            const role = profile?.role || 'guest'

            setState({
              user: session.user,
              profile,
              session,
              role,
              isLoading: false,
              isAuthenticated: true,
              isHost: role === 'host' || role === 'admin',
              isAdmin: role === 'admin',
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            role: 'guest',
            isLoading: false,
            isAuthenticated: false,
            isHost: false,
            isAdmin: false,
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeAuth, fetchProfile, supabase.auth])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.session) {
        const profile = await fetchProfile(data.user.id)
        const role = profile?.role || 'guest'

        setState({
          user: data.user,
          profile,
          session: data.session,
          role,
          isLoading: false,
          isAuthenticated: true,
          isHost: role === 'host' || role === 'admin',
          isAdmin: role === 'admin',
        })
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }, [supabase.auth, fetchProfile])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'guest',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      // Check if user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: 'An account with this email already exists. Please sign in.' }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }, [supabase.auth])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        profile: null,
        session: null,
        role: 'guest',
        isLoading: false,
        isAuthenticated: false,
        isHost: false,
        isAdmin: false,
      })
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [supabase.auth, router])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }, [supabase.auth])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!state.user) {
      return { error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', state.user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh profile
      const profile = await fetchProfile(state.user.id)
      setState(prev => ({ ...prev, profile }))

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }, [state.user, supabase, fetchProfile])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id)
      const role = profile?.role || 'guest'
      setState(prev => ({
        ...prev,
        profile,
        role,
        isHost: role === 'host' || role === 'admin',
        isAdmin: role === 'admin',
      }))
    }
  }, [state.user, fetchProfile])

  // Become a host
  const becomeHost = useCallback(async () => {
    if (!state.user) {
      return { error: 'Not authenticated' }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: 'host',
          host_approved_at: new Date().toISOString(),
        })
        .eq('id', state.user.id)

      if (error) {
        return { error: error.message }
      }

      // Refresh profile
      await refreshProfile()

      return { error: null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }, [state.user, supabase, refreshProfile])

  // Check if user has specific role
  const hasRole = useCallback((requiredRole: UserRole): boolean => {
    return state.role === requiredRole
  }, [state.role])

  // Check if user has minimum role level
  const hasMinimumRole = useCallback((minimumRole: UserRole): boolean => {
    return roleHierarchy[state.role] >= roleHierarchy[minimumRole]
  }, [state.role])

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
    refreshProfile,
    becomeHost,
    hasRole,
    hasMinimumRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protecting routes
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push(redirectTo)
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo])

  return auth
}

// Hook for role-based access
export function useRequireRole(requiredRole: UserRole, redirectTo: string = '/') {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      if (!auth.hasMinimumRole(requiredRole)) {
        router.push(redirectTo)
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.hasMinimumRole, requiredRole, router, redirectTo])

  return auth
}

