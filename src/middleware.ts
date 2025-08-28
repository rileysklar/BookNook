import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('🔍 Middleware running for:', request.nextUrl.pathname)
  
  // Intercept requests to the root path and redirect immediately
  if (request.nextUrl.pathname === '/') {
    console.log('🚀 Redirecting / to /map')
    return NextResponse.redirect(new URL('/map', request.url))
  }
  
  // Also catch any other potential root variations
  if (request.nextUrl.pathname === '' || request.nextUrl.pathname === '/index') {
    console.log('🚀 Redirecting empty/index to /map')
    return NextResponse.redirect(new URL('/map', request.url))
  }
  
  console.log('➡️ Continuing to:', request.nextUrl.pathname)
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/index', '/((?!_next|api|favicon.ico).*)'],
}