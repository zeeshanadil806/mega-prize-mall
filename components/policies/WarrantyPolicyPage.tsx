// app/(customer)/warranty-policy/page.tsx
"use client";
import {
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Truck,
  Mail,
  MessageCircle,
  User,
  Ban,
  HelpCircle,
  Award,
  Settings,
  AlertOctagon,
  ArrowUp,
  Home,
  ExternalLink,
  Zap,
  Battery,
  Smartphone,
  Headphones,
  Tablet,
  Laptop,
  Camera,
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
import { STORE_CONFIG } from "@/shared/config";

interface WarrantyType {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  covers: string[];
  excludes: string[];
  duration?: string;
  note?: string;
  warning?: boolean;
  schemaType?: string;
  coveragePeriod?: string;
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
    icon?: React.ComponentType<{ className?: string }>;
    subpoints?: { title: string; content: string; points?: string[] }[];
    steps?: string[];
  }[];
}

interface CategoryWarranty {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  manufacturerWarranty: string;
  replacementWarranty: string;
  notes: string;
}

export default function WarrantyPolicyPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "January 1, 2026";
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WarrantyPromise",
    name: "Warranty Policy - Mega Prize Mall",
    description:
      "Comprehensive warranty coverage for mobile accessories and electronics",
    warrantyScope: {
      "@type": "WarrantyScope",
      scope: "Defects in materials and workmanship",
    },
    durationOfWarranty: "P7D to P730D",
    url: "https://megaprizemall.com/warranty",
    provider: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://megaprizemall.com/warranty",
    },
  };

  const warrantyTypes: WarrantyType[] = [
    {
      id: "manufacturer",
      title: "Manufacturer Warranty",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      description:
        "Original manufacturer warranty provided by the brand. Claims processed through authorized service centers only.",
      covers: [
        "Hardware defects and factory malfunctions",
        "Component failures from manufacturing process",
        "Quality control issues and factory faults",
        "Performance below advertised specifications",
      ],
      excludes: [
        "Physical damage from drops or impacts",
        "Misuse, abuse, or improper handling",
        "Water damage or liquid exposure (unless IP-rated)",
        "Unauthorized repairs or modifications",
        "Software issues from user modifications",
        "Battery degradation under normal use",
        "Cosmetic wear and tear",
      ],
      duration: "Varies by brand (typically 6-24 months)",
      coveragePeriod: "P180D to P730D",
      note: "Repair times, approval decisions, and service quality are controlled by manufacturer",
      schemaType: "WarrantyPromise",
    },
    {
      id: "replacement",
      title: "Mega Prize Mall Replacement Warranty",
      icon: RefreshCw,
      color: "from-green-500 to-emerald-500",
      description:
        "In-house replacement warranty for eligible products. Applies only when explicitly stated on product page.",
      covers: [
        "Dead-on-arrival (DOA) units verified within 48 hours",
        "Manufacturing defects discovered within warranty period",
        "Incorrect items delivered (size/color/model mismatch)",
        "Defective out of box with clear malfunction evidence",
      ],
      excludes: [
        "Physical damage, cracks, or breakage",
        "Wear & tear or cosmetic imperfections",
        "Water, moisture, or liquid exposure",
        "Battery drainage or capacity complaints",
        "Software glitches or compatibility issues",
        "Performance issues from user configuration",
        "Missing accessories or packaging",
      ],
      duration: "7 Days from delivery confirmation",
      coveragePeriod: "P7D",
      warning: true,
      schemaType: "WarrantyPromise",
    },
    {
      id: "no-warranty",
      title: "No Warranty / As-Is Products",
      icon: Ban,
      color: "from-gray-600 to-gray-800",
      description:
        "Items sold in as-is condition without any warranty or return eligibility.",
      covers: [
        "Special promotion and clearance items",
        "Open box or refurbished products (unless specified)",
        "Flash deals and limited-time offers",
        'Items explicitly marked "No Warranty" or "As-Is"',
      ],
      excludes: [
        "All warranty claims and replacements",
        "Returns for defects or malfunctions",
        "Manufacturer service or support",
        "Compatibility guarantees",
      ],
      duration: "None - All sales final",
      note: "Thoroughly inspect before purchase - no exceptions for these categories",
      schemaType: "WarrantyScope",
    },
  ];

  const categoryWarranties: CategoryWarranty[] = [
    {
      category: "Smartphones",
      icon: Smartphone,
      manufacturerWarranty: "12-24 months",
      replacementWarranty: "7 days",
      notes: "Screen damage not covered. Battery coverage limited to 6 months",
    },
    {
      category: "Headphones & Earphones",
      icon: Headphones,
      manufacturerWarranty: "6-12 months",
      replacementWarranty: "7 days",
      notes: "Cable damage excluded. Water resistance must be proven",
    },
    {
      category: "Power Banks",
      icon: Battery,
      manufacturerWarranty: "6-12 months",
      replacementWarranty: "7 days",
      notes: "Capacity degradation normal. Physical damage voids warranty",
    },
    {
      category: "Chargers & Cables",
      icon: Zap,
      manufacturerWarranty: "3-6 months",
      replacementWarranty: "7 days",
      notes: "Bent/broken connectors excluded. Heat damage voids warranty",
    },
    {
      category: "Tablets",
      icon: Tablet,
      manufacturerWarranty: "12 months",
      replacementWarranty: "7 days",
      notes: "Accessories separate warranty. Screen burn-in excluded",
    },
    {
      category: "Laptops & Accessories",
      icon: Laptop,
      manufacturerWarranty: "12-36 months",
      replacementWarranty: "7 days",
      notes: "Software issues not covered. Battery 12 months max",
    },
    {
      category: "Camera Equipment",
      icon: Camera,
      manufacturerWarranty: "12-24 months",
      replacementWarranty: "7 days",
      notes: "Lens scratches excluded. Sensor dust not covered",
    },
  ];

  const sections: PolicySection[] = [
    {
      id: "general-overview",
      title: "General Warranty Overview",
      description:
        "Comprehensive warranty framework for all product categories at Mega Prize Mall",
      icon: Shield,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Overview",
      items: [
        {
          content:
            "Mega Prize Mall operates as a multi-vendor marketplace offering diverse product categories with varying warranty terms based on manufacturer policies, supplier agreements, and product classifications.",
          points: [
            "Each product page explicitly states warranty type and duration",
            'Absence of warranty mention indicates "No Warranty / No Return" policy',
            "Warranty terms differ significantly across product categories",
            "Purchase completion constitutes acceptance of these terms",
          ],
        },
        {
          content:
            "We categorize warranty protection into three primary types, each with specific conditions and limitations.",
          note: true,
        },
      ],
    },
    {
      id: "warranty-void",
      title: "Warranty Void Conditions",
      description:
        "Specific circumstances that invalidate warranty coverage completely",
      icon: Ban,
      color: "from-red-500 to-rose-500",
      schemaType: "Exclusions",
      items: [
        {
          content:
            "Warranty coverage becomes immediately void under any of the following conditions. No exceptions are granted under any circumstances:",
          points: [
            "Visible physical damage (cracks, dents, scratches, or deformation)",
            "Liquid ingress or moisture exposure (corrosion, watermarks, oxidation)",
            "Burn marks, overheating evidence, or electrical surge damage",
            "Unauthorized repairs, modifications, or tampering attempts",
            "Altered, removed, or damaged serial numbers, IMEI, or authentication stickers",
            "Software modifications including rooting, jailbreaking, or custom ROMs",
            "Missing original accessories, packaging, or documentation",
            "Usage contrary to manufacturer specifications or guidelines",
            "Improper handling, storage, or transportation damage",
            "Normal wear and tear exceeding reasonable expectations",
            "Cosmetic imperfections not affecting functionality",
            "Damage from power supply incompatibility or improper charging",
          ],
        },
        {
          content:
            "We maintain zero-tolerance policy for warranty void conditions. All decisions are final and based on objective inspection criteria.",
          warning: true,
        },
      ],
    },
    {
      id: "claim-process",
      title: "Warranty Claim Process",
      description:
        "Step-by-step procedure for submitting and processing warranty claims",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      schemaType: "HowTo",
      items: [
        {
          title: "Step 1: Preliminary Requirements Check",
          content:
            "Before initiating any claim, ensure you meet all prerequisites:",
          points: [
            "Product is within valid warranty period",
            "Issue is covered under warranty terms",
            "All original accessories and packaging available",
            "Clear photographic/video evidence of defect",
            "Purchase invoice and warranty documentation",
          ],
        },
        {
          title: "Step 2: Claim Submission Methods",
          content:
            "Choose your preferred submission channel based on claim complexity:",
          subpoints: [
            {
              title: "Dashboard Submission (Recommended)",
              content: "For standard claims with proper documentation:",
              points: [
                "Log into your account dashboard",
                'Navigate to "Orders & Warranty" section',
                'Select relevant order and click "Raise Claim"',
                "Upload required evidence (photos/videos)",
                "Complete claim form with detailed description",
                "Submit for quality control review",
              ],
            },
            {
              title: "Email Submission",
              content: "For complex cases requiring detailed documentation:",
              points: [
                "Send email to: warranty@megaprizemall.com",
                "Subject: Warranty Claim - Order #[Number]",
                "Attach: Clear photos/videos showing defect",
                "Include: Full contact and product details",
                "Provide: Detailed chronological issue description",
              ],
            },
            {
              title: "WhatsApp Support",
              content: "For quick guidance and support:",
              points: [
                "Message: +92 325 4007037",
                "Share: Order number and product images",
                "Describe: Issue with timestamps",
                "Request: Claim form or guidance",
              ],
            },
          ],
        },
        {
          title: "Step 3: Processing Timeline",
          content: "Standard processing durations for different claim types:",
          points: [
            "Dashboard claims: Initial response within 24-72 hours",
            "Email claims: Acknowledgement within 1-3 working days",
            "Complex cases: Up to 7 working days for investigation",
            "Manufacturer claims: 2-8 weeks depending on brand",
          ],
          note: true,
        },
      ],
    },
    {
      id: "inspection-decision",
      title: "Inspection & Decision Process",
      description:
        "Quality control and decision-making procedures for warranty claims",
      icon: Settings,
      color: "from-amber-500 to-orange-500",
      schemaType: "Inspection",
      items: [
        {
          content:
            "All warranty claims undergo rigorous multi-stage inspection by our Quality Assurance team:",
          points: [
            "Physical condition assessment for damage evidence",
            "Functional testing to verify reported issues",
            "Warranty term verification against purchase date",
            "Documentation validation (serial numbers, receipts)",
            "Comparison with manufacturer defect databases",
            "Review of customer-provided evidence",
          ],
        },
        {
          title: "Possible Resolution Outcomes",
          content:
            "Based on inspection findings, we may issue one of the following decisions:",
          points: [
            "Approval for replacement with identical/similar product",
            "Rejection due to policy violation or void conditions",
            "Redirection to authorized manufacturer service center",
            "Request for additional evidence or diagnostic testing",
            "Partial compensation or store credit for minor issues",
          ],
        },
        {
          content:
            "All decisions are final, evidence-based, and non-negotiable. We do not entertain appeals, arguments, or abusive communications.",
          warning: true,
        },
      ],
    },
    {
      id: "shipping-responsibility",
      title: "Shipping & Cost Responsibilities",
      description:
        "Clear guidelines on shipping cost allocation for warranty processes",
      icon: Truck,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Shipping",
      items: [
        {
          content:
            "Shipping cost allocation follows strict guidelines to ensure fairness and transparency:",
          subpoints: [
            {
              title: "Customer Responsibilities",
              content: "You are responsible for the following costs:",
              points: [
                "Initial shipping of defective product to our facility",
                "Return shipping if claim is rejected",
                "Insurance for high-value items during transit",
                "Packaging materials for safe transportation",
                "Any customs duties or import taxes",
              ],
            },
            {
              title: "Our Responsibilities",
              content: "We cover the following shipping costs:",
              points: [
                "Return shipping for approved replacement products",
                "Forwarding to authorized service centers when required",
                "Standard shipping for all approved warranty claims",
                "Return shipping for incorrectly rejected claims",
              ],
            },
          ],
        },
        {
          content:
            "Always retain shipping receipts, tracking numbers, and insurance documentation. Without proof, we cannot assist with lost or damaged shipments.",
          important: true,
        },
      ],
    },
    {
      id: "shop-win-impact",
      title: "Warranty & Shop & Win Rules",
      description:
        "Critical relationship between warranty claims and contest eligibility",
      icon: Award,
      color: "from-pink-500 to-rose-500",
      schemaType: "ContestRules",
      items: [
        {
          content:
            "Critical interconnection between warranty claims and Shop & Win contest participation:",
          points: [
            "Any product return resulting from warranty claim immediately cancels associated Shop & Win entry",
            "Full refunds or replacements void all contest eligibility for that transaction",
            "Previously awarded prizes become immediately invalid upon warranty claim approval",
            "No transfer of prize eligibility to replacement products",
            "Partial refunds may result in proportional prize cancellation",
          ],
        },
        {
          title: "Anti-Manipulation Safeguards",
          content:
            "These rules prevent system exploitation and ensure fairness:",
          points: [
            "Prevents dual benefit scenarios (prize + replacement)",
            "Ensures contest integrity across all participants",
            "Protects against fraudulent claim patterns",
            "Maintains fair competition environment",
            "Eliminates incentive for false warranty claims",
          ],
          important: true,
        },
        {
          content:
            "This policy applies universally across all warranty types, claim reasons, and resolution outcomes. No exceptions or special considerations are granted.",
          warning: true,
        },
      ],
    },
    {
      id: "limitation-liability",
      title: "Limitations of Liability",
      description: "Legal limitations and responsibility boundaries",
      icon: AlertOctagon,
      color: "from-red-600 to-orange-600",
      schemaType: "Legal",
      items: [
        {
          content:
            "Mega Prize Mall assumes limited liability under warranty provisions:",
          points: [
            "No responsibility for personal data loss from devices",
            "No compensation for indirect or consequential damages",
            "No liability for business interruption or downtime",
            "No responsibility for third-party service delays",
            "No guarantee of replacement stock availability",
            "No liability for courier or logistics service issues",
            "No responsibility for manufacturer service center actions",
          ],
        },
        {
          content:
            "Our maximum liability is strictly limited to: REPAIR OR REPLACEMENT OR REFUND (as applicable under specific warranty terms). This constitutes our sole and exclusive obligation under any warranty claim.",
          warning: true,
        },
      ],
    },
    {
      id: "policy-updates",
      title: "Policy Updates & Changes",
      description: "Procedures for policy modifications and version control",
      icon: Clock,
      color: "from-gray-600 to-gray-800",
      schemaType: "Updates",
      items: [
        {
          content:
            "We reserve unilateral rights to modify this warranty policy:",
          points: [
            "Current online version supersedes all previous iterations",
            "Changes apply immediately to all future purchases",
            "Existing warranty claims follow policy version at purchase time",
            "Major policy changes announced via website notifications",
            "Customers responsible for reviewing updated policies",
          ],
        },
        {
          content:
            "Continued use of our platform after policy updates constitutes implicit acceptance of modified terms. For major changes, we provide 30-day notice period.",
          note: true,
        },
      ],
    },
  ];

  const claimRequirements = [
    {
      item: "Original Product",
      required: true,
      description: "Complete, unaltered product with all components",
      schemaType: "Product",
    },
    {
      item: "Original Packaging",
      required: true,
      description: "Complete box with all inserts and documentation",
      schemaType: "Packaging",
    },
    {
      item: "All Accessories",
      required: true,
      description: "Chargers, cables, manuals, warranty cards",
      schemaType: "Accessories",
    },
    {
      item: "Purchase Invoice",
      required: true,
      description: "Original invoice or order confirmation",
      schemaType: "Invoice",
    },
    {
      item: "Warranty Card",
      required: "If applicable",
      description: "Properly filled and stamped by seller",
      schemaType: "WarrantyCard",
    },
    {
      item: "Clear Photos",
      required: true,
      description: "Multiple angles showing defect clearly",
      schemaType: "Photograph",
    },
    {
      item: "Unboxing Video",
      required: "Recommended",
      description: "For damage claims - shows condition at receipt",
      schemaType: "VideoObject",
    },
    {
      item: "IMEI/Serial Number",
      required: "If applicable",
      description: "Matching invoice and device labels",
      schemaType: "SerialNumber",
    },
  ];

  // FAQ Schema Data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is covered under manufacturer warranty?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Manufacturer warranty covers hardware defects, component failures, and manufacturing faults for 6-24 months depending on brand.",
        },
      },
      {
        "@type": "Question",
        name: "How long is the replacement warranty?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mega Prize Mall replacement warranty lasts 7 days from delivery confirmation for eligible products only.",
        },
      },
      {
        "@type": "Question",
        name: "Does warranty affect Shop & Win eligibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, warranty claims resulting in replacement or refund automatically cancel Shop & Win entries for that order.",
        },
      },
    ],
  };

  // Add structured data to page
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

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
          name: "Warranty Policy",
          item: "https://megaprizemall.com/warranty",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
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
                  Warranty Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section */}
        <header className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div
                className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6"
                role="img"
                aria-label="Warranty Shield Icon"
              >
                <Shield className="h-8 w-8" />
              </div>
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                itemProp="headline"
              >
                Warranty & Product Guarantee Policy
              </h1>
              <p
                className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto"
                itemProp="description"
              >
                Comprehensive warranty coverage details, claim procedures, and
                protection terms for all Mega Prize Mall purchases.
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
                {/* <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Policy Version:</span>
                  <span className="ml-2 font-semibold">4.2</span>
                </div> */}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Critical Warning Banner */}
            <div
              className="mb-8 p-6 bg-linear-to-r from-red-50 via-orange-50 to-amber-50 rounded-2xl border-2 border-red-300"
              role="alert"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ⚠️ Critical Policy Notice
                  </h3>
                  <p className="text-gray-700 mb-2">
                    By placing any order, you acknowledge and irrevocably agree
                    to this entire warranty policy.
                    <strong>
                      {" "}
                      Warranty claims resulting in refund or replacement
                      automatically cancel
                    </strong>{" "}
                    your Shop & Win contest entry for that order.
                  </p>
                  <p className="text-sm text-gray-600">
                    No exceptions granted for warranty void conditions. All
                    decisions are final.
                  </p>
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
                  <HelpCircle className="h-4 w-4" />
                  Support Contact
                </Link>
              </div>
            </nav>

            {/* Warranty Types Section */}
            <section id="warranty-types" className="mb-12 scroll-mt-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Warranty Types Explained
                  </h2>
                  <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {warrantyTypes.map((warranty) => (
                  <div
                    key={warranty.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col"
                    itemScope
                    itemType={`https://schema.org/${
                      warranty.schemaType || "WarrantyPromise"
                    }`}
                  >
                    <div
                      className={`h-2 bg-linear-to-r ${warranty.color}`}
                    ></div>
                    <div className="p-6 flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`h-12 w-12 rounded-lg bg-linear-to-r ${warranty.color} flex items-center justify-center`}
                        >
                          <warranty.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3
                            className="text-lg font-semibold text-gray-900"
                            itemProp="name"
                          >
                            {warranty.title}
                          </h3>
                          {warranty.duration && (
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span
                                className="text-sm text-gray-600"
                                itemProp="duration"
                              >
                                {warranty.duration}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4" itemProp="description">
                        {warranty.description}
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Coverage Includes:
                          </h4>
                          <ul className="space-y-2">
                            {warranty.covers.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                <span className="text-sm text-gray-600">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Exclusions:
                          </h4>
                          <ul className="space-y-2">
                            {warranty.excludes.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                <span className="text-sm text-gray-600">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {warranty.note && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-700">
                            {warranty.note}
                          </p>
                        </div>
                      )}

                      {warranty.warning && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700 font-medium">
                            ⚠️ Applies ONLY if explicitly stated on product page
                          </p>
                        </div>
                      )}
                    </div>
                    <meta
                      itemProp="coverageDuration"
                      content={warranty.coveragePeriod}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Product Category Warranties */}
            <section className="mb-12 bg-linear-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Product Category Warranty Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Product Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Manufacturer Warranty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Replacement Warranty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Important Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryWarranties.map((category, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <category.icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {category.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {category.manufacturerWarranty}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {category.replacementWarranty}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {category.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Claim Requirements */}
            <section className="mb-12 bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Warranty Claim Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {claimRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-300 transition-colors"
                    itemScope
                    itemType={`https://schema.org/${req.schemaType}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className="font-semibold text-gray-900"
                        itemProp="name"
                      >
                        {req.item}
                      </h4>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          req.required === true
                            ? "bg-green-100 text-green-800"
                            : req.required === "Recommended"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {req.required === true ? "Required" : req.required}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600" itemProp="description">
                      {req.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-linear-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      ⚠️ Critical Requirement
                    </h4>
                    <p className="text-sm text-gray-700">
                      Missing any required items results in automatic claim
                      rejection. Always retain original packaging and
                      documentation for the entire warranty period.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Policy Sections */}
            <div className="space-y-12">
              {sections.slice(1).map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                  itemScope
                  itemType="https://schema.org/Question"
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
                      <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                      <meta
                        itemProp="description"
                        content={section.description}
                      />
                    </div>
                  </div>

                  <div
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
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
                          }`}
                        itemProp="text"
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
                                ${item.important ? "text-amber-700" : ""}`}
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
                              }`}
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
                                    ) : section.id === "warranty-void" ? (
                                      <Ban className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
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

                            {item.steps && (
                              <ol className="space-y-3 mt-4">
                                {item.steps.map((step, stepIdx) => (
                                  <li
                                    key={stepIdx}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="h-6 w-6 rounded-full bg-[#7C2C78] text-white flex items-center justify-center text-sm font-bold shrink-0">
                                      {stepIdx + 1}
                                    </div>
                                    <span className="text-gray-700 leading-relaxed pt-0.5">
                                      {step}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            )}

                            {item.subpoints && (
                              <div className="space-y-4 mt-4">
                                {item.subpoints.map((subpoint, subIdx) => (
                                  <div
                                    key={subIdx}
                                    className="bg-gray-50 rounded-lg p-4"
                                  >
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                      {subpoint.title}
                                    </h4>
                                    <p className="text-gray-700 mb-2">
                                      {subpoint.content}
                                    </p>
                                    {subpoint.points && (
                                      <ul className="space-y-1">
                                        {subpoint.points.map(
                                          (point, pointIdx) => (
                                            <li
                                              key={pointIdx}
                                              className="flex items-start gap-2"
                                            >
                                              <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></div>
                                              <span className="text-gray-600 text-sm">
                                                {point}
                                              </span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
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

              {/* Contact & Support Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Warranty Support & Contact
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Dashboard Support */}
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dashboard Portal
                        </h3>
                        <p className="text-sm text-gray-600">
                          Recommended Method
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          Response: 24-72 hours
                        </span>
                      </div>
                      <ul className="space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">
                            Real-time claim tracking
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">
                            Document upload support
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">
                            Status notifications
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Email Support */}
                  <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Email Support
                        </h3>
                        <p className="text-sm text-gray-600">
                          For Detailed Cases
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Link
                          href="mailto:support@megaprizemall.com"
                          className="font-medium text-blue-700 hover:text-blue-800 hover:underline"
                        >
                          support@megaprizemall.com
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          Response: 1-3 working days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Include order number, photos, and detailed description
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Support */}
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          WhatsApp Support
                        </h3>
                        <p className="text-sm text-gray-600">Quick Guidance</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Link
                          href={STORE_CONFIG.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-700 hover:text-green-800 hover:underline inline-flex items-center gap-1"
                        >
                          +{STORE_CONFIG.supportPhone}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          Response: 24-48 hours
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Share order details and issue photos for assistance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Reminders */}
                <div className="mt-6 p-6 bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        ⚠️ Important Claim Reminders
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              Always include complete order number
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              Provide clear photos/videos from multiple angles
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              Retain shipping receipts with tracking numbers
                            </span>
                          </li>
                        </ul>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              Warranty claims affect Shop & Win eligibility
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              Keep original packaging for entire warranty period
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                            <span className="text-gray-700">
                              No follow-ups for incomplete submissions
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Need help with a warranty claim or have questions about
                    coverage?
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
                      Contact Support
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
                  Last updated: {lastUpdated} | Effective: {effectiveDate}
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
