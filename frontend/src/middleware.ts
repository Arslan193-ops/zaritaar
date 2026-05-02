import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('session')
    
    if (!session) {
      const url = new URL('/login', request.url)
      // Optional: Add redirect parameter
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
