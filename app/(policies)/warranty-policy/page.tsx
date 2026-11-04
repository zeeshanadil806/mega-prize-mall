// app/warranty/page.tsx
import WarrantyPolicyPage from "@/components/policies/WarrantyPolicyPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty Policy | Mega Prize Mall - Mobile Accessories Guarantee",
  description:
    "Complete warranty policy for Mega Prize Mall. Learn about manufacturer warranties, 7-day replacements, claim processes, and how warranty affects Shop & Win entries for mobile accessories.",
  keywords: [
    "warranty policy",
    "product warranty",
    "mobile accessories warranty",
    "manufacturer warranty",
    "replacement warranty",
    "warranty claim process",
    "7-day replacement",
    "electronics warranty",
    "shop & win warranty impact",
    "warranty void conditions",
    "warranty terms",
    "product guarantee",
    "warranty coverage",
    "warranty support",
    "warranty requirements",
    "no warranty products",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Warranty Policy - Mega Prize Mall | Product Guarantee & Claims",
    description:
      "Comprehensive warranty coverage for mobile accessories. Learn about claim processes, warranty types, and how it affects your Shop & Win eligibility.",
    type: "article",
    url: "https://megaprizemall.com/warranty",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Warranty Team", "Quality Assurance Department"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-15T00:00:00Z",
    tags: [
      "Warranty Policy",
      "Product Guarantee",
      "Mobile Accessories",
      "Electronics Warranty",
      "Return Policy",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall Warranty Policy Coverage",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Warranty Policy | Mega Prize Mall - Product Protection",
    description:
      "Your product protection guide. Learn about warranty coverage, claim processes, and important policies for mobile accessories.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/warranty",
    languages: {
      "en-US": "https://megaprizemall.com/warranty",
      "en-GB": "https://megaprizemall.com/en-gb/warranty",
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
    "article:modified_time": "2026-01-15T00:00:00Z",
    "article:section": "Legal Policies",
    "article:tag": [
      "Warranty",
      "Product Guarantee",
      "Returns",
      "Mobile Accessories",
      "Electronics",
    ],

    // Dublin Core
    "dc.title": "Warranty Policy - Mega Prize Mall",
    "dc.description":
      "Comprehensive warranty terms and conditions for mobile accessories and electronics products",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-15",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Warranty specific
    "warranty:type": "Manufacturer, Replacement, As-Is",
    "warranty:duration": "7D to 730D",
    "product:category": "Mobile Accessories, Electronics",

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
    "schema:WarrantyPromise": "true",
    "schema:FAQPage": "true",
  },

  // Category for SEO
  category: "legal",

  // Authors
  authors: [
    { name: "Mega Prize Mall Warranty Team" },
    {
      name: "Quality Assurance Department",
      url: "https://megaprizemall.com/quality",
    },
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
        "@id": "https://megaprizemall.com/warranty",
        url: "https://megaprizemall.com/warranty",
        name: "Warranty Policy - Mega Prize Mall",
        description:
          "Comprehensive warranty terms and conditions for electronics products",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-15T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/warranty#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/warranty"],
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://megaprizemall.com/warranty#breadcrumb",
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
            name: "Warranty Policy",
            item: "https://megaprizemall.com/warranty",
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
          contactType: "warranty support",
          email: "support@megaprizemall.com",
          availableLanguage: ["en"],
        },
      },
      {
        "@type": "WarrantyPromise",
        name: "Mega Prize Mall Warranty",
        description: "Product warranty coverage for mobile accessories",
        warrantyScope: {
          "@type": "WarrantyScope",
          scope: "Manufacturing defects and hardware failures",
        },
        durationOfWarranty: "P7D to P730D",
        url: "https://megaprizemall.com/warranty",
        provider: {
          "@type": "Organization",
          name: "Mega Prize Mall",
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
        <WarrantyPolicyPage />
      </div>
    </>
  );
}
