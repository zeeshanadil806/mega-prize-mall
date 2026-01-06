import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/proxy-image/**",
      },
      {
        protocol: "https",
        hostname: "ed2e38594ec08a2f3cbb541c3933f44c.r2.cloudflarestorage.com",
        pathname: "/mega-prize-products/**",
      },
      {
        protocol: "https",
        hostname: "pub-*.r2.dev", // Allow ALL R2 public buckets
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-b072b472844f414b9c691e5a9b16d1e1.r2.dev",
        pathname: "/**",
      },
      // Add your production domain
      {
        protocol: "https",
        hostname: "yourdomain.com",
        pathname: "/api/proxy-image/**",
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
};

export default nextConfig;
