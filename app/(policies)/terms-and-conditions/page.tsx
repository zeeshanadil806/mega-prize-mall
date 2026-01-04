// app/terms-and-conditions/page.tsx
import TermsAndConditionsPage from "@/components/policies/Terms";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Terms & Conditions - Mega Prize Mall | Legal User Agreement & Platform Terms",
  description:
    "Complete legal Terms & Conditions for Mega Prize Mall. Covers account usage, purchases, payments, returns, promotions, and user responsibilities. Updated regularly for compliance.",
  keywords: [
    "terms and conditions",
    "legal agreement",
    "user terms",
    "website terms of service",
    "e-commerce legal terms",
    "purchase agreement terms",
    "return policy terms",
    "account terms and conditions",
    "platform usage terms",
    "Mega Prize Mall legal",
    "user agreement terms",
    "legal compliance terms",
    "shopping website terms",
    "online store terms",
    "payment terms and conditions",
    "delivery terms",
    "promotional terms",
    "liability limitation",
    "intellectual property terms",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Terms & Conditions - Mega Prize Mall | Legal Platform Agreement",
    description:
      "Complete legal terms governing your use of Mega Prize Mall platform, purchases, payments, and promotional participation.",
    type: "article",
    url: "https://megaprizemall.com/terms-and-conditions",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Legal Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Legal Terms",
      "User Agreement",
      "Terms & Conditions",
      "Legal Compliance",
      "Platform Terms",
    ],
    images: [
      {
        url: "https://megaprizemall.com/og-terms-and-conditions.jpg",
        width: 1200,
        height: 630,
        alt: "Terms & Conditions - Mega Prize Mall",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions - Mega Prize Mall | Legal Platform Terms",
    description:
      "Complete legal terms and conditions for Mega Prize Mall platform usage, purchases, and promotions.",
    images: ["https://megaprizemall.com/twitter-terms-and-conditions.jpg"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/terms-and-conditions",
    languages: {
      "en-US": "https://megaprizemall.com/terms-and-conditions",
      "en-GB": "https://megaprizemall.com/en-gb/terms-and-conditions",
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
    "article:section": "Legal Terms",
    "article:tag": [
      "Legal Terms",
      "User Agreement",
      "Platform Terms",
      "Legal Compliance",
      "E-commerce Terms",
    ],

    // Dublin Core
    "dc.title": "Terms & Conditions - Mega Prize Mall",
    "dc.description": "Legal terms and conditions governing platform usage",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Legal specific
    "legal:type": "Terms and Conditions",
    "legal:jurisdiction": "Pakistan",
    "legal:last_updated": "2026-01-20",
    "legal:version": "3.1",

    // Mobile
    "format-detection": "telephone=yes",
    "theme-color": "#7C2C78",

    // SEO enhancement
    referrer: "origin-when-cross-origin",
    "content-language": "en",
    audience: "all",
    distribution: "global",
    "revisit-after": "7 days",

    // Structured data indicators
    "schema:LegalDocument": "true",
    "schema:WebPage": "true",
  },

  // Category for SEO
  category: "legal",

  // Authors
  authors: [
    { name: "Mega Prize Mall Legal Team" },
    {
      name: "Legal Compliance Department",
      url: "https://megaprizemall.com/legal",
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
  manifest: "/site.webmanifest",
};

// Generate comprehensive structured data
function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://megaprizemall.com/terms-and-conditions",
        url: "https://megaprizemall.com/terms-and-conditions",
        name: "Terms & Conditions - Mega Prize Mall",
        description: "Legal terms and conditions governing platform usage",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/terms-and-conditions#breadcrumb",
        },
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Legal Terms and Conditions",
        },
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/terms-and-conditions"],
          },
        ],
      },
      {
        "@type": "LegalDocument",
        name: "Terms & Conditions",
        description: "Legal agreement for Mega Prize Mall platform usage",
        url: "https://megaprizemall.com/terms-and-conditions",
        dateCreated: "2024-01-01",
        dateModified: "2026-01-20",
        version: "3.1",
        publisher: {
          "@type": "Organization",
          name: "Mega Prize Mall",
          url: "https://megaprizemall.com",
        },
        isPartOf: {
          "@type": "WebPage",
          url: "https://megaprizemall.com/terms-and-conditions",
        },
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
          contactType: "legal support",
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
        <TermsAndConditionsPage />
      </div>
    </>
  );
}
