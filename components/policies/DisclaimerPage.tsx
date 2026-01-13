// app/(customer)/disclaimer/page.tsx
"use client";
import {
  AlertTriangle,
  Shield,
  Ban,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Globe,
  RefreshCw,
  Scale,
  Gavel,
  WifiOff,
  Tag,
  AlertOctagon,
  Sparkles,
  ArrowUp,
  Home,
  ExternalLink,
  BookOpen,
  Users,
  Building,
  MapPin,
  Mail,
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
import { useEffect } from "react";
import Link from "next/link";

interface DisclaimerSection {
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
    critical?: boolean;
    note?: boolean;
    legal?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    subpoints?: {
      title: string;
      content: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
    legalReferences?: string[];
  }[];
}

export default function DisclaimerPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "January 1, 2026";
  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "Legal Disclaimer - Mega Prize Mall",
    description:
      "Comprehensive legal disclaimer, terms, and limitations for Mega Prize Mall e-commerce platform",
    url: "https://megaprizemall.com/disclaimer",
    provider: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    termsOfService: "https://megaprizemall.com/disclaimer",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://megaprizemall.com/disclaimer",
    },
  };

  const sections: DisclaimerSection[] = [
    {
      id: "financial-gambling-disclaimer",
      title: "No Financial Advice, No Gambling, No Lottery Disclaimer",
      description:
        "Legal clarification regarding financial services, gambling, and lottery activities",
      icon: Ban,
      color: "from-red-500 to-rose-500",
      schemaType: "FinancialProduct",
      items: [
        {
          content:
            "Mega Prize Mall operates exclusively as an e-commerce marketplace. We explicitly DO NOT operate, promote, or participate in any of the following regulated activities:",
          points: [
            "Lotteries, raffles, or any form of chance-based prize schemes (Regulated under State Lotteries Act)",
            "Gambling, betting, or wagering activities (Regulated under Prevention of Gambling Act)",
            "Financial investment schemes or securities offerings (Regulated under SECP regulations)",
            "Prize competitions requiring payment or consideration for participation",
            "Binary options, forex trading, or cryptocurrency trading platforms",
            "Pyramid schemes or multi-level marketing programs",
          ],
          legalReferences: [
            "State Lotteries Act",
            "Prevention of Gambling Act",
            "SECP Regulations",
          ],
        },
        {
          title: "Shop & Win Feature Legal Clarification",
          content:
            "Our promotional feature operates under specific legal parameters:",
          points: [
            "Shop & Win is a free promotional benefit tied to completed purchases",
            "Participation requires NO additional payment or consideration",
            "No purchase guarantees any reward - prizes are promotional and optional",
            'Program operates under "Prize Competition" exemptions in applicable laws',
            "All promotional activities are transparent and disclosed in advance",
          ],
          note: true,
        },
        {
          content:
            "We do not offer investment advice, financial services, or guaranteed returns. All promotional activities are optional and non-binding.",
          warning: true,
          legal: true,
        },
      ],
    },
    {
      id: "shop-win-fair-use",
      title: "Shop & Win Fair-Use & Eligibility Disclaimer",
      description:
        "Terms governing promotional participation and eligibility requirements",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      schemaType: "Promotion",
      items: [
        {
          content:
            'Participation in "Shop & Win" promotional programs is automatically triggered upon eligible purchase completion, subject to strict limitations:',
          points: [
            "Purchase completion does NOT guarantee winning - winners selected randomly",
            "Prize availability limited to predefined quantities and timeframes",
            "Selection conducted using transparent, verifiable randomization methods",
            "All prize distribution decisions are final, binding, and non-negotiable",
            "Program subject to availability and may be modified or discontinued",
          ],
        },
        {
          title: "Critical Return Policy Impact (Zero Tolerance)",
          content:
            "Return or refund of purchased product results in immediate promotional disqualification:",
          points: [
            "Shop & Win entry automatically voided upon return initiation",
            "All prize eligibility becomes immediately and irrevocably invalid",
            "Previously assigned prizes (if any) become null and void",
            "No appeals, exceptions, or reconsiderations permitted",
            "Replacement products do not restore promotional eligibility",
          ],
          critical: true,
          legalReferences: [
            "Consumer Protection Act",
            "Contract Law Principles",
          ],
        },
        {
          content:
            "These strict provisions protect promotional system integrity and prevent exploitation, ensuring fairness for all legitimate participants.",
          warning: true,
        },
      ],
    },
    {
      id: "user-liability-disclaimer",
      title: "User Responsibility & Liability Disclaimer",
      description:
        "Limitations of liability and user responsibility statements",
      icon: Shield,
      color: "from-gray-600 to-gray-800",
      schemaType: "Liability",
      items: [
        {
          content:
            "You access and use Mega Prize Mall services entirely at your own risk. We assume NO responsibility for:",
          points: [
            "Product misuse, modification, or improper usage contrary to specifications",
            "Failure to read or understand product descriptions, specifications, or warnings",
            "Damages resulting from unauthorized modifications or third-party services",
            "Incorrect, incomplete, or inaccurate delivery information provided by users",
            "Losses from shipping delays, courier errors, or logistic partner issues",
            "Technical failures, network disruptions, or device compatibility problems",
            "Payment gateway failures, transaction errors, or banking system issues",
            "Personal data loss from device failures or user negligence",
            "Unauthorized account access resulting from credential compromise",
          ],
        },
        {
          content:
            "We provide the e-commerce platform and facilitate product transactions. Ultimate responsibility for purchase decisions, usage, and consequences rests solely with you.",
          legal: true,
          legalReferences: ["Contract Law", "Consumer Protection Guidelines"],
        },
      ],
    },
    {
      id: "product-information",
      title: "Product Information Accuracy Disclaimer",
      description:
        "Disclaimers regarding product specifications, descriptions, and representations",
      icon: AlertCircle,
      color: "from-amber-500 to-orange-500",
      schemaType: "Product",
      items: [
        {
          content:
            "While we strive for maximum accuracy, product information may contain variations:",
          points: [
            "Display colors may differ due to monitor calibration and screen technology",
            "Specifications subject to manufacturer updates without prior notification",
            "Pricing, availability, and promotions subject to change without notice",
            "Minor errors, omissions, or inaccuracies may occasionally occur",
            "Product images are for representation only - actual product may vary",
            "Accessories shown may be optional or sold separately",
          ],
        },
        {
          content:
            "We reserve unilateral rights to correct errors, including after order placement, and to adjust product information as necessary.",
          warning: true,
        },
        {
          title: "Third-Party Product Content",
          content: "For products sold by third-party vendors:",
          points: [
            "Product descriptions provided by vendors - we verify but do not guarantee",
            "Vendor representations are their responsibility, not ours",
            "We facilitate transactions but do not manufacture or certify products",
            "Vendor disputes handled according to vendor agreements",
          ],
          note: true,
        },
      ],
    },
    {
      id: "third-party-services",
      title: "Third-Party Services & Integration Disclaimer",
      description:
        "Limitations regarding external service providers and integrations",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      schemaType: "Service",
      items: [
        {
          content:
            "Our platform integrates with various third-party service providers including:",
          points: [
            "Payment processors and financial service providers (Stripe, PayPal, banks)",
            "Logistics and courier service partners (Trax)",
            "Communication platforms (WhatsApp, email services, SMS providers)",
            "Analytics, marketing, and advertising platforms (Google, Meta)",
            "Hosting, security, and infrastructure providers (AWS, Cloudflare)",
            "Social media platforms and integration services",
          ],
        },
        {
          content:
            "We do not own, control, or assume liability for third-party services:",
          points: [
            "Service outages, downtime, or performance issues",
            "Security breaches, data leaks, or privacy violations",
            "Service modifications, term changes, or discontinuation",
            "Errors, inaccuracies, or misinformation",
            "Compliance with local laws and regulations",
          ],
          legalReferences: [
            "Third-Party Service Agreements",
            "Data Protection Laws",
          ],
        },
        {
          content:
            "Use of all third-party services through our platform is at your own discretion and risk.",
          legal: true,
        },
      ],
    },
    {
      id: "technical-disruptions",
      title: "Technical Issues & Service Availability Disclaimer",
      description:
        "Disclaimers regarding platform availability and technical reliability",
      icon: WifiOff,
      color: "from-indigo-500 to-blue-500",
      schemaType: "TechSupport",
      items: [
        {
          content:
            'Mega Prize Mall provides services on an "as-is" and "as-available" basis. We are not liable for:',
          points: [
            "Scheduled or unscheduled maintenance downtime",
            "Server outages, hardware failures, or infrastructure issues",
            "Performance degradation, slow loading, or latency problems",
            "Third-party integration failures or compatibility issues",
            "Payment gateway outages or transaction processing failures",
            "Network connectivity issues or ISP problems",
            "Browser compatibility or device-specific issues",
            "Security incidents requiring temporary service suspension",
          ],
        },
        {
          content:
            "While we implement industry-standard uptime targets (99.5%), we do not guarantee uninterrupted, error-free, or completely secure service.",
          note: true,
        },
        {
          title: "Force Majeure Events",
          content:
            "We are not responsible for delays or failures resulting from:",
          points: [
            "Natural disasters, extreme weather events, or acts of God",
            "Government actions, regulations, or legal restrictions",
            "Network infrastructure failures or telecommunications outages",
            "Pandemic situations, health emergencies, or quarantine measures",
            "Civil unrest, strikes, or labor disputes",
          ],
          legalReferences: ["Force Majeure Clauses", "Contract Law"],
        },
      ],
    },
    {
      id: "pricing-changes",
      title: "Pricing, Offers & Policy Modification Disclaimer",
      description: "Rights regarding price changes and policy modifications",
      icon: Tag,
      color: "from-green-500 to-emerald-500",
      schemaType: "Price",
      items: [
        {
          content:
            "We reserve unilateral rights to modify, adjust, or discontinue at any time without prior notice:",
          points: [
            "Product prices, pricing structures, and currency conversions",
            "Discounts, promotions, deals, and special offers",
            "Shop & Win prizes, reward structures, and eligibility criteria",
            "Shipping costs, delivery options, and service charges",
            "Platform policies, terms, and conditions of use",
            "Service features, functionalities, and availability",
          ],
        },
        {
          content:
            "Your continued use of our platform after any modifications constitutes acceptance of updated terms. It is your responsibility to review policies periodically.",
          legal: true,
          legalReferences: ["Contract Modification Principles", "Consumer Law"],
        },
        {
          title: "Price Match & Guarantee Disclaimer",
          content: "We do not offer:",
          points: [
            "Price matching guarantees with other retailers",
            "Price protection or refunds for subsequent price drops",
            "Guaranteed lowest price claims or assurances",
            "Retroactive application of new discounts or promotions",
          ],
          warning: true,
        },
      ],
    },
    {
      id: "liability-limitation",
      title: "Legal Limitation of Liability Disclaimer",
      description: "Maximum liability limitations and legal protections",
      icon: Scale,
      color: "from-red-600 to-orange-600",
      schemaType: "Legal",
      items: [
        {
          content:
            "To the maximum extent permitted by applicable law, Mega Prize Mall shall not be liable for:",
          points: [
            "Direct, indirect, incidental, or consequential damages",
            "Special, exemplary, or punitive damages",
            "Loss of profits, revenue, or business opportunities",
            "Loss of data, information, or intellectual property",
            "Emotional distress, personal injury, or reputation damage",
            "Shipping delays, delivery failures, or logistics problems",
            "Product defects covered under separate warranty policies",
            "Third-party actions or service provider failures",
          ],
          legalReferences: [
            "Limitation of Liability Clauses",
            "Consumer Protection Act",
          ],
        },
        {
          content:
            "In jurisdictions where liability cannot be excluded, our maximum aggregate liability shall be limited to the total amount paid by you for the specific order giving rise to the claim - nothing more.",
          critical: true,
          legal: true,
        },
        {
          title: "Jurisdictional Limitations",
          content: "Liability limitations may vary by jurisdiction:",
          points: [
            "Some jurisdictions do not allow exclusion of certain damages",
            "Consumer protection laws may provide additional rights",
            "Local regulations may supersede certain limitations",
            "International transactions subject to applicable laws",
          ],
          note: true,
        },
      ],
    },
    {
      id: "indemnification-clause",
      title: "User Indemnification Agreement",
      description: "User obligations to indemnify and hold harmless",
      icon: Gavel,
      color: "from-violet-500 to-purple-500",
      schemaType: "Indemnity",
      items: [
        {
          content:
            "By using our services, you agree to defend, indemnify, and hold harmless Mega Prize Mall, its affiliates, officers, and employees from all claims arising from:",
          points: [
            "Your misuse of our platform, services, or promotional systems",
            "Violation of our policies, terms, or applicable laws",
            "False claims, fraudulent activities, or misrepresentations",
            "Abusive, harassing, or unlawful behavior on our platform",
            "Unauthorized use of accounts, promotions, or systems",
            "Infringement of third-party intellectual property rights",
            "Breach of data protection or privacy obligations",
            "Actions resulting in legal claims or regulatory violations",
          ],
          legalReferences: ["Indemnification Clauses", "Contract Law"],
        },
        {
          content:
            "You accept full financial responsibility for all costs, damages, and legal expenses resulting from your actions or violations.",
          legal: true,
        },
        {
          title: "Legal Defense Cooperation",
          content: "You agree to:",
          points: [
            "Cooperate fully with our legal defense efforts",
            "Not make any admissions without our written consent",
            "Provide timely assistance and information as requested",
            "Allow us to control the defense of any claim",
          ],
          note: true,
        },
      ],
    },
    {
      id: "policy-acceptance",
      title: "Policy Acceptance & User Agreement",
      description: "Terms governing acceptance of policies and continued use",
      icon: FileText,
      color: "from-cyan-500 to-teal-500",
      schemaType: "Agreement",
      items: [
        {
          content:
            "Using our website, services, or making any purchases constitutes full acceptance of:",
          points: [
            "All terms contained in this comprehensive Disclaimer",
            "Understanding and assumption of all associated risks",
            "Agreement not to misuse services or promotional systems",
            "Acknowledgement that promotional benefits are optional and non-guaranteed",
            "Acceptance of liability limitations and indemnification obligations",
          ],
        },
        {
          content:
            "If you disagree with any provision of this Disclaimer, your sole remedy is to immediately discontinue all use of our website and services.",
          warning: true,
        },
        {
          title: "Electronic Agreement Validity",
          content: "You acknowledge that:",
          points: [
            "Electronic agreement is legally binding and enforceable",
            "No physical signature required for policy acceptance",
            "Continued use constitutes ongoing agreement to terms",
            "Agreement applies retroactively to all previous interactions",
          ],
          legalReferences: [
            "Electronic Transactions Act",
            "Digital Signature Laws",
          ],
        },
      ],
    },
    {
      id: "policy-modification",
      title: "Policy Modification & Update Disclaimer",
      description: "Terms regarding policy changes and user notification",
      icon: RefreshCw,
      color: "from-gray-600 to-gray-800",
      schemaType: "Update",
      items: [
        {
          content:
            "We reserve unilateral rights to modify, update, or replace any part of this Disclaimer at any time without prior individual notice.",
          points: [
            "Most recent published version supersedes all previous versions",
            "Changes become effective immediately upon publication",
            "Previous versions are archived but no longer applicable",
            "Changes may be posted without email or SMS notification",
            "Major changes may be announced via website notifications",
          ],
        },
        {
          content:
            "Your continued use of our platform after any modifications constitutes acceptance of updated terms. You are solely responsible for reviewing this Disclaimer periodically.",
          legal: true,
        },
        {
          title: "Archive & Version Control",
          content: "We maintain:",
          points: [
            "Public archive of previous policy versions",
            "Version history with effective dates",
            "Change logs for major modifications",
            "Access to historical terms upon request",
          ],
          note: true,
        },
      ],
    },
  ];

  const criticalWarnings = [
    {
      icon: Ban,
      title: "No Gambling Activities",
      description: "Strict prohibition of gambling, lottery, and betting",
      schemaType: "Warning",
    },
    {
      icon: XCircle,
      title: "No Prize Guarantees",
      description: "Purchases do not guarantee Shop & Win prizes",
      schemaType: "Clarification",
    },
    {
      icon: AlertTriangle,
      title: "Assumption of Risk",
      description: "You use our services at your own risk",
      schemaType: "Liability",
    },
    {
      icon: Shield,
      title: "Limited Liability",
      description: "Liability capped at purchase amount only",
      schemaType: "Legal",
    },
    {
      icon: RefreshCw,
      title: "Returns Void Entries",
      description: "Returns automatically cancel Shop & Win eligibility",
      schemaType: "Policy",
    },
    {
      icon: Gavel,
      title: "Indemnification Required",
      description: "You indemnify us from your platform actions",
      schemaType: "Legal",
    },
  ];

  const legalReferences = [
    { law: "Consumer Protection Act", country: "Pakistan", relevance: "High" },
    {
      law: "Electronic Transactions Ordinance",
      country: "Pakistan",
      relevance: "High",
    },
    { law: "Contract Act", country: "Pakistan", relevance: "High" },
    { law: "Sales of Goods Act", country: "Pakistan", relevance: "Medium" },
    {
      law: "Prevention of Gambling Act",
      country: "Pakistan",
      relevance: "Medium",
    },
    {
      law: "Data Protection Regulations",
      country: "Pakistan",
      relevance: "Medium",
    },
  ];

  // Add structured data to page
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // FAQ Schema for critical warnings
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Mega Prize Mall a gambling platform?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No, Mega Prize Mall is strictly an e-commerce marketplace. We do not operate any gambling, lottery, or betting activities. Shop & Win is a free promotional program tied to purchases.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if I return a Shop & Win product?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Returning a product automatically voids your Shop & Win entry and makes you ineligible for any prizes associated with that order.",
          },
        },
        {
          "@type": "Question",
          name: "What is Mega Prize Mall's maximum liability?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our maximum liability is limited to the purchase amount of the specific order in question, as permitted by applicable law.",
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
          name: "Legal Disclaimer",
          item: "https://megaprizemall.com/disclaimer",
        },
      ],
    };

    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.text = JSON.stringify(breadcrumbData);
    document.head.appendChild(breadcrumbScript);

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
                  Legal Disclaimer
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
                aria-label="Legal Disclaimer Icon"
              >
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                itemProp="headline"
              >
                Legal Disclaimer & Terms of Use
              </h1>
              <p
                className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto"
                itemProp="description"
              >
                Comprehensive legal terms, limitations, and disclaimers
                governing your use of Mega Prize Mall e-commerce platform.
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
            {/* Critical Legal Notice */}
            <div
              className="mb-8 p-6 bg-linear-to-r from-red-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-red-300"
              role="alert"
            >
              <div className="flex items-start gap-4">
                <AlertOctagon className="h-8 w-8 text-red-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ⚠️ CRITICAL LEGAL NOTIFICATION
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Mega Prize Mall operates exclusively as an independent
                    e-commerce marketplace. By accessing, browsing, or using our
                    website, services, or purchasing any products, you
                    acknowledge full responsibility for your actions and
                    irrevocably agree to all terms contained herein without
                    exception.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-red-200">
                    <p className="text-gray-700 font-medium">
                      This document constitutes a legally binding agreement
                      between you and Mega Prize Mall. Non-agreement requires
                      immediate discontinuation of all platform use.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Warnings Grid */}
            <div className="mb-12 bg-linear-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                ⚠️ Critical Legal Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalWarnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-200 transition-colors"
                    itemScope
                    itemType={`https://schema.org/${warning.schemaType}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <warning.icon className="h-5 w-5 text-red-600" />
                      </div>
                      <h4
                        className="font-semibold text-gray-900"
                        itemProp="name"
                      >
                        {warning.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600" itemProp="description">
                      {warning.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal References Table */}
            <div className="mb-8 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                📚 Applicable Legal References
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Legal Reference
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Jurisdiction
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Relevance Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {legalReferences.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {ref.law}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">{ref.country}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ref.relevance === "High"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ref.relevance} Relevance
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  href="#legal-contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C2C78] text-white hover:bg-[#A43875] rounded-full text-sm font-medium transition-colors"
                >
                  <Gavel className="h-4 w-4" />
                  Legal Contact
                </Link>
              </div>
            </nav>

            {/* Policy Sections */}
            <div className="space-y-12">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                  itemScope
                  itemType={`https://schema.org/${
                    section.schemaType || "LegalDocument"
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
                      <p className="text-gray-600 mt-1" itemProp="description">
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
                              ? "bg-linear-to-r from-amber-50 to-orange-50"
                              : ""
                          }
                          ${
                            item.critical
                              ? "bg-linear-to-r from-red-50 to-orange-50"
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
                                ${item.warning ? "text-amber-700" : ""}
                                ${item.critical ? "text-red-700" : ""}
                                ${item.legal ? "text-gray-700" : ""}`}
                              >
                                {item.title}
                              </h3>
                            )}

                            <p
                              className={`text-gray-700 leading-relaxed mb-3 
                              ${
                                item.warning ? "font-medium text-amber-700" : ""
                              }
                              ${item.critical ? "font-medium text-red-700" : ""}
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
                                    {item.critical ? (
                                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                    ) : item.warning ? (
                                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                    ) : item.legal ? (
                                      <Scale className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
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

                            {item.legalReferences && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-2">
                                  <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">
                                      Applicable Legal References:
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      {item.legalReferences.join(", ")}
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
                                    className="bg-gray-50 rounded-lg p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      {subpoint.icon && (
                                        <div className="h-10 w-10 rounded-lg bg-[#7C2C78]/10 flex items-center justify-center shrink-0">
                                          <subpoint.icon className="h-5 w-5 text-[#7C2C78]" />
                                        </div>
                                      )}
                                      <div>
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

              {/* Acceptance Section */}
              <div className="bg-linear-to-r from-red-50 to-orange-50 rounded-2xl p-6 md:p-8 border-2 border-red-300">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      📜 Final Acceptance & Agreement
                    </h3>
                    <p className="text-gray-700 mb-4">
                      By continuing to access, browse, or use Mega Prize
                      Mall&apos;s website, services, mobile applications, or
                      making any purchases, you acknowledge that you have read,
                      understood, and irrevocably agree to be bound by all terms
                      contained in this Disclaimer.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-red-300">
                      <p className="text-gray-700 font-medium">
                        ⚖️ If you do not agree with any provision of this
                        Disclaimer, your sole and exclusive remedy is to
                        immediately discontinue all use of our website and
                        services. Continued use constitutes ongoing acceptance
                        of terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Summary */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  ⚖️ Legal Rights & Responsibilities Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Your Legal Rights & Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Right to discontinue use if disagreeing with terms
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Responsibility to read and understand all terms
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Right to review updated policies periodically
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Responsibility for account security and use
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-600" />
                      Our Legal Limitations & Protections
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Liability limited to specific purchase amounts only
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Right to update terms without individual notice
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Protection from misuse, fraud, and abuse
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                        <span className="text-gray-700">
                          Indemnification rights for user violations
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Legal Contact Section */}
              <section id="legal-contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <Gavel className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Legal Department Contact Information
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📨 Official Legal Communications
                    </h3>
                    <p className="text-white/90 mb-6">
                      For formal legal inquiries, cease and desist notices,
                      intellectual property claims, or official legal
                      communications:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Building className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Legal Entity:
                            </span>
                            <span className="text-white/90">
                              Mega Prize Mall (Pvt) Ltd
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          {/* <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">Registered Address:</span>
                            <span className="text-white/90">123 Commerce Street, Suite 500<br />Karachi, Pakistan</span>
                          </div> */}
                        </div>
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
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Legal Department:
                            </span>
                            <span className="text-white/90">
                              Mega Prize Mall Legal Team
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Legal Portal:
                            </span>
                            <Link
                              href="#"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/90 hover:text-white inline-flex items-center gap-1"
                            >
                              megaprizemall.com/legal
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Designated Counsel:
                            </span>
                            <span className="text-white/90">
                              Mega Prize Mall In-House Counsel
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            ⚠️ Important Legal Notice
                          </p>
                          <p className="text-sm text-white/90">
                            This contact information is for formal legal matters
                            only. For customer support inquiries, please use our
                            regular support channels. Legal communications must
                            include sender identification, contact information,
                            and specific legal basis for communication.
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
                    Need clarification on any legal terms or have formal legal
                    inquiries?
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() =>
                        document
                          .getElementById("legal-contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-[#7C2C78] hover:bg-[#A43875] text-white px-8"
                    >
                      Contact Legal Department
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
                  Binding Legal Agreement
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
