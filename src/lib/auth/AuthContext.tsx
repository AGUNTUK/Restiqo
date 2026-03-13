'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { type User as SupabaseUser, type Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { User, UserRole } from '@/types/database'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  isHost: boolean
  isAdmin: boolean
  isHostPending: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithFacebook: () => Promise<{ error: string | null }>
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

function deriveRoleState(role: UserRole, profile: User | null) {
  const isAdmin = role === 'admin'
  const isHost = isAdmin || role === 'host'
  const isHostPending =
    role === 'guest' &&
    Boolean(profile?.host_requested_at) &&
    !profile?.host_approved_at

  return { isAdmin, isHost, isHostPending }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>('guest')
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = async (userId: string): Promise<User | null> => {
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
      return data as User
    } catch (error) {
      console.error('Exception fetching profile:', error)
      return null
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        const p = await fetchProfile(session.user.id)
        setProfile(p)
        setRole((p?.role as UserRole) || 'guest')
      }
      
      setIsLoading(false)
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          // Avoid re-fetching on token refresh if profile already exists
          if (event === 'SIGNED_IN' || !profile) {
              const p = await fetchProfile(session.user.id)
              setProfile(p)
              setRole((p?.role as UserRole) || 'guest')
          }
        } else {
          setUser(null)
          setProfile(null)
          setRole('guest')
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message || null }
  }

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    return { error: error?.message || null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error: error?.message || null }
  }

  const signInWithFacebook = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
    return { error: error?.message || null }
  }

  const updateProfile = async (updates: Partial<User>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' }
    
    // Ensure we don't accidentally update id or user-locked fields directly
    const { id, ...safeUpdates } = updates as any
    
    const { error, data } = await supabase
      .from('users')
      .update(safeUpdates as never)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data as User)
      setRole(((data as any).role as UserRole) || 'guest')
    }
    
    return { error: error?.message || null }
  }

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const p = await fetchProfile(user.id)
      setProfile(p)
      setRole((p?.role as UserRole) || 'guest')
    }
  }

  const becomeHost = async (): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated' }
    if (role === 'host' || role === 'admin') return { error: null }

    const { error, data } = await supabase
      .from('users')
      .update({ host_requested_at: new Date().toISOString() } as never)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }
    
    if (data) {
       setProfile(data as User)
    }

    return { error: null }
  }

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole
  }

  const hasMinimumRole = (minimumRole: UserRole): boolean => {
    return roleHierarchy[role] >= roleHierarchy[minimumRole]
  }

  const roleState = deriveRoleState(role, profile)

  const value: AuthContextType = {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user,
    ...roleState,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    refreshProfile,
    becomeHost,
    hasRole,
    hasMinimumRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth(redirectTo: string = '/auth/login') {
  const auth = useAuth()
  const router = useRouter()
  const { isLoading, isAuthenticated } = auth

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, redirectTo, router])

  return auth
}

export function useRequireRole(requiredRole: UserRole, redirectTo: string = '/') {
  const auth = useAuth()
  const router = useRouter()
  const { isLoading, isAuthenticated } = auth
  const hasRequiredRole = auth.hasMinimumRole(requiredRole)

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, redirectTo, router])

  return auth
}
