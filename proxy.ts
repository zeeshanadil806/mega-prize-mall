// import { NextRequest, NextResponse } from 'next/server'
// import { getToken } from 'next-auth/jwt'
// import { log } from '@/lib/logger'

// // Define route patterns
// const publicPatterns = [
//   '/',
//   '/login',
//   '/register',
//   '/categories',           // Add this
//   '/not-found',           // Add this
//   '/products/(.*)',
//   '/product(.*)',
//   '/api/auth(.*)',
// ]

// const adminPatterns = [
//   '/admin(.*)',
// ]

// const customerPatterns = [
//   '/dashboard',
//   '/dashboard/(.*)',
//   '/cart',
//   '/checkout',
//   '/checkout/success',
//   '/addresses',
// ]

// // Helper to match patterns
// function matchPattern(pathname: string, patterns: string[]): boolean {
//   return patterns.some(pattern => {
//     // Convert pattern to regex
//     const regexPattern = pattern
//       .replace(/\//g, '\\/') // Escape slashes
//       .replace(/\*/g, '.*')  // Convert * to .*
//       .replace(/\(\.\*\)/g, '(.*)') // Handle (.*) patterns
    
//     const regex = new RegExp(`^${regexPattern}$`)
//     return regex.test(pathname)
//   })
// }


// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
  
//   // Skip for static files and API routes (they handle auth separately)
//   if (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/public') ||
//     pathname.startsWith('/api/')
//   ) {
//     return NextResponse.next()
//   }

//   // Get the session token
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET!,
//   })

//   // Check if route is public
//   const isPublicRoute = matchPattern(pathname, publicPatterns)

//   if (isPublicRoute) {
//     return NextResponse.next()
//   }

//   // If no token and trying to access protected route, redirect to login
//   if (!token) {
//     const loginUrl = new URL('/login', request.url)
//     loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
//     return NextResponse.redirect(loginUrl)
//   }

//   const userRole = token.role as string

//   // Check admin routes
//   const isAdminRoute = matchPattern(pathname, adminPatterns)

//   if (isAdminRoute && userRole !== 'admin') {
//     log.warn('Unauthorized admin access attempt', {
//       userId: token.sub,
//       path: pathname,
//       role: userRole
//     })
    
//     // Redirect customers to customer dashboard
//     if (userRole === 'customer') {
//       return NextResponse.redirect(new URL('/dashboard', request.url))
//     }
    
//     // Redirect support staff to support dashboard
//     return NextResponse.redirect(new URL('/', request.url))
//   }

//   // Check customer routes
//   const isCustomerRoute = matchPattern(pathname, customerPatterns)

//   if (isCustomerRoute && userRole !== 'customer' && userRole !== 'admin') {
//     // Only customers and admins can access customer routes
//     return NextResponse.redirect(new URL('/', request.url))
//   }

//   // Log successful access
//   log.info('Route access', {
//     userId: token.sub,
//     path: pathname,
//     role: userRole,
//     method: request.method
//   })

//   // Add security headers using Next.js v16 method
//   const response = NextResponse.next()
  
//   // Security headers
//   const securityHeaders = {
//     'X-DNS-Prefetch-Control': 'on',
//     'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
//     'X-Frame-Options': 'DENY',
//     'X-Content-Type-Options': 'nosniff',
//     'Referrer-Policy': 'origin-when-cross-origin',
//     'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
//     'X-XSS-Protection': '1; mode=block',
//   }

//   Object.entries(securityHeaders).forEach(([key, value]) => {
//     response.headers.set(key, value)
//   })

//   return response
// }

// // Configure matcher (Next.js v16 style)
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     '/((?!api|_next|images|favicon.ico|public/|.*\\..*$).*)',
//   ],
// }



import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { log } from '@/lib/logger'

// Define route patterns
const publicPatterns = [
  '/',
  '/login',
  '/register',
  '/categories',
  '/not-found',
  '/products',
  '/products/[^/]+', // Match /products/slug (single segment)
  '/product.*', // Match /product or /product/*
  '/api/auth.*',
]

const adminPatterns = [
  '/admin.*',
]

const customerPatterns = [
  '/dashboard.*',
  '/cart',
  '/checkout.*',
  '/addresses',
]

// Fixed pattern matcher
function matchPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Convert simpler patterns to regex
    if (pattern.includes('.*')) {
      // Already a regex-like pattern
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    
    // Exact match or starts with
    if (pattern.endsWith('.*')) {
      const base = pattern.slice(0, -2);
      return pathname === base || pathname.startsWith(base + '/');
    }
    
    // Exact match
    return pathname === pattern;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Debug: Add this to see what's being blocked
  console.log(`🔍 Middleware checking: ${pathname}`)
  
  // Skip for static files, API routes, and files with extensions
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api/') ||
    /\.[^/]+$/.test(pathname) // Ends with file extension
  ) {
    console.log(`⏩ Skipping: ${pathname}`)
    return NextResponse.next()
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    // Force secureCookie to true if we are in production
    secureCookie: process.env.NODE_ENV === 'production',
  })
// Debugging: If token is null in prod, log what cookies we actually see
  if (!token && process.env.NODE_ENV === 'production') {
    console.log(`[Middleware] No token found for path: ${pathname}`)
    console.log(`[Middleware] Cookies present:`, request.cookies.getAll().map(c => c.name))
  }
  // Debug token
  console.log(`🔐 Token exists: ${!!token}, Role: ${token?.role || 'none'}`)

  // Check if route is public
  const isPublicRoute = matchPattern(pathname, publicPatterns)

  if (isPublicRoute) {
    console.log(`✅ Public route: ${pathname}`)
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log(`🔒 No token, redirecting to login from: ${pathname}`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(loginUrl)
  }

  const userRole = token.role as string || 'customer'

  // Check admin routes
  const isAdminRoute = matchPattern(pathname, adminPatterns)

  if (isAdminRoute) {
    if (userRole !== 'admin') {
      console.log(`🚫 Blocked: ${userRole} accessing admin route ${pathname}`)
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
    console.log(`✅ Admin allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Check customer routes
  const isCustomerRoute = matchPattern(pathname, customerPatterns)

  if (isCustomerRoute) {
    if (userRole !== 'customer' && userRole !== 'admin') {
      console.log(`🚫 Blocked: ${userRole} accessing customer route ${pathname}`)
      return NextResponse.redirect(new URL('/', request.url))
    }
    console.log(`✅ Customer allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Default: Allow access (for any other routes not specified)
  console.log(`⚠️  Unspecified route, allowing: ${pathname}`)
  
  // Log successful access
  log.info('Route access', {
    userId: token.sub,
    path: pathname,
    role: userRole,
    method: request.method
  })

  // Add security headers
  const response = NextResponse.next()
  
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
    // Match all except static files, API, and files with extensions
    '/((?!api|_next|images|favicon\\.ico|public/|.*\\.[^/]*$).*)',
  ],
}