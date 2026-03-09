'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseFirestore } from './config'

export type UserRole = 'guest' | 'host' | 'admin'

interface FirebaseUserProfile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  phone: string | null
  address: string | null
  bio: string | null
  role: UserRole
  isVerified: boolean
  hostRequestedAt: Date | null
  hostApprovedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface AuthState {
  user: FirebaseUser | null
  profile: FirebaseUserProfile | null
  role: UserRole
  isLoading: boolean
  isAuthenticated: boolean
  isHost: boolean
  isAdmin: boolean
  isHostPending: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithFacebook: () => Promise<{ error: string | null }>
  signInWithPhone: (phone: string, recaptchaVerifier: RecaptchaVerifier) => Promise<{ confirmationResult: ConfirmationResult | null; error: string | null }>
  updateProfile: (updates: Partial<FirebaseUserProfile>) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  becomeHost: () => Promise<{ error: string | null }>
  hasRole: (requiredRole: UserRole) => boolean
  hasMinimumRole: (minimumRole: UserRole) => boolean
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  host: 1,
  admin: 2,
}

function deriveRoleState(role: UserRole, profile: FirebaseUserProfile | null) {
  const isAdmin = role === 'admin'
  const isHost = isAdmin || role === 'host'
  const isHostPending =
    role === 'guest' &&
    Boolean(profile?.hostRequestedAt) &&
    !profile?.hostApprovedAt

  return { isAdmin, isHost, isHostPending }
}

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const isBrowser = typeof window !== 'undefined'
  const auth = isBrowser ? getFirebaseAuth() : null
  const db = isBrowser ? getFirebaseFirestore() : null

  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: 'guest',
    isLoading: true,
    isAuthenticated: false,
    isHost: false,
    isAdmin: false,
    isHostPending: false,
  })

  const getInitError = () => ({ error: 'Firebase auth is still initializing' as string | null })

  // Fetch user profile from Firestore
  const fetchProfile = useCallback(async (userId: string): Promise<FirebaseUserProfile | null> => {
    if (!db) return null

    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      
      if (!userDoc.exists()) {
        // Create a new profile if it doesn't exist
        const newProfile: FirebaseUserProfile = {
          id: userId,
          email: '',
          fullName: null,
          avatarUrl: null,
          phone: null,
          address: null,
          bio: null,
          role: 'guest',
          isVerified: false,
          hostRequestedAt: null,
          hostApprovedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        await setDoc(doc(db, 'users', userId), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        
        return newProfile
      }

      const data = userDoc.data()
      return {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        hostRequestedAt: data.hostRequestedAt?.toDate() || null,
        hostApprovedAt: data.hostApprovedAt?.toDate() || null,
      } as FirebaseUserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [db])

  // Initialize auth state
  useEffect(() => {
    if (!auth || !db) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid)
        const role = profile?.role || 'guest'
        const roleState = deriveRoleState(role, profile)

        setState({
          user: firebaseUser,
          profile,
          role,
          isLoading: false,
          isAuthenticated: true,
          ...roleState,
        })

        // Update email in profile if changed
        if (profile && profile.email !== firebaseUser.email) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            updatedAt: serverTimestamp(),
          }, { merge: true })
        }
      } else {
        setState({
          user: null,
          profile: null,
          role: 'guest',
          isLoading: false,
          isAuthenticated: false,
          isHost: false,
          isAdmin: false,
          isHostPending: false,
        })
      }
    })

    return () => unsubscribe()
  }, [auth, fetchProfile, db])

  // Sign in with email/password
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!auth) return getInitError()

    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error: error.message || 'Failed to sign in' }
    }
  }

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    if (!auth || !db) return getInitError()

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      const profile: UserProfile = {
        displayName: fullName
      }
      await firebaseUpdateProfile(user, profile)
      
      // Create user profile in Firestore
      const newProfile: FirebaseUserProfile = {
        id: user.uid,
        email: user.email || email,
        fullName,
        avatarUrl: user.photoURL,
        phone: null,
        address: null,
        bio: null,
        role: 'guest',
        isVerified: user.emailVerified,
        hostRequestedAt: null,
        hostApprovedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await setDoc(doc(db, 'users', user.uid), {
        ...newProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error: error.message || 'Failed to sign up' }
    }
  }

  // Sign out
  const signOut = async (): Promise<void> => {
    if (!auth) return

    await firebaseSignOut(auth)
  }

  // Sign in with Google
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!auth || !db) return getInitError()

    try {
      const provider = new GoogleAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      
      // Check if profile exists, if not create one
      const profile = await fetchProfile(user.uid)
      if (!profile) {
        const newProfile: FirebaseUserProfile = {
          id: user.uid,
          email: user.email || '',
          fullName: user.displayName,
          avatarUrl: user.photoURL,
          phone: user.phoneNumber,
          address: null,
          bio: null,
          role: 'guest',
          isVerified: user.emailVerified,
          hostRequestedAt: null,
          hostApprovedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        await setDoc(doc(db, 'users', user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      
      return { error: null }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      return { error: error.message || 'Failed to sign in with Google' }
    }
  }

  // Sign in with Facebook
  const signInWithFacebook = async (): Promise<{ error: string | null }> => {
    if (!auth || !db) return getInitError()

    try {
      const provider = new FacebookAuthProvider()
      const { user } = await signInWithPopup(auth, provider)
      
      // Check if profile exists, if not create one
      const profile = await fetchProfile(user.uid)
      if (!profile) {
        const newProfile: FirebaseUserProfile = {
          id: user.uid,
          email: user.email || '',
          fullName: user.displayName,
          avatarUrl: user.photoURL,
          phone: user.phoneNumber,
          address: null,
          bio: null,
          role: 'guest',
          isVerified: user.emailVerified,
          hostRequestedAt: null,
          hostApprovedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        await setDoc(doc(db, 'users', user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      
      return { error: null }
    } catch (error: any) {
      console.error('Facebook sign in error:', error)
      return { error: error.message || 'Failed to sign in with Facebook' }
    }
  }

  // Sign in with phone number
  const signInWithPhone = async (phone: string, recaptchaVerifier: RecaptchaVerifier): Promise<{ confirmationResult: ConfirmationResult | null; error: string | null }> => {
    if (!auth) {
      return { confirmationResult: null, ...getInitError() }
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier)
      return { confirmationResult, error: null }
    } catch (error: any) {
      console.error('Phone sign in error:', error)
      return { confirmationResult: null, error: error.message || 'Failed to send verification code' }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<FirebaseUserProfile>): Promise<{ error: string | null }> => {
    if (!db) return getInitError()

    try {
      if (!state.user) {
        return { error: 'User not authenticated' }
      }

      await setDoc(doc(db, 'users', state.user.uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      // Update local state
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }))

      return { error: null }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { error: error.message || 'Failed to update profile' }
    }
  }

  // Refresh profile
  const refreshProfile = async (): Promise<void> => {
    if (!db) return

    if (state.user) {
      const profile = await fetchProfile(state.user.uid)
      const role = profile?.role || 'guest'
      const roleState = deriveRoleState(role, profile)
      setState(prev => ({
        ...prev,
        profile,
        role,
        ...roleState,
      }))
    }
  }

  // Become host
  const becomeHost = async (): Promise<{ error: string | null }> => {
    if (!db) return getInitError()

    try {
      if (!state.user) {
        return { error: 'User not authenticated' }
      }

      if (state.role === 'host' || state.role === 'admin') {
        return { error: null }
      }

      const hasPendingRequest =
        Boolean(state.profile?.hostRequestedAt) &&
        !state.profile?.hostApprovedAt

      if (hasPendingRequest) {
        await refreshProfile()
        return { error: null }
      }

      await setDoc(doc(db, 'users', state.user.uid), {
        hostRequestedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true })

      await refreshProfile()
      return { error: null }
    } catch (error: any) {
      console.error('Become host error:', error)
      return { error: error.message || 'Failed to become host' }
    }
  }

  // Check role
  const hasRole = (requiredRole: UserRole): boolean => {
    return state.role === requiredRole
  }

  // Check minimum role
  const hasMinimumRole = (minimumRole: UserRole): boolean => {
    return roleHierarchy[state.role] >= roleHierarchy[minimumRole]
  }

  // Send password reset email
  const sendPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    if (!auth) return getInitError()

    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { error: error.message || 'Failed to send password reset email' }
    }
  }

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithPhone,
    updateProfile,
    refreshProfile,
    becomeHost,
    hasRole,
    hasMinimumRole,
    sendPasswordReset,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider')
  }
  return context
}

// Alias for easier usage
export const useAuth = useFirebaseAuth

// Alias for AuthProvider compatibility
export const AuthProvider = FirebaseAuthProvider

export { AuthContext }
