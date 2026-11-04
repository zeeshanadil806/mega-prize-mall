// app/cookie-policy/page.tsx
import CookiePolicyPage from "@/components/policies/Cookie";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Cookie Policy | Mega Prize Mall - Cookie Usage & Tracking Technologies",
  description:
    "Comprehensive cookie policy for Mega Prize Mall. Learn about essential cookies, analytics, marketing cookies, Shop & Win system integration, and how to manage your cookie preferences.",
  keywords: [
    "cookie policy",
    "cookie usage",
    "tracking technologies",
    "essential cookies",
    "analytics cookies",
    "marketing cookies",
    "cookie management",
    "Shop & Win cookies",
    "privacy settings",
    "browser cookies",
    "cookie consent",
    "data tracking",
    "cookie preferences",
    "third-party cookies",
    "cookie security",
    "cookie retention",
    "cookie lifespan",
    "cookie control",
    "e-commerce cookies",
    "mobile accessories cookies",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Cookie Policy - Mega Prize Mall | Cookie Usage & Management",
    description:
      "Detailed cookie policy explaining cookie types, purposes, management options, and Shop & Win system integration at Mega Prize Mall.",
    type: "article",
    url: "https://megaprizemall.com/cookie-policy",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Privacy Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Cookie Policy",
      "Privacy",
      "Tracking Technologies",
      "Cookies",
      "Data Protection",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall Cookie Policy Overview",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy | Mega Prize Mall - Cookie Usage Guide",
    description:
      "Learn about cookie usage, types, management, and Shop & Win system integration at Mega Prize Mall.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/cookie-policy",
    languages: {
      "en-US": "https://megaprizemall.com/cookie-policy",
      "en-GB": "https://megaprizemall.com/en-gb/cookie-policy",
    },
  },

  // Robots with enhanced directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Additional meta tags for SEO
  other: {
    // Article metadata
    "article:published_time": "2024-01-01T00:00:00Z",
    "article:modified_time": "2026-01-20T00:00:00Z",
    "article:section": "Legal Policies",
    "article:tag": [
      "Cookie Policy",
      "Privacy",
      "Data Protection",
      "Tracking",
      "Cookies",
    ],

    // Dublin Core
    "dc.title": "Cookie Policy - Mega Prize Mall",
    "dc.description":
      "Comprehensive cookie policy detailing usage, types, management, and integration with promotional systems",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Cookie specific
    "cookie:essential": "Required",
    "cookie:analytics": "Optional",
    "cookie:marketing": "Optional",
    "cookie:retention": "Session to 24 months",
    "cookie:management": "Browser settings available",

    // Mobile
    "format-detection": "telephone=yes",
    "theme-color": "#011b54",

    // SEO enhancement
    referrer: "origin-when-cross-origin",
    "content-language": "en",
    audience: "all",
    distribution: "global",
    "revisit-after": "7 days",

    // Structured data indicators
    "schema:FAQPage": "true",
    "schema:WebPage": "true",
    "schema:CookiePolicy": "true",
  },

  // Category for SEO
  category: "legal",

  // Authors
  authors: [
    { name: "Mega Prize Mall Privacy Team" },
    { name: "Data Protection Officer", url: "https://megaprizemall.com/dpo" },
  ],

  // Application name
  applicationName: "Mega Prize Mall",

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Manifest
  manifest: "/manifest.webmanifest",
};

// Generate comprehensive structured data
function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://megaprizemall.com/cookie-policy",
        url: "https://megaprizemall.com/cookie-policy",
        name: "Cookie Policy - Mega Prize Mall",
        description:
          "Comprehensive cookie policy detailing types, purposes, management, and integration with promotional systems",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/cookie-policy#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/cookie-policy"],
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://megaprizemall.com/cookie-policy#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://megaprizemall.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Cookie Policy",
            item: "https://megaprizemall.com/cookie-policy",
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://megaprizemall.com/#organization",
        name: "Mega Prize Mall",
        url: "https://megaprizemall.com",
        logo: "https://megaprizemall.com/logo.png",
        description:
          "Premium mobile accessories with bargain deals and prize draws",
        sameAs: [
          "https://www.facebook.com/share/185WjBxPwM/",
          "https://www.tiktok.com/@mega.prize.mall?_r=1&_t=ZS-92NZ1rNTia5",
          "https://www.instagram.com/megaprizemall?igsh=MWZzdDAwOHB2bTkyMQ==",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "cookie support",
          email: "support@megaprizemall.com",
          availableLanguage: ["en"],
        },
      },
    ],
  };
}

export default function Page() {
  const structuredData = generateStructuredData();

  return (
    <>
      {/* Structured Data for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div>
        <CookiePolicyPage />
      </div>
    </>
  );
}
