// app/disclaimer/page.tsx
import DisclaimerPage from "@/components/policies/DisclaimerPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Disclaimer | Mega Prize Mall - Terms, Conditions & Limitations",
  description:
    "Comprehensive legal disclaimer for Mega Prize Mall. Read terms of use, liability limitations, Shop & Win rules, and important legal notices for mobile accessories shopping.",
  keywords: [
    "legal disclaimer",
    "terms of use",
    "liability disclaimer",
    "Mega Prize Mall disclaimer",
    "legal terms",
    "shop & win disclaimer",
    "no gambling policy",
    "limited liability",
    "user agreement",
    "legal notice",
    "e-commerce disclaimer",
    "online shopping terms",
    "mobile accessories disclaimer",
    "promotional terms",
    "indemnification",
    "force majeure",
    "legal rights",
    "consumer protection",
    "legal compliance",
    "platform terms",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Legal Disclaimer - Mega Prize Mall | Terms & Conditions",
    description:
      "Complete legal terms, disclaimers, and limitations for Mega Prize Mall e-commerce platform. Read important legal notices before using our services.",
    type: "article",
    url: "https://megaprizemall.com/disclaimer",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Legal Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Legal Disclaimer",
      "Terms of Use",
      "Legal Notice",
      "E-commerce Terms",
      "Liability",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall Legal Disclaimer & Terms",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Legal Disclaimer | Mega Prize Mall - Read Terms",
    description:
      "Important legal terms, disclaimers, and limitations for Mega Prize Mall platform usage.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/disclaimer",
    languages: {
      "en-US": "https://megaprizemall.com/disclaimer",
      "en-GB": "https://megaprizemall.com/en-gb/disclaimer",
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
    "article:section": "Legal Documents",
    "article:tag": [
      "Legal Disclaimer",
      "Terms of Service",
      "User Agreement",
      "Legal Notice",
    ],

    // Dublin Core
    "dc.title": "Legal Disclaimer - Mega Prize Mall",
    "dc.description":
      "Comprehensive legal terms and disclaimers for e-commerce platform usage",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Legal specific
    "legal:jurisdiction": "Pakistan",
    "legal:type": "Disclaimer",
    "legal:version": "3.2",
    "legal:binding": "true",
    "legal:acceptance": "Required",

    // Mobile
    "format-detection": "telephone=yes",
    "theme-color": "#7C2C78",

    // SEO enhancement
    referrer: "origin-when-cross-origin",
    "content-language": "en",
    audience: "all",
    distribution: "global",
    "revisit-after": "30 days",

    // Structured data indicators
    "schema:LegalService": "true",
    "schema:FAQPage": "true",
    "schema:WebPage": "true",
  },

  // Category for SEO
  category: "legal",

  // Authors
  authors: [
    { name: "Mega Prize Mall Legal Team" },
    { name: "Legal Department", url: "https://megaprizemall.com/legal" },
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
  manifest: "/site.webmanifest",
};

// Generate comprehensive structured data
function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://megaprizemall.com/disclaimer",
        url: "https://megaprizemall.com/disclaimer",
        name: "Legal Disclaimer - Mega Prize Mall",
        description:
          "Comprehensive legal terms, disclaimers, and limitations for platform usage",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/disclaimer#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/disclaimer"],
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://megaprizemall.com/disclaimer#breadcrumb",
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
            name: "Legal Disclaimer",
            item: "https://megaprizemall.com/disclaimer",
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
          contactType: "legal department",
          email: "support@megaprizemall.com",
          availableLanguage: ["en"],
        },
      },
      {
        "@type": "LegalService",
        name: "Legal Disclaimer Service",
        description: "Legal terms and disclaimers for e-commerce platform",
        provider: {
          "@type": "Organization",
          name: "Mega Prize Mall",
        },
        termsOfService: "https://megaprizemall.com/disclaimer",
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
        <DisclaimerPage />
      </div>
    </>
  );
}
