// app/shop-n-win-contest/page.tsx
import ShopNWinContestPage from "@/components/policies/ShopNWinContestPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Shop-n-Win Contest Rules | Mega Prize Mall - Official Promotional Program Terms",
  description:
    "Complete official rules for Mega Prize Mall's Shop-n-Win Contest. Learn about eligibility, participation, winner selection, prize distribution, and important legal terms.",
  keywords: [
    "Shop-n-Win contest rules",
    "promotional contest terms",
    "contest eligibility",
    "contest participation",
    "winner selection",
    "prize distribution",
    "contest legal terms",
    "shopping contest",
    "promotional program",
    "contest FAQ",
    "contest returns policy",
    "contest disclaimer",
    "contest verification",
    "contest support",
    "Mega Prize Mall contest",
    "mobile accessories contest",
    "shopping rewards contest",
    "contest legal classification",
    "no gambling contest",
    "free entry contest",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title:
      "Shop-n-Win Contest Official Rules - Mega Prize Mall | Promotional Program",
    description:
      "Complete rules and terms for participating in Mega Prize Mall's Shop-n-Win Contest. Learn how to win prizes with your purchases.",
    type: "article",
    url: "https://megaprizemall.com/shop-n-win-contest",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Contest Team"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2026-01-20T00:00:00Z",
    tags: [
      "Contest Rules",
      "Promotional Program",
      "Shop-n-Win",
      "Contest Terms",
      "Prize Contest",
    ],
    images: [
      {
        url: "https://megaprizemall.com/og-shop-n-win-contest.jpg",
        width: 1200,
        height: 630,
        alt: "Shop-n-Win Contest Official Rules - Mega Prize Mall",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Shop-n-Win Contest Rules | Mega Prize Mall - Official Terms",
    description:
      "Official rules and terms for Mega Prize Mall's promotional Shop-n-Win Contest. Learn how to participate and win.",
    images: ["https://megaprizemall.com/twitter-shop-n-win-contest.jpg"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/shop-n-win-contest",
    languages: {
      "en-US": "https://megaprizemall.com/shop-n-win-contest",
      "en-GB": "https://megaprizemall.com/en-gb/shop-n-win-contest",
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
    "article:section": "Contest Rules",
    "article:tag": [
      "Contest Rules",
      "Promotional Program",
      "Shop-n-Win",
      "Legal Terms",
      "Prize Contest",
    ],

    // Dublin Core
    "dc.title": "Shop-n-Win Contest Rules - Mega Prize Mall",
    "dc.description":
      "Official rules and terms for promotional shopping contest participation",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Contest specific
    "contest:type": "Promotional Shopping Contest",
    "contest:eligibility": "Purchase Required",
    "contest:entry": "Free with Purchase",
    "contest:frequency": "Weekly, Monthly, Special",
    "contest:prizes": "Electronics, Vouchers, Cash",

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
    "schema:Event": "true",
    "schema:Contest": "true",
  },

  // Category for SEO
  category: "contest",

  // Authors
  authors: [
    { name: "Mega Prize Mall Contest Team" },
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
        "@id": "https://megaprizemall.com/shop-n-win-contest",
        url: "https://megaprizemall.com/shop-n-win-contest",
        name: "Shop-n-Win Contest Rules - Mega Prize Mall",
        description:
          "Official rules and terms for promotional shopping contest",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/shop-n-win-contest#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/shop-n-win-contest"],
          },
        ],
      },
      {
        "@type": "Event",
        name: "Shop-n-Win Contest - Mega Prize Mall",
        description: "Promotional shopping contest with prize awards",
        startDate: "2024-01-01",
        endDate: "2026-12-31",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "VirtualLocation",
          url: "https://megaprizemall.com",
        },
        organizer: {
          "@type": "Organization",
          name: "Mega Prize Mall",
          url: "https://megaprizemall.com",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "PKR",
          availability: "https://schema.org/InStock",
          validFrom: "2024-01-01",
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
          contactType: "contest support",
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
        <ShopNWinContestPage />
      </div>
    </>
  );
}
