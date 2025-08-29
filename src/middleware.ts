import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔒 Middleware executing for:', request.nextUrl.pathname)
  
  // Allow Clerk routes and static assets through
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/sign-in') ||
      request.nextUrl.pathname.startsWith('/sign-up')) {
    console.log('✅ Allowing Clerk/static route through')
    return NextResponse.next()
  }
  
  // Allow all other requests through - authentication is handled by components
  console.log('✅ Middleware allowing request through')
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
}