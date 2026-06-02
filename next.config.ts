import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";


const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Rewrites barrel imports (`import { Smartphone, Headphones } from
    // "lucide-react"`) into per-icon deep imports at build time so the
    // client bundle ships only the icons actually used. lucide-react is
    // imported in 90+ files here, so the cumulative saving is real.
    // Likely already on Next 16's default list, but explicit avoids
    // surprise drift if the default changes.
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // AVIF first (smaller than WebP), then WebP, then the original format.
    // Browsers that don't support AVIF/WebP fall back automatically via the
    // <picture> element Next emits.
    formats: ["image/avif", "image/webp"],
    // Default is 60 seconds — way too short for product images that rarely
    // change. 30 days keeps the optimized variants in the edge cache instead
    // of re-fetching from R2 on every cold render.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ed2e38594ec08a2f3cbb541c3933f44c.r2.cloudflarestorage.com",
        pathname: "/mega-prize-products/**",
      },
      {
        // Covers every R2 public-bucket subdomain (pub-<bucket-id>.r2.dev).
        protocol: "https",
        hostname: "pub-*.r2.dev",
        pathname: "/**",
      },
    ],
  },
  // typescript: {
  //   // !! WARN !!
  //   // Dangerously allow production builds to successfully complete even if
  //   // your project has type errors.
  //   ignoreBuildErrors: false,
  // },
  // eslint: {
  //   // Warning: This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: false,
  // }
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

// withSentryConfig handles the Webpack plugin wiring that uploads source
// maps to Sentry at build time so stack traces in the dashboard are
// minified-friendly. It no-ops gracefully when SENTRY_AUTH_TOKEN /
// SENTRY_ORG / SENTRY_PROJECT are absent (dev, or prod-without-Sentry),
// so wrapping unconditionally is safe.
export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Widen the upload to include all client bundles so stack frames from
  // dynamically-imported chunks symbolicate correctly.
  widenClientFileUpload: true,

  // Trims a small amount of bundle size by stripping Sentry's internal
  // logger from the production build.
  disableLogger: true,

  // Skip telemetry pings to Sentry about the build itself.
  telemetry: false,
});
