// app/shipping-policy/page.tsx
import ShippingPolicyPage from "@/components/policies/Shipping";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Shipping Policy - Mega Prize Mall | Delivery Timeline, Tracking & Unboxing Requirements",
  description:
    "Complete shipping policy for Mega Prize Mall. 24-48 hour processing, 2-9 day delivery timelines, mandatory unboxing video requirements, and Shop-n-Win contest eligibility conditions.",
  keywords: [
    "shipping policy",
    "delivery timeline",
    "order processing time",
    "tracking orders",
    "unboxing video required",
    "damage claim procedure",
    "courier partners",
    "COD charges",
    "delivery attempts",
    "RTS policy",
    "address change",
    "lost shipments",
    "shop-n-win shipping",
    "Mega Prize Mall delivery",
    "Pakistan shipping",
    "order verification",
    "delivery responsibility",
    "pre-order shipping",
    "shipping restrictions",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Shipping Policy - Mega Prize Mall | Complete Delivery Guidelines",
    description:
      "Detailed shipping policy with delivery timelines, unboxing video requirements, tracking procedures, and Shop-n-Win eligibility.",
    type: "article",
    url: "https://megaprizemall.com/shipping-policy",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Logistics Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Shipping Policy",
      "Delivery Timeline",
      "Shipping Charges",
      "Tracking",
      "Shop-n-Win",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Shipping Policy - Mega Prize Mall",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy - Mega Prize Mall | Delivery Guidelines",
    description:
      "Complete shipping policy with timelines, tracking, and mandatory unboxing video requirements.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/shipping-policy",
    languages: {
      "en-US": "https://megaprizemall.com/shipping-policy",
      "en-GB": "https://megaprizemall.com/en-gb/shipping-policy",
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
    "article:section": "Shipping Policy",
    "article:tag": [
      "Shipping Policy",
      "Delivery Timeline",
      "Tracking",
      "Shipping Charges",
      "Courier Partners",
    ],

    // Dublin Core
    "dc.title": "Shipping Policy - Mega Prize Mall",
    "dc.description":
      "Complete shipping policy with delivery timelines and requirements",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Policy specific
    "policy:type": "Shipping and Delivery Policy",
    "policy:processing_time": "24-48 hours",
    "policy:delivery_time": "3-5 business days",
    "policy:unboxing_required": "Mandatory video",
    "policy:tracking_provided": "Yes",
    "policy:cod_available": "Subject to courier",

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
    "schema:ShippingDeliveryTime": "true",
    "schema:WebPage": "true",
  },

  // Category for SEO
  category: "shipping",

  // Authors
  authors: [
    { name: "Mega Prize Mall Logistics Team" },
    {
      name: "Shipping & Delivery Department",
      url: "https://megaprizemall.com/shipping",
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
        "@id": "https://megaprizemall.com/shipping-policy",
        url: "https://megaprizemall.com/shipping-policy",
        name: "Shipping Policy - Mega Prize Mall",
        description:
          "Complete shipping policy with delivery timelines and requirements",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/shipping-policy#breadcrumb",
        },
        inLanguage: "en-US",
        about: {
          "@type": "Thing",
          name: "Shipping and Delivery Policy",
        },
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/shipping-policy"],
          },
        ],
      },
      {
        "@type": "ShippingDeliveryTime",
        name: "Shipping Delivery Timeline",
        description: "Location-based delivery time estimates for Pakistan",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 2,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 9,
          unitCode: "DAY",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
          name: "Pakistan",
        },
        shippingSettings: {
          "@type": "ShippingRateSettings",
          shippingRate: {
            "@type": "MonetaryAmount",
            currency: "PKR",
            value: "200",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "PK",
          },
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
          contactType: "shipping support",
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
        <ShippingPolicyPage />
      </div>
    </>
  );
}
