// app/privacy/page.tsx
import PrivacyPolicyPage from "@/components/policies/Privacy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mega Prize Mall - Mobile Accessories & Prize Draws",
  description:
    "Comprehensive privacy policy for Mega Prize Mall. Learn how we protect your data, handle bargains, lucky draw entries, shopping history, and secure payments for mobile accessories.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR compliance",
    "CCPA rights",
    "personal data security",
    "mobile accessories privacy",
    "e-commerce data protection",
    "shopping privacy",
    "bargain privacy policy",
    "lucky draw privacy",
    "data collection policy",
    "cookie policy",
    "privacy rights",
    "data deletion request",
    "online shopping security",
  ].join(", "),

  // Open Graph with rich data
  openGraph: {
    title: "Privacy Policy - Mega Prize Mall | Your Data Protection Rights",
    description:
      "How we protect your data while you shop mobile accessories, use bargain features, and participate in lucky draws. Learn about your GDPR and CCPA rights.",
    type: "article",
    url: "https://megaprizemall.com/privacy",
    siteName: "Mega Prize Mall",
    authors: ["Mega Prize Mall Legal Team", "Data Protection Officer"],
    publishedTime: "2024-01-01T00:00:00Z",
    modifiedTime: "2025-12-15T00:00:00Z",
    tags: [
      "Privacy Policy",
      "Data Protection",
      "E-commerce",
      "Mobile Accessories",
      "GDPR",
      "CCPA",
    ],
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Mega Prize Mall Privacy Policy Overview",
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Mega Prize Mall - Your Data Protection Guide",
    description:
      "Your privacy matters. Learn how we handle your shopping data, lucky draw entries, and secure your information.",
    images: ["https://megaprizemall.com/logo.png"],
    creator: "@megaprizemall",
    site: "@megaprizemall",
  },

  // Canonical and alternates
  alternates: {
    canonical: "https://megaprizemall.com/privacy",
    languages: {
      "en-US": "https://megaprizemall.com/privacy",
      "en-GB": "https://megaprizemall.com/en-gb/privacy",
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

  // Verification
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
  },

  // Additional meta tags for SEO
  other: {
    // Article metadata
    "article:published_time": "2024-01-01T00:00:00Z",
    "article:modified_time": "2025-12-15T00:00:00Z",
    "article:section": "Legal Policies",
    "article:tag": [
      "Privacy Policy",
      "Data Protection",
      "Shopping Security",
      "GDPR",
      "CCPA",
    ],

    // Dublin Core
    "dc.title": "Privacy Policy - Mega Prize Mall",
    "dc.description":
      "Comprehensive data protection policy for mobile accessories shopping and prize draw platform",
    "dc.language": "en",
    "dc.publisher": "Mega Prize Mall",
    "dc.date": "2025-12-15",

    // OG additional
    "og:locale": "en_US",
    "og:locale:alternate": "en_GB",

    // Facebook
    "fb:app_id": "your-facebook-app-id",

    // Apple
    "apple-mobile-web-app-title": "Privacy Policy",

    // Mobile
    "format-detection": "telephone=no",
    "theme-color": "#7C2C78",

    // SEO enhancement
    rating: "safe for kids",
    referrer: "origin-when-cross-origin",
    "content-language": "en",
    audience: "all",
    distribution: "global",
    "revisit-after": "7 days",

    // Privacy specific
    "data-protection": "GDPR, CCPA compliant",
    "data-retention": "7 years for transactions",
    "data-controller": "Mega Prize Mall",
  },

  // Viewport (if not set in layout)
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },

  // Category for SEO
  category: "legal",

  // Expiration
  //   expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now

  // Authors
  authors: [
    { name: "Mega Prize Mall Legal Team" },
    { name: "Data Protection Officer", url: "https://megaprizemall.com/dpo" },
  ],

  // Generator
  generator: "Next.js",

  // Application name
  applicationName: "Mega Prize Mall",

  // Apple specific
  appleWebApp: {
    capable: true,
    title: "Privacy Policy",
    statusBarStyle: "black-translucent",
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },

  // Manifest
  manifest: "/site.webmanifest",

  // App Links
  appLinks: {
    ios: {
      url: "https://megaprizemall.com/privacy",
      app_store_id: "123456789",
      app_name: "Mega Prize Mall",
    },
    android: {
      package: "com.megaprizemall.app",
      app_name: "Mega Prize Mall",
    },
    web: {
      url: "https://megaprizemall.com/privacy",
      should_fallback: false,
    },
  },

  // Archive
  archives: ["https://megaprizemall.com/privacy/archive"],

  // Assets
  assets: ["https://megaprizemall.com/assets/privacy.pdf"],

  // Bookmark
  bookmarks: ["https://megaprizemall.com/privacy#bookmark"],
};

// Generate JSON-LD structured data
function generateStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://megaprizemall.com/privacy",
        url: "https://megaprizemall.com/privacy",
        name: "Privacy Policy - Mega Prize Mall",
        description:
          "Comprehensive privacy policy detailing data protection practices",
        isPartOf: {
          "@id": "https://megaprizemall.com/#website",
        },
        about: {
          "@type": "Thing",
          name: "Data Protection",
        },
        datePublished: "2024-01-01T00:00:00Z",
        dateModified: "2025-12-15T00:00:00Z",
        breadcrumb: {
          "@id": "https://megaprizemall.com/privacy#breadcrumb",
        },
        inLanguage: "en-US",
        potentialAction: [
          {
            "@type": "ReadAction",
            target: ["https://megaprizemall.com/privacy"],
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://megaprizemall.com/privacy#breadcrumb",
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
            name: "Privacy Policy",
            item: "https://megaprizemall.com/privacy",
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
          contactType: "customer service",
          email: "support@megaprizemall.com",
          availableLanguage: ["en", "es", "fr"],
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

      {/* Additional Privacy Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PrivacyPolicy",
            name: "Privacy Policy",
            description:
              "Data protection and privacy practices for Mega Prize Mall",
            datePublished: "2024-01-01",
            dateModified: "2025-12-15",
            publisher: {
              "@type": "Organization",
              name: "Mega Prize Mall",
              url: "https://megaprizemall.com",
            },
            text: "Comprehensive privacy policy covering data collection, usage, protection, and user rights.",
          }),
        }}
      />

      <div>
        <PrivacyPolicyPage />
      </div>
    </>
  );
}
