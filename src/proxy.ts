import { NextResponse, type NextRequest } from 'next/server'

export function proxy(_request: NextRequest) {
  // Auth/role routing is handled client-side via Firebase auth context.
  void _request
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
