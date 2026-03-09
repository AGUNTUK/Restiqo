'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User as FirebaseUser } from 'firebase/auth'
import {
  FirebaseAuthProvider,
  useFirebaseAuth,
} from '@/lib/firebase/auth'
import type { User, UserRole } from '@/types/database'

interface CompatUser extends FirebaseUser {
  id: string
}

type CompatProfile = User

interface AuthContextType {
  user: CompatUser | null
  profile: CompatProfile | null
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

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function mapFirebaseProfileToCompat(profile: any): CompatProfile | null {
  if (!profile) return null

  return {
    id: profile.id,
    email: profile.email || '',
    full_name: profile.fullName || null,
    avatar_url: profile.avatarUrl || null,
    phone: profile.phone || null,
    address: profile.address || null,
    bio: profile.bio || null,
    role: (profile.role || 'guest') as UserRole,
    is_verified: Boolean(profile.isVerified),
    host_requested_at: profile.hostRequestedAt ? toIsoString(profile.hostRequestedAt) : null,
    host_approved_at: profile.hostApprovedAt ? toIsoString(profile.hostApprovedAt) : null,
    created_at: toIsoString(profile.createdAt),
    updated_at: toIsoString(profile.updatedAt),
  }
}

function mapCompatUpdatesToFirebase(updates: Partial<User>) {
  const toDateOrUndefined = (value: string | undefined): Date | undefined => {
    if (value === undefined) return undefined

    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }

  const toNullableDate = (value: string | null | undefined): Date | null | undefined => {
    if (value === undefined) return undefined
    if (value === null) return null

    return toDateOrUndefined(value)
  }

  return {
    email: updates.email,
    fullName: updates.full_name,
    avatarUrl: updates.avatar_url,
    phone: updates.phone,
    address: updates.address,
    bio: updates.bio,
    role: updates.role,
    isVerified: updates.is_verified,
    hostRequestedAt: toNullableDate(updates.host_requested_at),
    hostApprovedAt: toNullableDate(updates.host_approved_at),
    createdAt: toDateOrUndefined(updates.created_at ?? undefined),
    updatedAt: toDateOrUndefined(updates.updated_at ?? undefined),
  }
}

function mapFirebaseUserToCompat(user: FirebaseUser | null): CompatUser | null {
  if (!user) return null
  return Object.assign(user, { id: user.uid }) as CompatUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}

export function useAuth(): AuthContextType {
  const router = useRouter()
  const auth = useFirebaseAuth()

  const signOut = async () => {
    await auth.signOut()
    router.push('/')
  }

  const updateProfile = async (updates: Partial<User>) => {
    const mapped = mapCompatUpdatesToFirebase(updates)
    return auth.updateProfile(mapped)
  }

  return {
    user: mapFirebaseUserToCompat(auth.user),
    profile: mapFirebaseProfileToCompat(auth.profile),
    role: auth.role,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isHost: auth.isHost,
    isAdmin: auth.isAdmin,
    isHostPending: auth.isHostPending,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut,
    signInWithGoogle: auth.signInWithGoogle,
    signInWithFacebook: auth.signInWithFacebook,
    updateProfile,
    refreshProfile: auth.refreshProfile,
    becomeHost: auth.becomeHost,
    hasRole: auth.hasRole,
    hasMinimumRole: auth.hasMinimumRole,
  }
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
