// app/(customer)/cookie-policy/page.tsx
"use client";
import {
  Cookie,
  Shield,
  Eye,
  Settings,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Globe,
  Lock,
  BarChart3,
  User,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Sparkles,
  Filter,
  ArrowUp,
  Home,
  ExternalLink,
  Clock,
  Users,
  Bell,
  Server,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/customer/Header";
import CustomerFooter from "@/components/customer/CustomerFooter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CookieType {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  examples: string[];
  essential: boolean;
  purpose: string;
  retention: string;
  schemaType?: string;
  providers?: string[];
}

interface PolicySection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  schemaType?: string;
  items: {
    title?: string;
    content: string;
    points?: string[];
    warning?: boolean;
    important?: boolean;
    note?: boolean;
    legal?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    subpoints?: {
      title: string;
      content: string;
      icon?: React.ComponentType<{ className?: string }>;
      legalBasis?: string;
    }[];
    legalBasis?: string[];
  }[];
}

export default function CookiePolicyPage() {
  const [consentDate, setConsentDate] = useState("");
  const lastUpdated = "January 20, 2026";
  const effectiveDate = "January 1, 2026";
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy - Mega Prize Mall",
    description:
      "Comprehensive cookie policy detailing cookie usage, types, management options, and data protection practices",
    url: "https://megaprizemall.com/cookie-policy",
    about: {
      "@type": "Thing",
      name: "Cookie Management and Privacy",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://megaprizemall.com/cookie-policy",
    },
  };

  const cookieTypes: CookieType[] = [
    {
      id: "essential",
      title: "Essential / Strictly Necessary Cookies",
      icon: Lock,
      color: "from-red-500 to-rose-500",
      description:
        "Mandatory cookies required for core website functionality, security, and transactional integrity. These cannot be disabled without breaking website operation.",
      examples: [
        "Session management cookies (maintain login state)",
        "Shopping cart persistence cookies",
        "Security tokens and authentication cookies",
        "Fraud prevention and bot detection cookies",
        "Payment gateway integration cookies",
        "Legal compliance and consent management cookies",
      ],
      essential: true,
      purpose: "Website operation, security, and transaction processing",
      retention: "Session or up to 24 hours",
      schemaType: "Security",
      providers: ["Mega Prize Mall Platform"],
    },
    {
      id: "performance",
      title: "Performance & Analytics Cookies",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
      description:
        "Cookies that collect anonymized data about website usage, performance metrics, and visitor behavior to improve user experience and optimize platform performance.",
      examples: [
        "Google Analytics 4 (GA4) measurement cookies",
        "Page load performance monitoring cookies",
        "User interaction and engagement tracking",
        "Error tracking and bug reporting cookies",
        "A/B testing and feature experimentation cookies",
        "Heatmap and scroll tracking cookies",
      ],
      essential: false,
      purpose: "Website optimization, performance improvement, and analytics",
      retention: "Up to 24 months",
      schemaType: "Analytics",
      providers: ["Google Analytics", "Hotjar", "Microsoft Clarity"],
    },
    {
      id: "functionality",
      title: "Functionality & Preference Cookies",
      icon: Settings,
      color: "from-green-500 to-emerald-500",
      description:
        "Cookies that remember user preferences, settings, and personalized configurations to enhance convenience and personalize the browsing experience.",
      examples: [
        "Language and regional preference cookies",
        "Currency and pricing display cookies",
        "Saved shopping cart and wishlist cookies",
        "Search history and filter preference cookies",
        "Theme and display preference cookies",
        "Notification and alert preference cookies",
      ],
      essential: false,
      purpose: "Personalization, convenience, and user preference management",
      retention: "Up to 12 months",
      schemaType: "Preferences",
      providers: ["Mega Prize Mall Platform"],
    },
    {
      id: "advertising",
      title: "Advertising & Marketing Cookies",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      description:
        "Cookies used for advertising targeting, campaign measurement, remarketing, and delivering relevant promotional content based on user interests and behavior.",
      examples: [
        "Facebook Pixel and conversion tracking cookies",
        "Google Ads and remarketing cookies",
        "Affiliate marketing and partner tracking cookies",
        "Personalized product recommendation cookies",
        "Campaign performance measurement cookies",
        "Audience segmentation and targeting cookies",
      ],
      essential: false,
      purpose: "Advertising, marketing, and promotional content delivery",
      retention: "Up to 18 months",
      schemaType: "Marketing",
      providers: ["Google Ads", "Meta Business"],
    },
  ];

  const sections: PolicySection[] = [
    {
      id: "cookie-overview",
      title: "Cookie Overview & Definition",
      description:
        "Comprehensive explanation of cookies and their technological purpose",
      icon: Cookie,
      color: "from-amber-500 to-orange-500",
      schemaType: "Overview",
      items: [
        {
          content:
            "Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit websites. They serve as digital memory for websites, enabling them to recognize your device, remember your preferences, and provide enhanced functionality.",
          points: [
            "Text files typically 4KB or less in size",
            "Stored in your web browser directory",
            "Contain anonymized identifiers and preference data",
            "Can be first-party (our domain) or third-party (other domains)",
            "Have specific lifespans (session or persistent)",
            "Are essential for modern web functionality",
          ],
          legalBasis: [
            "EU ePrivacy Directive",
            "GDPR Article 5",
            "California Consumer Privacy Act",
          ],
        },
        {
          title: "Technical Security Assurance",
          content: "Important security facts about cookies:",
          points: [
            "Cookies cannot execute code or install malware",
            "Cookies do not store sensitive financial information",
            "Cookies cannot access personal files on your device",
            "Each cookie is domain-specific and sandboxed",
            "Cookies transmitted only over secure HTTPS connections",
            "Regular security audits ensure cookie safety",
          ],
          note: true,
        },
        {
          content:
            "By accessing and using Mega Prize Mall, you acknowledge receipt of this Cookie Policy and consent to cookie usage as described herein, subject to your browser settings.",
          legal: true,
        },
      ],
    },
    {
      id: "detailed-cookie-types",
      title: "Detailed Cookie Types & Purposes",
      description:
        "Comprehensive breakdown of cookie categories and their specific functions",
      icon: Filter,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Classification",
      items: [
        {
          content:
            "We categorize cookies based on functionality, purpose, and necessity. Each category serves specific, transparent purposes aligned with legitimate business interests.",
        },
      ],
    },
    {
      id: "third-party-cookies",
      title: "Third-Party Cookies & External Providers",
      description:
        "Information about external service providers and their cookie implementations",
      icon: Globe,
      color: "from-cyan-500 to-teal-500",
      schemaType: "ThirdParty",
      items: [
        {
          content:
            "We integrate with trusted third-party service providers who may place cookies on our platform. These providers support essential services and analytics:",
          subpoints: [
            {
              title: "Analytics Providers",
              content:
                "Google Analytics 4, Microsoft Clarity - Website performance and user behavior analytics",
              icon: BarChart3,
              legalBasis: "Legitimate Interest (Performance Optimization)",
            },
            {
              title: "Advertising Platforms",
              content:
                "Google Ads, Meta Business Suite - Targeted advertising and campaign measurement",
              icon: Target,
              legalBasis: "Consent-Based Marketing",
            },
            {
              title: "Payment Processors",
              content: "SafePay - Secure transaction processing",
              icon: CreditCard,
              legalBasis: "Contractual Necessity",
            },
            {
              title: "Social Media",
              content:
                "Facebook, Instagram - Social sharing and integration features",
              icon: Users,
              legalBasis: "Consent-Based Integration",
            },
          ],
        },
        {
          title: "⚠️ Third-Party Disclaimer",
          content: "Important limitations regarding third-party cookies:",
          points: [
            "We do not control third-party cookie practices",
            "Third-party cookies are governed by their own privacy policies",
            "You accept third-party cookies by using integrated features",
            "Third-party cookie management requires separate opt-out procedures",
            "We conduct due diligence on all third-party providers",
          ],
          warning: true,
          legalBasis: [
            "Third-Party Service Agreements",
            "Data Processing Agreements",
          ],
        },
        {
          content:
            "Links to third-party cookie policies are provided in our Privacy Policy for transparency.",
          note: true,
        },
      ],
    },
    {
      id: "purpose-benefits",
      title: "Purpose & Benefits of Cookie Usage",
      description:
        "Legitimate purposes and user benefits derived from cookie implementation",
      icon: Eye,
      color: "from-green-600 to-emerald-600",
      schemaType: "Purpose",
      items: [
        {
          content:
            "Our cookie usage serves legitimate business purposes while providing tangible benefits to users:",
          subpoints: [
            {
              title: "Security & Fraud Prevention",
              content:
                "Protect accounts, prevent unauthorized access, and detect fraudulent activities",
              icon: Shield,
              legalBasis: "Legal Obligation & Legitimate Interest",
            },
            {
              title: "Enhanced User Experience",
              content:
                "Remember preferences, maintain sessions, and personalize interactions",
              icon: User,
              legalBasis: "User Convenience & Legitimate Interest",
            },
            {
              title: "Performance Optimization",
              content:
                "Monitor website performance, identify issues, and optimize loading speeds",
              icon: Server,
              legalBasis: "Legitimate Interest (Performance)",
            },
            {
              title: "Transactional Integrity",
              content:
                "Ensure secure payments, maintain shopping carts, and validate transactions",
              icon: ShoppingCart,
              legalBasis: "Contractual Necessity",
            },
            {
              title: "Marketing Effectiveness",
              content:
                "Deliver relevant promotions, measure campaign success, and reduce irrelevant ads",
              icon: Bell,
              legalBasis: "Consent-Based Marketing",
            },
          ],
        },
        {
          content:
            "All cookie usage aligns with data protection principles of purpose limitation, data minimization, and storage limitation.",
          note: true,
        },
      ],
    },
    {
      id: "cookie-management",
      title: "Cookie Management & Control Options",
      description:
        "Comprehensive guide to managing, controlling, and disabling cookies",
      icon: Settings,
      color: "from-gray-600 to-gray-800",
      schemaType: "Control",
      items: [
        {
          content:
            "You maintain complete control over cookie acceptance through multiple management options:",
          points: [
            "Browser Settings: Granular cookie control in all major browsers",
            "Cookie Consent Manager: Our built-in cookie preference center",
            "Private Browsing: Automatic cookie deletion after session",
            "Browser Extensions: Third-party cookie management tools",
            "Device Settings: Operating system-level privacy controls",
            "Regular Clearing: Manual cookie deletion procedures",
          ],
        },
        {
          title: "⚠️ Critical Functional Impact",
          content:
            "Disabling essential cookies will break these core functionalities:",
          points: [
            "Account authentication and session management",
            "Shopping cart persistence and checkout processing",
            "Payment gateway integration and transaction security",
            "Shop & Win eligibility verification and validation",
            "Order placement, tracking, and management",
            "Personalized recommendations and saved preferences",
          ],
          warning: true,
          legalBasis: ["Technical Necessity", "Contractual Requirements"],
        },
        {
          content:
            "If you choose to disable non-essential cookies, you may opt-out through our Cookie Preference Center while maintaining website functionality.",
          note: true,
        },
      ],
    },
    {
      id: "shop-win-impact",
      title: "Cookies & Shop & Win System Integration",
      description:
        "Critical relationship between cookies and promotional program eligibility",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      schemaType: "Promotion",
      items: [
        {
          content:
            "Cookies play an essential role in our Shop & Win promotional system integrity:",
          points: [
            "Unique entry verification and anti-fraud protection",
            "Session validation for legitimate user participation",
            "Duplicate entry prevention and fairness enforcement",
            "Eligibility criteria verification and compliance monitoring",
            "Prize distribution and winner validation mechanisms",
            "System abuse detection and prevention protocols",
          ],
          legalBasis: ["Promotional Terms & Conditions", "Anti-Fraud Measures"],
        },
        {
          title: "⚠️ System Security Protocols",
          content:
            "Cookie manipulation or disabling triggers these security responses:",
          points: [
            "Automatic entry invalidation and disqualification",
            "Suspicious activity flagging and account review",
            "Fraud prevention measures and system blocking",
            "Manual verification requirements for participation",
            "Temporary or permanent contest eligibility restrictions",
            "Legal and compliance reporting obligations",
          ],
          warning: true,
        },
        {
          content:
            "These measures ensure promotional integrity, prevent system abuse, and maintain fairness for all legitimate participants.",
          note: true,
        },
      ],
    },
    {
      id: "data-security-retention",
      title: "Data Security & Retention Policies",
      description:
        "Security measures and data retention periods for cookie data",
      icon: Shield,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Security",
      items: [
        {
          content:
            "All cookie data is protected with industry-standard security measures:",
          points: [
            "End-to-end HTTPS/TLS encryption for all data transmission",
            "Secure cookie attributes (HttpOnly, Secure, SameSite)",
            "Regular security audits and penetration testing",
            "Data minimization and purpose limitation principles",
            "Strict access controls and authentication requirements",
            "Compliance with global data protection standards",
          ],
          legalBasis: ["GDPR Article 32", "Security Best Practices"],
        },
        {
          title: "Cookie Data Retention Periods",
          content: "Cookie data is retained only as long as necessary:",
          points: [
            "Session cookies: Automatically deleted when browser closes",
            "Authentication cookies: Maximum 30 days for convenience",
            "Analytics cookies: Up to 24 months for trend analysis",
            "Preference cookies: Up to 12 months for personalization",
            "Marketing cookies: Up to 18 months for campaign analysis",
            "Compliance cookies: As required by legal obligations",
          ],
          legalBasis: ["Storage Limitation Principle", "Legal Requirements"],
        },
        {
          content:
            "We conduct regular data retention reviews and implement automated deletion procedures for expired cookie data.",
          note: true,
        },
      ],
    },
    {
      id: "policy-updates",
      title: "Policy Updates & User Notification",
      description: "Procedures for policy modifications and user communication",
      icon: AlertTriangle,
      color: "from-amber-600 to-orange-600",
      schemaType: "Updates",
      items: [
        {
          content:
            "Cookie policy modification procedures and user notification protocols:",
          points: [
            "Policy reviews conducted quarterly or as needed",
            "Updates effective immediately upon publication",
            "Version control and change log maintenance",
            "Major changes announced via website notifications",
            "Archive of previous policy versions available",
            'Updated "Last Modified" date displayed prominently',
          ],
          legalBasis: ["Transparency Requirements", "Policy Management"],
        },
        {
          content:
            "Continued use of our platform after policy updates constitutes acceptance of modified terms. Users are responsible for reviewing updated policies periodically.",
          legal: true,
        },
        {
          title: "Consent Renewal Requirements",
          content: "Consent renewal may be required for:",
          points: [
            "Significant changes to cookie categories or purposes",
            "New third-party provider integrations",
            "Extended data retention periods",
            "Substantial changes to data processing practices",
            "Legal or regulatory requirement updates",
          ],
          note: true,
        },
      ],
    },
  ];

  const browserGuides = [
    {
      browser: "Google Chrome",
      icon: Globe2,
      steps: [
        "Click ⋮ menu → Settings",
        "Privacy and security → Cookies",
        "Adjust cookie settings",
      ],
      url: "https://support.google.com/chrome/answer/95647",
    },
    {
      browser: "Mozilla Firefox",
      icon: Globe2,
      steps: [
        "Click ☰ menu → Settings",
        "Privacy & Security → Cookies",
        "Choose cookie preferences",
      ],
      url: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop",
    },
    {
      browser: "Apple Safari",
      icon: Globe2,
      steps: [
        "Safari → Preferences",
        "Privacy tab → Cookies",
        "Select cookie options",
      ],
      url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac",
    },
    {
      browser: "Microsoft Edge",
      icon: Globe2,
      steps: [
        "Click … menu → Settings",
        "Cookies and permissions",
        "Manage cookie settings",
      ],
      url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
    },
    {
      browser: "Mobile Devices",
      icon: Smartphone,
      steps: [
        "Browser settings",
        "Privacy/Security section",
        "Adjust cookie preferences",
      ],
      url: "https://megaprizemall.com/help/mobile-cookies",
    },
  ];

  // const cookieLifespan = [
  //   {
  //     type: "Session Cookies",
  //     duration: "Browser session",
  //     purpose: "Temporary functionality",
  //     deletable: "Automatic",
  //   },
  //   {
  //     type: "Authentication",
  //     duration: "30 days",
  //     purpose: "Login persistence",
  //     deletable: "Manual/Auto",
  //   },
  //   {
  //     type: "Analytics",
  //     duration: "24 months",
  //     purpose: "Performance tracking",
  //     deletable: "Manual",
  //   },
  //   {
  //     type: "Preferences",
  //     duration: "12 months",
  //     purpose: "User settings",
  //     deletable: "Manual",
  //   },
  //   {
  //     type: "Advertising",
  //     duration: "18 months",
  //     purpose: "Marketing optimization",
  //     deletable: "Manual",
  //   },
  // ];

  // Add structured data to page
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // FAQ Schema for common cookie questions
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What happens if I disable cookies?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Disabling cookies will break essential website functionality including checkout, login, and Shop & Win eligibility. Some features may not work correctly.",
          },
        },
        {
          "@type": "Question",
          name: "Are cookies safe and secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, cookies are text files that cannot execute code or install malware. We implement security measures including HTTPS encryption and secure cookie attributes.",
          },
        },
        {
          "@type": "Question",
          name: "How long do cookies stay on my device?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cookie durations vary: session cookies delete when you close your browser, while persistent cookies can last from 30 days to 24 months depending on their purpose.",
          },
        },
      ],
    };

    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.text = JSON.stringify(faqData);
    document.head.appendChild(faqScript);

    // Breadcrumb structured data
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
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
    };

    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.text = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

    // Set consent date
    setTimeout(() => {
      setConsentDate(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 0);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(faqScript);
      document.head.removeChild(breadcrumbScript);
    };
  }, []);

  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div
        className="min-h-screen bg-linear-to-b from-gray-50 to-white"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        <Header />

        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-[#7C2C78] hover:text-[#A43875]"
                >
                  <Home className="h-4 w-4 mr-1 inline" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">
                  Cookie Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <header className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center">
              <div
                className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6"
                role="img"
                aria-label="Cookie Policy Icon"
              >
                <Cookie className="h-8 w-8" />
              </div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                itemProp="headline"
              >
                Cookie Policy & Tracking Technologies
              </h1>
              <p
                className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto"
                itemProp="description"
              >
                Comprehensive information about cookies, tracking technologies,
                data collection practices, and your control options on Mega
                Prize Mall.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="ml-2 font-semibold">{lastUpdated}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Effective:</span>
                  <span className="ml-2 font-semibold">{effectiveDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Consent & Warning Banner */}
            <div
              className="mb-8 p-6 bg-linear-to-r from-amber-50 via-orange-50 to-red-50 rounded-2xl border-2 border-amber-300"
              role="alert"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🍪 Consent Notice & Important Information
                  </h3>
                  <p className="text-gray-700 mb-3">
                    By accessing and using Mega Prize Mall, you acknowledge
                    receipt of this Cookie Policy and consent to cookie usage as
                    described herein. Essential cookies are required for website
                    functionality. Disabling them will break core features
                    including checkout, login, and Shop & Win eligibility.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-amber-200">
                    <p className="text-gray-700 font-medium">
                      Your consent date: {consentDate} | Cookie preferences can
                      be managed anytime through browser settings or our Cookie
                      Preference Center.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cookie Types Detailed Grid */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Detailed Cookie Categories & Purposes
                  </h2>
                  <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cookieTypes.map((cookieType) => (
                  <div
                    key={cookieType.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                    itemScope
                    itemType={`https://schema.org/${
                      cookieType.schemaType || "Thing"
                    }`}
                  >
                    <div
                      className={`h-2 bg-linear-to-r ${cookieType.color}`}
                    ></div>
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`h-12 w-12 rounded-lg bg-linear-to-r ${cookieType.color} flex items-center justify-center`}
                        >
                          <cookieType.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-semibold text-gray-900"
                            itemProp="name"
                          >
                            {cookieType.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                cookieType.essential
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {cookieType.essential
                                ? "🔐 Essential - Required"
                                : "⚙️ Optional - Can Disable"}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Retention: {cookieType.retention}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4" itemProp="description">
                        {cookieType.description}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            🎯 Primary Purpose:
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {cookieType.purpose}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            📋 Common Examples:
                          </h4>
                          <ul className="space-y-2">
                            {cookieType.examples.map((example, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                {cookieType.essential ? (
                                  <Lock className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                ) : (
                                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                                )}
                                <span className="text-sm text-gray-600">
                                  {example}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {cookieType.providers && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              🏢 Service Providers:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {cookieType.providers.map((provider, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {provider}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cookie Lifespan Table */}
            {/* <div className="mb-12 bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📅 Cookie Lifespan & Retention Periods
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Cookie Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Primary Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Deletion Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cookieLifespan.map((cookie, idx) => (
                      <tr key={idx} className="hover:bg-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Cookie className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {cookie.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">
                              {cookie.duration}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {cookie.purpose}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cookie.deletable === "Automatic"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {cookie.deletable}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* Browser Management Guide */}
            <div className="mb-12 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                ⚙️ Browser-Specific Cookie Management Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {browserGuides.map((browser, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-green-200 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <browser.icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {browser.browser}
                        </h4>
                        <Link
                          href={browser.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                        >
                          Official Guide
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                    <ol className="space-y-2">
                      {browser.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">
                            {stepIdx + 1}
                          </div>
                          <span className="text-sm text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      ⚠️ Critical Impact Warning
                    </p>
                    <p className="text-sm text-gray-700">
                      Disabling essential cookies will break website
                      functionality including checkout, login, Shop & Win
                      eligibility, and payment processing. Only disable
                      non-essential cookies through our Cookie Preference
                      Center.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <nav
              aria-label="Policy Navigation"
              className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Navigation
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                    aria-label={`Jump to ${section.title}`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </Link>
                ))}
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C2C78] text-white hover:bg-[#A43875] rounded-full text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
              </div>
            </nav>

            {/* Policy Sections */}
            <div className="space-y-12">
              {sections.slice(2).map(
                (
                  section // Skip first two sections
                ) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24"
                    itemScope
                    itemType={`https://schema.org/${
                      section.schemaType || "Article"
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`h-12 w-12 rounded-xl bg-linear-to-r ${section.color} flex items-center justify-center`}
                      >
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2
                          className="text-2xl md:text-3xl font-bold text-gray-900"
                          itemProp="name"
                        >
                          {section.title}
                        </h2>
                        <p
                          className="text-gray-600 mt-1"
                          itemProp="description"
                        >
                          {section.description}
                        </p>
                        <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      {section.items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-6 ${
                            idx !== section.items.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          } 
                          ${
                            item.warning
                              ? "bg-linear-to-r from-red-50 to-orange-50"
                              : ""
                          }
                          ${
                            item.important
                              ? "bg-linear-to-r from-amber-50 to-orange-50"
                              : ""
                          }
                          ${
                            item.note
                              ? "bg-linear-to-r from-blue-50 to-cyan-50"
                              : ""
                          }
                          ${
                            item.legal
                              ? "bg-linear-to-r from-gray-50 to-gray-100"
                              : ""
                          }`}
                        >
                          <div className="flex gap-4">
                            {item.icon && (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <item.icon className="h-5 w-5 text-[#7C2C78]" />
                              </div>
                            )}
                            <div className="flex-1">
                              {item.title && (
                                <h3
                                  className={`text-lg font-semibold text-gray-900 mb-2 
                                ${item.warning ? "text-red-700" : ""}
                                ${item.important ? "text-amber-700" : ""}
                                ${item.legal ? "text-gray-700" : ""}`}
                                >
                                  {item.title}
                                </h3>
                              )}

                              <p
                                className={`text-gray-700 leading-relaxed mb-3 
                              ${item.warning ? "font-medium text-red-700" : ""}
                              ${
                                item.important
                                  ? "font-medium text-amber-700"
                                  : ""
                              }
                              ${item.legal ? "font-medium text-gray-700" : ""}`}
                              >
                                {item.content}
                              </p>

                              {item.points && (
                                <ul className="space-y-2 mt-3">
                                  {item.points.map((point, pointIdx) => (
                                    <li
                                      key={pointIdx}
                                      className="flex items-start gap-3"
                                    >
                                      {item.warning ? (
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                      ) : item.important ? (
                                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                      ) : item.legal ? (
                                        <Shield className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                                      ) : (
                                        <div className="h-2 w-2 rounded-full bg-[#7C2C78] mt-2 shrink-0"></div>
                                      )}
                                      <span className="text-gray-700 leading-relaxed">
                                        {point}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {item.legalBasis && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-start gap-2">
                                    <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-blue-800 mb-1">
                                        Legal Basis & Compliance:
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {item.legalBasis.join(", ")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.subpoints && (
                                <div className="space-y-4 mt-4">
                                  {item.subpoints.map((subpoint, subIdx) => (
                                    <div
                                      key={subIdx}
                                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                    >
                                      <div className="flex items-start gap-3">
                                        {subpoint.icon && (
                                          <div className="h-10 w-10 rounded-lg bg-[#7C2C78]/10 flex items-center justify-center shrink-0">
                                            <subpoint.icon className="h-5 w-5 text-[#7C2C78]" />
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 mb-1">
                                            {subpoint.title}
                                          </h4>
                                          <p className="text-gray-700 mb-2">
                                            {subpoint.content}
                                          </p>
                                          {subpoint.legalBasis && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                              {subpoint.legalBasis}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              )}

              {/* Impact Summary */}
              <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📊 Cookie Impact & Functionality Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      With All Cookies Enabled
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          Full website functionality and performance
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          Secure checkout and payment processing
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          Shop & Win eligibility and participation
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          Personalized recommendations and preferences
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-700">
                          Enhanced security and fraud protection
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      With Essential Cookies Disabled
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">
                          Checkout and payment processing failures
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">
                          Login authentication and session issues
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">
                          Shop & Win entry invalidation
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">
                          Shopping cart and preference loss
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">
                          Reduced security and increased fraud risk
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Cookie Policy Support & Contact
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📧 Technical & Policy Support
                    </h3>
                    <p className="text-white/90 mb-6">
                      For questions about cookie usage, technical issues,
                      privacy concerns, or policy clarification:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Email Support:
                            </span>
                            <Link
                              href="mailto:support@megaprizemall.com"
                              className="text-white/90 hover:text-white"
                            >
                              support@megaprizemall.com
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Privacy Portal:
                            </span>
                            <Link
                              href="https://megaprizemall.com/privacy-policy"
                              className="text-white/90 hover:text-white"
                            >
                              megaprizemall.com/privacy-policy
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Settings className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Cookie Preference Center:
                            </span>
                            <span className="text-white/90">
                              Access via website footer or account settings
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Data Protection Officer:
                            </span>
                            <Link
                              href="mailto:support@megaprizemall.com"
                              className="text-white/90 hover:text-white"
                            >
                              support@megaprizemall.com
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            🔧 Technical Support Note
                          </p>
                          <p className="text-sm text-white/90">
                            If experiencing website functionality issues after
                            changing cookie settings, please clear browser cache
                            and cookies, then re-enable essential cookies. For
                            persistent issues, contact support with browser and
                            device details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Need help managing cookie preferences or have questions
                    about cookie usage?
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() =>
                        document
                          .getElementById("contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-[#7C2C78] hover:bg-[#A43875] text-white px-8"
                    >
                      Contact Cookie Support
                    </Button>
                    <Button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      variant="outline"
                      className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Back to Top
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Last Updated: {lastUpdated} | Effective: {effectiveDate} |
                  Your Consent Date: {consentDate}
                </p>
              </div>
            </div>
          </div>
        </main>

        <CustomerFooter />
      </div>
    </>
  );
}
