// app/returns-refunds-policy/page.tsx
import ReturnsRefundsPolicyPage from "@/components/policies/ReturnRefund";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Returns & Refunds Policy - Mega Prize Mall | 72-Hour Return Window & Guidelines",
  description:
    "Complete returns and refunds policy for Mega Prize Mall. Learn about 72-hour return window, eligibility criteria, Shop-n-Win contest impact, evidence requirements, and refund processing.",
  keywords: [
    "returns policy",
    "refunds policy",
    "return window 72 hours",
    "product return eligibility",
    "shop-n-win contest impact",
    "refund processing timeline",
    "non-returnable items",
    "return conditions",
    "return evidence requirements",
    "pickup charges",
    "quality inspection",
    "Mega Prize Mall returns",
    "mobile accessories return policy",
    "electronics return policy",
    "return verification",
    "refund methods",
    "return shipping",
    "lucky draw cancellation",
    "return request methods",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title:
      "Returns & Refunds Policy - Mega Prize Mall | 72-Hour Return Guidelines",
    description:
      "Complete guide to returns, refunds, evidence requirements, and how they affect Shop-n-Win contest participation at Mega Prize Mall.",
    type: "article",
    url: "https://megaprizemall.com/returns-refunds-policy",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Support Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Returns Policy",
      "Refunds Policy",
      "Return Window",
      "Shop-n-Win",
      "Customer Support",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Returns & Refunds Policy - Mega Prize Mall",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Returns & Refunds Policy - Mega Prize Mall | 72-Hour Return Window",
    description:
      "Complete returns and refunds policy with Shop-n-Win contest impact details and evidence requirements.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/returns-refunds-policy",
    languages: {
      "en-US": "https://megaprizemall.com/returns-refunds-policy",
      "en-GB": "https://megaprizemall.com/en-gb/returns-refunds-policy",
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
    "article:section": "Returns Policy",
    "article:tag": [
      "Returns Policy",
      "Refunds Policy",
      "Return Window",
      "Shop-n-Win",
      "Customer Service",
    ],

    // Dublin Core
    "dc.title": "Returns & Refunds Policy - Mega Prize Mall",
    "dc.description":
      "72-hour return window policy with detailed eligibility and evidence requirements",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Policy specific
    "policy:type": "Returns and Refunds Policy",
    "policy:return_window": "72 hours",
    "policy:refund_method": "Original Payment Method",
    "policy:evidence_required": "Photos and Videos",
    "policy:contest_impact": "Shop-n-Win Entry Cancelled",

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
    "schema:ReturnPolicy": "true",
    "schema:WebPage": "true",
  },

  // Category for SEO
  category: "policy",

  // Authors
  authors: [
    { name: "Mega Prize Mall Support Team" },
    {
      name: "Customer Service Department",
      url: "https://megaprizemall.com/support",
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
        "@id": "https://megaprizemall.com/returns-refunds-policy",
        url: "https://megaprizemall.com/returns-refunds-policy",
        name: "Returns & Refunds Policy - Mega Prize Mall",
        description:
          "72-hour return window policy with detailed eligibility criteria",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/returns-refunds-policy#breadcrumb",
        },
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Returns and Refunds Policy",
        },
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/returns-refunds-policy"],
          },
        ],
      },
      {
        "@type": "ReturnPolicy",
        name: "Returns & Refunds Policy",
        description: "72-hour return window policy with evidence requirements",
        url: "https://megaprizemall.com/returns-refunds-policy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnPolicy",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
        customerRemorseReturnFees: "https://schema.org/RestockingFees",
        itemCondition: "https://schema.org/NewCondition",
        returnPolicySeasonalOverride: {
          "@type": "ReturnPolicySeasonalOverride",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
        inStoreReturnsOffered: false,
        returnShippingFeesAmount: {
          "@type": "MonetaryAmount",
          currency: "PKR",
          value: "0",
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
          contactType: "returns support",
          email: "support@megaprizemall.com",
          availableLanguage: ["en", "ur"],
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
        <ReturnsRefundsPolicyPage />
      </div>
    </>
  );
}
