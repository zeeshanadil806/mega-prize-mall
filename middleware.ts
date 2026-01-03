import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { log } from '@/lib/logger'

// Define route patterns
const publicPatterns = [
  '/',
  '/login',
  '/register',
  '/categories',           // Add this
  '/not-found',           // Add this
  '/products/(.*)',
  '/product(.*)',
  '/api/auth(.*)',
]

const adminPatterns = [
  '/admin(.*)',
]

const customerPatterns = [
  '/dashboard',
  '/dashboard/(.*)',
  '/cart',
  '/checkout',
  '/checkout/success',
  '/addresses',
]

// Helper to match patterns
function matchPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\//g, '\\/') // Escape slashes
      .replace(/\*/g, '.*')  // Convert * to .*
      .replace(/\(\.\*\)/g, '(.*)') // Handle (.*) patterns
    
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(pathname)
  })
}


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip for static files and API routes (they handle auth separately)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
  })

  // Check if route is public
  const isPublicRoute = matchPattern(pathname, publicPatterns)

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as string

  // Check admin routes
  const isAdminRoute = matchPattern(pathname, adminPatterns)

  if (isAdminRoute && userRole !== 'admin') {
    log.warn('Unauthorized admin access attempt', {
      userId: token.sub,
      path: pathname,
      role: userRole
    })
    
    // Redirect customers to customer dashboard
    if (userRole === 'customer') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Redirect support staff to support dashboard
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check customer routes
  const isCustomerRoute = matchPattern(pathname, customerPatterns)

  if (isCustomerRoute && userRole !== 'customer' && userRole !== 'admin') {
    // Only customers and admins can access customer routes
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Log successful access
  log.info('Route access', {
    userId: token.sub,
    path: pathname,
    role: userRole,
    method: request.method
  })

  // Add security headers using Next.js v16 method
  const response = NextResponse.next()
  
  // Security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure matcher (Next.js v16 style)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}