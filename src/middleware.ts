import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Route configuration
const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/apartments',
  '/hotels',
  '/tours',
  '/search',
  '/property',
  '/support',
  '/help-center',
  '/safety',
  '/cancellation',
  '/covid-19-response',
  '/legal',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/sitemap',
]
const GUEST_PATHS = ['/dashboard', '/bookings', '/wishlist', '/profile']
const HOST_PATHS = ['/host']
const ADMIN_PATHS = ['/admin']
const STATIC_FILES = ['/sitemap.xml', '/robots.txt']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, skip auth checks
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'your_supabase_project_url' || 
      supabaseAnonKey === 'your_supabase_anon_key') {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Allow static files (sitemap, robots.txt)
  if (STATIC_FILES.includes(pathname)) {
    return supabaseResponse
  }

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // Allow public paths
  if (isPublicPath && !pathname.startsWith('/dashboard') && 
      !pathname.startsWith('/bookings') && !pathname.startsWith('/wishlist') &&
      !pathname.startsWith('/profile') && !pathname.startsWith('/host') &&
      !pathname.startsWith('/admin')) {
    return supabaseResponse
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = userData?.role || 'guest'

  // Admin-only routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Host-only routes (admins can also access)
  if (pathname.startsWith('/host')) {
    // Allow access to host registration page for authenticated users
    if (pathname === '/host/register' || pathname === '/host/pending') {
      return supabaseResponse
    }
    
    if (userRole !== 'host' && userRole !== 'admin') {
      // Redirect guests to become a host page
      const url = request.nextUrl.clone()
      url.pathname = '/host/register'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}

