// app/faq/page.tsx
import FAQPage from "@/components/policies/FAQ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Help Center | Mega Prize Mall - Mobile Accessories Shopping",
  description:
    "Get answers to common questions about Mega Prize Mall. Learn about Shop-n-Win program, shipping, returns, payments, warranty, and more for mobile accessories shopping.",
  keywords: [
    "FAQ",
    "help center",
    "frequently asked questions",
    "Mega Prize Mall FAQ",
    "mobile accessories questions",
    "Shop-n-Win FAQ",
    "shipping questions",
    "return policy FAQ",
    "payment methods FAQ",
    "warranty questions",
    "account help",
    "order tracking",
    "delivery timeline",
    "returns process",
    "customer support",
    "shopping help",
    "e-commerce FAQ",
    "tech support",
    "vendor questions",
    "seller FAQ",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "FAQ & Help Center - Mega Prize Mall | Mobile Accessories Shopping",
    description:
      "Find answers to common questions about shopping, Shop-n-Win program, shipping, returns, and payments at Mega Prize Mall.",
    type: "website",
    url: "https://megaprizemall.com/faq",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "https://megaprizemall.com/og-faq.jpg",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall FAQ & Help Center",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "FAQ & Help Center | Mega Prize Mall - Get Answers",
    description:
      "Your questions answered about mobile accessories shopping, Shop-n-Win, shipping, and returns.",
    images: ["https://megaprizemall.com/twitter-faq.jpg"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/faq",
    languages: {
      "en-US": "https://megaprizemall.com/faq",
      "en-GB": "https://megaprizemall.com/en-gb/faq",
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
    "article:section": "Support",
    "article:tag": ["FAQ", "Help Center", "Customer Support", "Shopping Help"],

    // Dublin Core
    "dc.title": "FAQ & Help Center - Mega Prize Mall",
    "dc.description":
      "Frequently asked questions about mobile accessories shopping, shipping, returns, and promotional programs",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2026-01-20",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // FAQ specific
    "faq:count": "30+",
    "faq:categories": "8",
    "support:email": "support@megaprizemall.com",
    "support:whatsapp": "+923001234567",

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
    "schema:FAQPage": "true",
    "schema:Question": "true",
    "schema:Answer": "true",
  },

  // Category for SEO
  category: "support",

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
  manifest: "/site.webmanifest",
};

// Generate comprehensive structured data
function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://megaprizemall.com/faq",
        url: "https://megaprizemall.com/faq",
        name: "FAQ & Help Center - Mega Prize Mall",
        description:
          "Comprehensive frequently asked questions about shopping, shipping, returns, and promotional programs",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2026-01-20T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/faq#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/faq"],
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://megaprizemall.com/faq#breadcrumb",
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
            name: "FAQ & Help Center",
            item: "https://megaprizemall.com/faq",
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
          contactType: "customer support",
          email: "support@megaprizemall.com",
          telephone: "+923001234567",
          availableLanguage: ["en", "ur"],
          contactOption: "TollFree",
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
        <FAQPage />
      </div>
    </>
  );
}
