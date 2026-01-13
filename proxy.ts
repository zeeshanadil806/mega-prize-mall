import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "@/lib/logger";

// Define route patterns


// Fixed pattern matcher
function matchPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Convert simpler patterns to regex
    if (pattern.includes(".*")) {
      // Already a regex-like pattern
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    
    // Exact match or starts with
    if (pattern.endsWith(".*")) {
      const base = pattern.slice(0, -2);
      return pathname === base || pathname.startsWith(base + "/");
    }
    
    // Exact match
    return pathname === pattern;
  });
}
// Public routes - anyone can access
const publicPatterns = [
  "/",
  "/login",
  "/register",
  "/cart",
  "/privacy-policy",
  "/warranty-policy",
  "/cookie-policy",
  "/terms-and-conditions",
  "/shop-n-win-contest",
  "/returns-refunds-policy",
  "/shipping-policy",
  "/faq",
  "/disclaimer",
  "/categories",
  "/not-found",
  "/products",
  "/products/[^/]+",
  "/product.*",
  "/api/auth.*",
];

// BOTH Admin & Support can access these
const sharedAdminPatterns = [
  "/admin$",               // Admin dashboard
  "/admin/products.*",     // Products management
  "/admin/orders.*",       // Orders management
  "/admin/bargain.*",      // Bargain requests
  "/admin/coupons.*",      // Coupons management
];

// ONLY Admin can access these (Support CANNOT)
const adminOnlyPatterns = [
  "/admin/analytics.*",    // Analytics dashboard & sub-pages
  "/admin/users.*",        // Users management
  "/admin/support.*",      // Support accounts management
  "/admin/lucky-draw.*",   // Lucky draw management
  "/admin/settings.*",     // Settings (if you have)
  "/test-tiktok",
];

// Customer routes
const customerPatterns = ["/dashboard.*", "/checkout.*", "/addresses"];

// Fixed pattern matcher function remains the same...

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug: Add this to see what's being blocked
  console.log(`🔍 Middleware checking: ${pathname}`);

  // Skip for static files, API routes, and files with extensions
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/") ||
    /\.[^/]+$/.test(pathname)
  ) {
    console.log(`⏩ Skipping: ${pathname}`);
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Debug token
  console.log(`🔐 Token exists: ${!!token}, Role: ${token?.role || "none"}`);

  // Check if route is public
  const isPublicRoute = matchPattern(pathname, publicPatterns);

  if (isPublicRoute) {
    console.log(`✅ Public route: ${pathname}`);
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log(`🔒 No token, redirecting to login from: ${pathname}`);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (token.role as string) || "customer";

  // Check if it's a SHARED admin route (both admin & support)
  const isSharedAdminRoute = matchPattern(pathname, sharedAdminPatterns);
  
  // Check if it's an ADMIN-ONLY route
  const isAdminOnlyRoute = matchPattern(pathname, adminOnlyPatterns);

  // Handle SHARED admin routes (both admin & support can access)
  if (isSharedAdminRoute) {
    console.log(`🛡️  Shared admin route detected: ${pathname}`);
    
    // ADMIN can access
    if (userRole === "admin") {
      console.log(`✅ Admin allowed on shared route: ${pathname}`);
      return NextResponse.next();
    }
    
    // SUPPORT can access
    if (userRole === "support") {
      console.log(`✅ Support allowed on shared route: ${pathname}`);
      return NextResponse.next();
    }
    
    // CUSTOMER trying to access shared admin routes
    if (userRole === "customer") {
      console.log(`🚫 Customer blocked from admin route: ${pathname}`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Default block for any other role
    console.log(`🚫 Blocked: ${userRole} accessing shared admin route ${pathname}`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle ADMIN-ONLY routes (only admin can access)
  if (isAdminOnlyRoute) {
    console.log(`👑 Admin-only route detected: ${pathname}`);
    
    // ONLY ADMIN can access
    if (userRole === "admin") {
      console.log(`✅ Admin allowed on admin-only route: ${pathname}`);
      return NextResponse.next();
    }
    
    // SUPPORT trying to access admin-only routes
    if (userRole === "support") {
      console.log(`🚫 Support blocked from admin-only route: ${pathname}`);
      // Redirect support to admin dashboard (which they can access)
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    // CUSTOMER trying to access admin-only routes
    if (userRole === "customer") {
      console.log(`🚫 Customer blocked from admin-only route: ${pathname}`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Default block for any other role
    console.log(`🚫 Blocked: ${userRole} accessing admin-only route ${pathname}`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check customer routes
  const isCustomerRoute = matchPattern(pathname, customerPatterns);

  if (isCustomerRoute) {
    if (userRole !== "customer" && userRole !== "admin") {
      console.log(`🚫 Blocked: ${userRole} accessing customer route ${pathname}`);
      return NextResponse.redirect(new URL("/", request.url));
    }
    console.log(`✅ Customer allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Default: Allow access (for any other routes not specified)
  console.log(`⚠️  Unspecified route, allowing: ${pathname}`);

  // Log successful access
  log.info("Route access", {
    userId: token.sub,
    path: pathname,
    role: userRole,
    method: request.method,
  });

  // Add security headers
  const response = NextResponse.next();

  const securityHeaders = {
    "X-DNS-Prefetch-Control": "on",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-XSS-Protection": "1; mode=block",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configure matcher (Next.js v16 style)
export const config = {
  matcher: [
    // Match all except static files, API, and files with extensions
    "/((?!api|_next|images|favicon\\.ico|public/|.*\\.[^/]*$).*)",
  ],
};
