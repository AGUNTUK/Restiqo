import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function useSupabaseClient() {
  return createClient()
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return a mock client if environment variables are not set
  if (!supabaseUrl || !supabaseAnonKey ||
    supabaseUrl === 'your_supabase_project_url' ||
    supabaseAnonKey === 'your_supabase_anon_key') {
    console.warn('Supabase environment variables not configured. Using mock client.')
     
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured. Please check your environment variables.' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured. Please check your environment variables.' } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ data: { provider: null, url: null }, error: { message: 'Supabase not configured' } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        eq: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: null, error: null }),
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  }

  // Create singleton client to avoid multiple instances
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return client
}
