// app/(customer)/terms-and-conditions/page.tsx
"use client";
import {
  FileText,
  Shield,
  User,
  ShoppingCart,
  CreditCard,
  Truck,
  RefreshCw,
  Gift,
  Copyright,
  AlertTriangle,
  Link as LinkIcon,
  Lock,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Home,
  BookOpen,
  Scale,
  Globe,
  Calendar,
  Clock,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/customer/Header";
import CustomerFooter from "@/components/customer/CustomerFooter";
import Link from "next/link";

interface TermSection {
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
    legal?: boolean;
    note?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    subpoints?: {
      title: string;
      content: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export default function TermsAndConditionsPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "Immediately upon publication";

  const sections: TermSection[] = [
    {
      id: "agreement-overview",
      title: "Agreement Overview & Acceptance",
      description: "Understanding and accepting our legal terms of service",
      icon: BookOpen,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Legal",
      items: [
        {
          content:
            'These Terms & Conditions ("Terms") constitute a legally binding agreement between you and Mega Prize Mall ("we", "our", "us"). By accessing or using our platform, you confirm your acceptance.',
          points: [
            "Agreement to all terms by accessing the website",
            "Legal capacity requirement: 18+ years or guardian consent",
            "Immediate effect upon website access or account creation",
            "Continuous application during platform usage",
          ],
          legal: true,
        },
        {
          title: "Scope & Jurisdiction",
          content: "Terms apply to all platform interactions:",
          points: [
            "Website browsing and content access",
            "Account creation and management",
            "Product purchases and order processing",
            "Promotional program participation",
            "Customer support interactions",
          ],
        },
      ],
    },
    {
      id: "use-of-website",
      title: "Authorized Use of Platform",
      description: "Proper usage guidelines and prohibited activities",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      schemaType: "Usage",
      items: [
        {
          title: "User Requirements",
          content: "To use Mega Prize Mall, you must:",
          points: [
            "Be at least 18 years old or have legal guardian consent",
            "Provide accurate, truthful, and complete information",
            "Maintain account security and confidentiality",
            "Use services for personal, non-commercial purposes",
          ],
        },
        {
          title: "Prohibited Activities",
          content: "Strictly prohibited actions include:",
          points: [
            "Fraud, deception, or misrepresentation",
            "Spam, unauthorized advertising, or bulk messaging",
            "Hacking attempts or unauthorized system access",
            "Illegal activities or prohibited transactions",
            "Automated scraping or data extraction",
          ],
          warning: true,
        },
        {
          content:
            "We reserve the right to refuse service, cancel orders, block accounts, or restrict access at our sole discretion.",
          warning: true,
          legal: true,
        },
      ],
    },
    {
      id: "accounts-security",
      title: "Account Management & Security",
      description: "Account responsibilities and security protocols",
      icon: User,
      color: "from-purple-500 to-pink-500",
      schemaType: "Security",
      items: [
        {
          content: "Account creation entails specific responsibilities:",
          points: [
            "Complete confidentiality of login credentials",
            "Full responsibility for all account activities",
            "Immediate notification of unauthorized access",
            "Accurate and updated personal information",
          ],
        },
        {
          title: "Security Protocols",
          content: "Enhanced security measures:",
          points: [
            "Two-factor authentication available for protection",
            "Regular security audits and monitoring",
            "Suspicious activity detection systems",
            "Secure password requirements and encryption",
          ],
        },
        {
          content:
            "Account suspension or termination may occur for policy violations, fraudulent activity, or security concerns.",
          warning: true,
        },
      ],
    },
    {
      id: "product-pricing",
      title: "Product Information & Pricing Accuracy",
      description: "Product listings, pricing, and display information",
      icon: ShoppingCart,
      color: "from-green-500 to-emerald-500",
      schemaType: "Product",
      items: [
        {
          content: "We strive for accuracy but acknowledge limitations:",
          points: [
            "Prices subject to change without prior notice",
            "Product images may vary due to photography or display",
            "Occasional errors in descriptions or availability",
            "Promotional offers may have specific conditions",
          ],
        },
        {
          title: "Pricing Guarantee & Corrections",
          content: "Our pricing integrity measures:",
          points: [
            "Price match verification upon request",
            "Error correction and customer notification",
            "Order cancellation rights for pricing errors",
            "Transparent taxation and fee calculation",
          ],
        },
        {
          content:
            "We maintain the right to correct errors and cancel orders placed with incorrect pricing or information.",
          legal: true,
        },
      ],
    },
    {
      id: "orders-payment",
      title: "Order Processing & Payment Terms",
      description: "Order confirmation, payment processing, and authorization",
      icon: CreditCard,
      color: "from-amber-500 to-orange-500",
      schemaType: "Payment",
      items: [
        {
          title: "Order Confirmation Process",
          content: "Order placement initiates this sequence:",
          points: [
            "Order submission with complete, accurate information",
            "Payment authorization and verification",
            "Inventory check and availability confirmation",
            "Shipping preparation and dispatch initiation",
          ],
        },
        {
          title: "Payment Security & Methods",
          content: "Secure payment processing ensures:",
          points: [
            "PCI-DSS compliant payment gateway integration",
            "No storage of full payment card details",
            "Multiple secure payment method options",
            "Encrypted transaction data transmission",
          ],
          note: true,
        },
        {
          title: "Order Cancellation Rights",
          content: "Orders may be cancelled due to:",
          points: [
            "Product unavailability or stock depletion",
            "Payment verification failure or suspicion",
            "Suspected fraudulent transaction patterns",
            "Pricing errors or system glitches",
          ],
          legal: true,
        },
      ],
    },
    {
      id: "shipping-delivery",
      title: "Shipping Policy & Delivery Terms",
      description: "Delivery timelines, charges, and responsibility allocation",
      icon: Truck,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Delivery",
      items: [
        {
          title: "Delivery Timeline Factors",
          content: "Delivery times depend on multiple variables:",
          points: [
            "Geographic location and accessibility",
            "Courier service capacity and schedules",
            "Inventory availability and stock location",
            "Seasonal demand and peak period volumes",
          ],
        },
        {
          title: "Delivery Responsibility Matrix",
          content: "Responsibility allocation for delivery issues:",
          points: [
            "Our responsibility: Order processing and handover",
            "Courier responsibility: Transit and final delivery",
            "Customer responsibility: Address accuracy and receipt",
            "Shared responsibility: Communication and coordination",
          ],
        },
        {
          content:
            "External factors like weather, customs clearance, or third-party delays are beyond our direct control.",
          warning: true,
          legal: true,
        },
      ],
    },
    {
      id: "returns-refunds",
      title: "Returns, Refunds & Exchange Policy",
      description: "Comprehensive return guidelines and refund processing",
      icon: RefreshCw,
      color: "from-red-500 to-rose-500",
      schemaType: "Returns",
      items: [
        {
          title: "Return Eligibility Criteria",
          content: "General return acceptance requires:",
          points: [
            "Defective, damaged, or incorrect product delivery",
            "Unused condition with original packaging intact",
            "All accessories, manuals, and components included",
            "Return request within specified timeframe",
          ],
        },
        {
          title: "Non-Returnable Categories",
          content: "Typically non-returnable items include:",
          points: [
            "Earphones and personal audio devices (hygiene)",
            "Clearance or final sale merchandise",
            "Customized or personalized products",
            "Software or digital product keys (if opened)",
          ],
          warning: true,
        },
        {
          content:
            "Complete Return & Refund Policy details available on dedicated policy page. Refunds processed to original payment method.",
          note: true,
        },
      ],
    },
    {
      id: "promotional-programs",
      title: "Promotional & Loyalty Programs",
      description: "Shop-and-Win and promotional participation terms",
      icon: Gift,
      color: "from-pink-500 to-rose-500",
      schemaType: "Promotion",
      items: [
        {
          title: "Program Participation Terms",
          content: "Promotional participation requires:",
          points: [
            "Eligible purchase confirmation and delivery",
            "Automatic entry recording for qualified orders",
            "Verified random selection methodology",
            "Identity verification for prize distribution",
          ],
        },
        {
          title: "Program Integrity Measures",
          content: "Ensuring fair participation:",
          points: [
            "Fake accounts or fraudulent orders result in disqualification",
            "Prizes non-transferable with no cash alternatives",
            "Promotional modification rights reserved",
            "Transparency in winner selection and announcement",
          ],
        },
        {
          content:
            "Winner names may be published for transparency where legally permissible.",
          legal: true,
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      description: "Content ownership, usage rights, and protection",
      icon: Copyright,
      color: "from-violet-500 to-purple-500",
      schemaType: "IP",
      items: [
        {
          content: "All Mega Prize Mall content is proprietary or licensed:",
          points: [
            "Logos, designs, and brand identity elements",
            "Product listings, descriptions, and images",
            "Website code, functionality, and interface",
            "Marketing materials and promotional content",
          ],
        },
        {
          title: "Prohibited Intellectual Property Actions",
          content: "Unauthorized activities include:",
          points: [
            "Content reproduction, distribution, or sale",
            "Reverse engineering or code decompilation",
            "Brand name or trademark misuse",
            "Derivative work creation without permission",
          ],
          legal: true,
        },
        {
          content:
            "Legal action may be pursued for intellectual property infringement.",
          warning: true,
        },
      ],
    },
    {
      id: "prohibited-activities",
      title: "Prohibited Activities & Violations",
      description: "Strictly forbidden actions and consequences",
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      schemaType: "Prohibited",
      items: [
        {
          content: "Platform misuse through these actions is prohibited:",
          points: [
            "Fraudulent transactions or deceptive practices",
            "Price manipulation or review system gaming",
            "Coupon or referral system exploitation",
            "Harmful code, virus, or bot deployment",
          ],
        },
        {
          title: "Security Violations",
          content: "System integrity violations include:",
          points: [
            "Unauthorized server or database access",
            "Vulnerability exploitation for personal gain",
            "Denial of service attacks or system overload",
            "Data scraping or unauthorized collection",
          ],
        },
        {
          content:
            "Violations may result in account termination, legal action, or reporting to authorities.",
          warning: true,
          legal: true,
        },
      ],
    },
    {
      id: "liability-limitation",
      title: "Liability Limitation & Disclaimers",
      description: "Responsibility boundaries and legal protections",
      icon: Scale,
      color: "from-gray-600 to-gray-800",
      schemaType: "Liability",
      items: [
        {
          title: "Non-Responsibility Areas",
          content: "We are not responsible for:",
          points: [
            "Third-party courier delays or failures",
            "Product misuse or improper application",
            "Temporary website downtime or glitches",
            "Unauthorized account access due to credential compromise",
          ],
        },
        {
          title: "Liability Cap",
          content: "Maximum liability is limited to:",
          points: [
            "Transaction value of specific order in question",
            "Direct damages only (excluding consequential)",
            "Amounts recoverable under applicable law",
            "Insurance coverage limitations",
          ],
          legal: true,
        },
        {
          content:
            "Liability limitations apply to maximum extent permitted by law.",
          legal: true,
        },
      ],
    },
    {
      id: "third-party-content",
      title: "Third-Party Content & Links",
      description: "External links, content, and service disclaimers",
      icon: LinkIcon,
      color: "from-cyan-500 to-teal-500",
      schemaType: "ThirdParty",
      items: [
        {
          content: "Our platform may include third-party elements:",
          points: [
            "External website links for reference",
            "Integrated payment gateway services",
            "Courier and logistics partner interfaces",
            "Analytics and marketing service integrations",
          ],
        },
        {
          title: "Third-Party Disclaimer",
          content: "We disclaim responsibility for:",
          points: [
            "Content accuracy on external websites",
            "Actions or policies of third-party services",
            "Security of external platform transactions",
            "Service availability of integrated partners",
          ],
          legal: true,
        },
        {
          content:
            "Third-party service usage is at your own risk with separate terms.",
          warning: true,
        },
      ],
    },
    {
      id: "privacy-data",
      title: "Privacy & Data Protection",
      description: "Data collection, usage, and protection practices",
      icon: Lock,
      color: "from-indigo-500 to-purple-500",
      schemaType: "Privacy",
      items: [
        {
          content: "Your privacy is protected through:",
          points: [
            "Comprehensive Privacy Policy documentation",
            "Secure data storage and transmission",
            "Limited data collection for necessary purposes",
            "Transparent data usage and sharing practices",
          ],
        },
        {
          title: "Data Protection Measures",
          content: "We implement:",
          points: [
            "Encryption for sensitive information",
            "Access controls and authentication",
            "Regular security audits and updates",
            "Compliance with data protection regulations",
          ],
        },
        {
          content:
            "Complete Privacy Policy available on dedicated page. Continued platform usage implies consent.",
          note: true,
        },
      ],
    },
    {
      id: "termination-suspension",
      title: "Termination & Account Suspension",
      description: "Account closure, suspension, and user rights",
      icon: User,
      color: "from-rose-500 to-pink-500",
      schemaType: "Termination",
      items: [
        {
          title: "Our Termination Rights",
          content: "We may suspend or terminate accounts for:",
          points: [
            "Terms of service violations",
            "Fraudulent or suspicious activities",
            "Platform harm or system abuse",
            "Legal compliance requirements",
          ],
        },
        {
          title: "User Termination Rights",
          content: "You may terminate your account by:",
          points: [
            "Using account deletion functionality",
            "Requesting closure via customer support",
            "Ceasing platform usage and access",
            "Formal written termination request",
          ],
        },
        {
          content:
            "Termination may affect pending orders, promotions, and data retention.",
          warning: true,
        },
      ],
    },
    {
      id: "terms-modification",
      title: "Terms Modification & Updates",
      description: "Policy changes, notifications, and user responsibilities",
      icon: Calendar,
      color: "from-amber-600 to-orange-600",
      schemaType: "Modification",
      items: [
        {
          content: "We reserve rights to modify these Terms:",
          points: [
            "Updates for legal or regulatory compliance",
            "Enhancements for clarity or completeness",
            "Changes reflecting service modifications",
            "Adjustments for operational improvements",
          ],
        },
        {
          title: "Update Notification Process",
          content: "Modifications communicated through:",
          points: [
            'Website posting with "Last Updated" date',
            "Email notification to registered users",
            "Platform announcements or banners",
            "Version history documentation",
          ],
        },
        {
          content:
            "Continued platform use after updates constitutes acceptance.",
          legal: true,
        },
      ],
    },
  ];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms & Conditions - Mega Prize Mall",
    description:
      "Legal terms and conditions governing Mega Prize Mall platform usage",
    url: "https://megaprizemall.com/terms-and-conditions",
    datePublished: "2024-01-01T00:00:00Z",
    dateModified: "2026-01-20T00:00:00Z",
    publisher: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    inLanguage: "en-US",
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        <Header />

        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/"
              className="text-[#7C2C78] hover:text-[#A43875] hover:underline flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">
              Terms & Conditions
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <FileText className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Terms & Conditions
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                Legal agreement governing your use of Mega Prize Mall platform,
                purchases, and promotional participation.
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
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Legal Notice */}
            <div className="mb-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-start gap-4">
                <Scale className="h-8 w-8 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ⚖️ Legal Binding Agreement
                  </h3>
                  <p className="text-gray-700 mb-3">
                    These Terms & Conditions constitute a{" "}
                    <strong>legally binding agreement</strong> between you and
                    Mega Prize Mall. By accessing our platform, you confirm
                    acceptance of all terms. Please read carefully before
                    proceeding.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-blue-200">
                    <p className="text-gray-700 font-medium">
                      If you disagree with any terms, you must discontinue
                      platform use immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📑 Quick Navigation
              </h2>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
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
                  Contact Legal
                </Link>
              </div>
            </div>

            {/* Policy Sections */}
            <div className="space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`h-12 w-12 rounded-xl bg-linear-to-r ${section.color} flex items-center justify-center`}
                    >
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
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
                            item.legal
                              ? "bg-linear-to-r from-blue-50 to-indigo-50"
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
                                ${item.legal ? "text-blue-700" : ""}`}
                              >
                                {item.title}
                              </h3>
                            )}

                            <p
                              className={`text-gray-700 leading-relaxed mb-3 
                              ${item.warning ? "font-medium" : ""}
                              ${item.important ? "font-medium" : ""}
                              ${item.legal ? "text-blue-700" : ""}
                              ${item.note ? "italic text-gray-600" : ""}`}
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
                                    ) : item.legal ? (
                                      <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                    ) : (
                                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    )}
                                    <span className="text-gray-700 leading-relaxed">
                                      {point}
                                    </span>
                                  </li>
                                ))}
                              </ul>
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
                                        <p className="text-gray-700">
                                          {subpoint.content}
                                        </p>
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
              ))}

              {/* Key Principles Summary */}
              <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-purple-600" />
                  Key Principles Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        User Responsibility
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You are responsible for account security and accurate
                      information
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Pricing Accuracy
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      We reserve rights to correct errors and cancel orders
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">
                        Delivery Limitations
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Third-party courier delays beyond our direct control
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">
                        Return Restrictions
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Certain items non-returnable for hygiene or clearance
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Copyright className="h-5 w-5 text-violet-600" />
                      <span className="font-medium text-gray-900">
                        IP Protection
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      All platform content protected by intellectual property
                      rights
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-gray-900">
                        Liability Limitation
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Maximum liability limited to transaction value
                    </p>
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
                      Legal Contact Information
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📞 Legal Inquiries & Support
                    </h3>
                    <p className="text-white/90 mb-6">
                      For legal questions, terms clarification, or formal
                      communications regarding these Terms:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Legal Email:
                            </span>
                            <Link
                              href="mailto:support@megaprizemall.com"
                              className="text-white/90 hover:text-white"
                            >
                              support@megaprizemall.com
                            </Link>
                            <p className="text-sm text-white/80 mt-1">
                              For formal legal communications
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Corporate Address:
                            </span>
                            {/* <span className="text-white/90">(Your Registered Office Address)</span> */}
                            <p className="text-sm text-white/80 mt-1">
                              For registered mail or legal notices
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Legal Support:
                            </span>
                            <span className="text-white/90">
                              +92 325 4007037
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              By appointment for legal matters
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Response Time:
                            </span>
                            <span className="text-white/90">
                              3-5 Business Days
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              For legal inquiries and formal requests
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            📋 Formal Communication Guidelines
                          </p>
                          <p className="text-sm text-white/90">
                            For legal notices or formal communications regarding
                            these Terms, please use registered mail or email
                            with delivery confirmation. Include your full name,
                            contact information, account details (if
                            applicable), and specific reference to the Terms &
                            Conditions clause in question.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acceptance Box */}
              <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="flex items-start gap-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Acceptance of Terms
                    </h3>
                    <div className="space-y-3">
                      <p className="text-lg text-gray-700">
                        By creating an account, making a purchase, or continuing
                        to browse Mega Prize Mall, you acknowledge that you
                        have:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">
                            Read these Terms & Conditions in their entirety
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">
                            Understood all terms, conditions, and limitations
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">
                            Agreed to be legally bound by all provisions
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">
                            Accepted responsibility for compliance
                          </span>
                        </li>
                      </ul>
                      <div className="mt-4 p-4 bg-white/50 rounded-lg border border-green-200">
                        <p className="font-medium text-gray-800">
                          If you do not agree with any part of these terms, you
                          must discontinue use of our services immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Need clarification or have questions about our Terms &
                    Conditions?
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
                      Contact Legal Support
                    </Button>
                    <Button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      variant="outline"
                      className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10"
                    >
                      Back to Top
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Last Updated: {lastUpdated} | Effective: {effectiveDate} |
                  Legally Binding Agreement
                </p>
              </div>
            </div>
          </div>
        </div>

        <CustomerFooter />
      </div>
    </>
  );
}
