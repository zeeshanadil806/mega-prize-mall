// app/(customer)/returns-refunds-policy/page.tsx
"use client";
import {
  RefreshCw,
  Shield,
  Package,
  Clock,
  CreditCard,
  Truck,
  Gift,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Upload,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Camera,
  Ban,
  AlertOctagon,
  Home,
  DollarSign,
  Headphones,
  Scale,
  Eye,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/customer/Header";
import CustomerFooter from "@/components/customer/CustomerFooter";
import Link from "next/link";

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
    critical?: boolean;
    note?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    steps?: string[];
    subpoints?: {
      title: string;
      content: string;
      points?: string[];
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export default function ReturnsRefundsPolicyPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "January 1, 2026";
  //   const policyVersion = '2.3';

  const sections: PolicySection[] = [
    {
      id: "policy-overview",
      title: "Policy Overview & Key Principles",
      description:
        "Core principles and philosophy behind our returns and refunds policy",
      icon: Shield,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Overview",
      items: [
        {
          content:
            "Mega Prize Mall is committed to customer satisfaction and fair return practices. This policy outlines our structured approach to returns and refunds.",
          points: [
            "Customer satisfaction as primary objective",
            "Fair and transparent eligibility criteria",
            "Clear timelines and communication",
            "Quality verification for protection",
            "Integration with promotional programs",
          ],
        },
        {
          title: "Key Policy Principles",
          content: "Guiding principles for all return decisions:",
          points: [
            "72-hour return window from delivery confirmation",
            "Condition-based eligibility assessment",
            "Evidence requirement for verification",
            "Transparent refund processing timelines",
            "Automated Shop-n-Win entry cancellation",
          ],
          note: true,
        },
      ],
    },
    {
      id: "eligibility",
      title: "Return Eligibility Criteria",
      description:
        "Specific conditions under which returns and refunds are approved",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      schemaType: "Eligibility",
      items: [
        {
          content: "Returns are approved ONLY under these specific conditions:",
          points: [
            "Defective or damaged product upon delivery",
            "Wrong item or incorrect variant delivered",
            "Product materially different from description",
            "Missing parts or accessories from package",
          ],
        },
        {
          title: "Verification Requirements",
          content: "All requests undergo systematic verification:",
          points: [
            "Quality control team assessment",
            "Photographic and video evidence review",
            "Packaging and product condition check",
            "IMEI/serial number verification",
          ],
        },
        {
          content:
            "Return approval depends on meeting ALL eligibility and verification criteria.",
          warning: true,
          important: true,
        },
      ],
    },
    {
      id: "non-eligible",
      title: "Non-Returnable Items & Categories",
      description:
        "Products and categories not eligible for returns or refunds",
      icon: XCircle,
      color: "from-red-500 to-rose-500",
      schemaType: "Restrictions",
      items: [
        {
          title: "Hygiene & Personal Use Items",
          content: "Non-returnable due to hygiene concerns:",
          points: [
            "Opened or used earphones and earbuds",
            "Headphones with removed hygiene seals",
            "Smartwatches with activated warranty",
            "Any wearable with signs of personal use",
          ],
        },
        {
          title: "Consumable & Accessory Items",
          content: "Non-returnable once opened:",
          points: [
            "Screen protectors and tempered glass",
            "Phone cases and protective covers",
            "Cables, chargers, and adapters",
            "Cleaning kits and maintenance tools",
          ],
        },
        {
          title: "Special Category Restrictions",
          content: "Additional non-returnable items:",
          points: [
            "Clearance or final sale merchandise",
            "Customized or personalized products",
            "Software or digital product keys (if activated)",
            "Items damaged through customer misuse",
          ],
          warning: true,
        },
        {
          content:
            "Complete list of non-returnable items displayed during product purchase.",
          note: true,
        },
      ],
    },
    {
      id: "return-window",
      title: "Return Window & Timeline Framework",
      description: "72-hour return window and processing timelines",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      schemaType: "Timeline",
      items: [
        {
          content:
            "Return/refund requests must be submitted within 72 hours (3 days) from delivery confirmation timestamp.",
          warning: true,
          critical: true,
        },
        {
          title: "Processing Timeline Breakdown",
          content: "Complete return-to-refund cycle:",
          points: [
            "Request Submission: Within 72 hours of delivery",
            "Initial Review: 24 hours maximum",
            "Pickup Scheduling: 24-48 hours post-approval",
            "Quality Inspection: 1-2 business days",
            "Refund Processing: 1-3 business days post-approval",
          ],
        },
        {
          title: "Extended Window Exceptions",
          content: "Limited exceptions to 72-hour rule:",
          points: [
            "Manufacturer warranty claims (per terms)",
            "Special holiday return extensions (announced)",
            "System-wide technical issues (documented)",
            "Discretionary case-by-case reviews",
          ],
          note: true,
        },
      ],
    },
    {
      id: "condition-requirements",
      title: "Product Condition Requirements",
      description: "Mandatory condition criteria for return acceptance",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      schemaType: "Condition",
      items: [
        {
          content:
            "To qualify for return acceptance, products must meet ALL conditions:",
          points: [
            "Complete unused condition with original packaging",
            "All accessories, manuals, and freebies included",
            "Original packaging intact without damage or marks",
            "Matching IMEI/serial numbers on product and invoice",
            "No signs of tampering, water damage, or physical abuse",
            "Factory settings and software locks intact",
          ],
        },
        {
          title: "Condition Verification Process",
          content: "Systematic verification procedures:",
          points: [
            "Visual inspection for physical damage",
            "Functionality testing for defects",
            "Accessory count and verification",
            "Packaging integrity assessment",
            "Documentation cross-verification",
          ],
        },
        {
          content:
            "Condition verification failure results in return rejection and return-to-sender at customer expense.",
          warning: true,
          //   legal: true
        },
      ],
    },
    {
      id: "refund-process",
      title: "Refund Processing & Methods",
      description: "Refund mechanisms, timelines, and method-specific details",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      schemaType: "Refund",
      items: [
        {
          title: "Refund Processing Sequence",
          content: "Refunds issued after successful completion:",
          steps: [
            "Quality inspection approval at facility",
            "Return verification and documentation",
            "Refund processing initiation",
            "Method-specific transfer execution",
            "Customer notification completion",
          ],
        },
        {
          title: "Refund Method Timelines",
          content: "Processing times by payment method:",
          points: [
            "Credit/Debit Cards → 5-10 business days (bank processing)",
            "Bank Transfer → 2-5 business days (local clearing)",
            "Store Credit → Instant account credit",
            "Digital Wallets → 3-7 business days (partner processing)",
          ],
        },
        {
          title: "Refund Amount Calculations",
          content: "Refund amounts may be adjusted for:",
          points: [
            "Original shipping charges (non-refundable)",
            "Return pickup charges (if applicable)",
            "Restocking fees for opened items (special cases)",
            "Tax adjustments per local regulations",
          ],
          note: true,
        },
        {
          content:
            "Refunds processed exclusively to original payment method used during purchase.",
          //   legal: true
        },
      ],
    },
    {
      id: "return-shipping",
      title: "Return Shipping & Pickup Logistics",
      description: "Pickup arrangements, charges, and logistics coordination",
      icon: Truck,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Shipping",
      items: [
        {
          title: "Pickup Charge Structure",
          content: "Pickup costs allocated based on return reason:",
          subpoints: [
            {
              title: "Merchant-Covered Pickup",
              content: "Free pickup provided for:",
              points: [
                "Damaged or defective products",
                "Wrong item or variant delivered",
                "Missing parts or accessories",
              ],
              icon: CheckCircle,
            },
            {
              title: "Customer-Responsible Pickup",
              content: "Charges apply for:",
              points: [
                "Change of mind returns (if eligible)",
                "Size or color preference changes",
                "Non-defective product returns",
              ],
              icon: DollarSign,
            },
          ],
        },
        {
          title: "Pickup Coordination",
          content: "Structured pickup process:",
          points: [
            "Automated scheduling upon return approval",
            "SMS/email notification with time window",
            "QR code or reference number for pickup",
            "Pickup confirmation and tracking",
          ],
        },
        {
          content:
            "Exact pickup charges (if applicable) communicated during return approval with option to proceed or cancel.",
          note: true,
        },
      ],
    },
    {
      id: "lucky-draw-impact",
      title: "Shop-n-Win Contest Impact (Critical)",
      description:
        "How returns affect promotional contest entries and participation",
      icon: Gift,
      color: "from-pink-500 to-rose-500",
      schemaType: "Promotion",
      items: [
        {
          content:
            "Return initiation triggers automatic cancellation of Shop-n-Win contest entries.",
          warning: true,
          critical: true,
        },
        {
          title: "7.1 Automatic Entry Cancellation",
          content: "Immediate system actions upon return:",
          points: [
            'Contest entry marked "Invalid - Return Initiated"',
            "Removal from current contest participation pool",
            "Automatic disqualification from pending draws",
            "Notification sent to registered email",
          ],
        },
        {
          title: "7.2 Post-Entry Return Scenarios",
          content: "Different scenarios for contest entries:",
          points: [
            "Pre-draw returns: Complete entry removal",
            "Post-draw returns: Prize forfeiture if selected",
            "Multi-order returns: Pattern detection activation",
            "Suspicious activity: Account review triggers",
          ],
        },
        {
          title: "7.3 Post-Win Return Rules",
          content: "Critical rules for winners:",
          points: [
            "Prize claim voided if product returned",
            "Alternate winner selection from valid entries",
            "Account flagging for system manipulation review",
            "Potential contest participation suspension",
          ],
          warning: true,
        },
        {
          title: "7.4 Integrity Protection Measures",
          content: "Fraud prevention and fairness measures:",
          points: [
            "Automated return-contest cross-referencing",
            "Pattern detection for return abuse",
            "Manual review for suspicious activity patterns",
            "Escalation to compliance team for investigation",
          ],
        },
        {
          content:
            "Contest participation is a promotional privilege tied to completed purchases, not a guaranteed benefit.",
          //   legal: true
        },
      ],
    },
    {
      id: "request-methods",
      title: "Return Request Submission Methods",
      description:
        "Multiple channels for submitting return requests with requirements",
      icon: Upload,
      color: "from-cyan-500 to-teal-500",
      schemaType: "Submission",
      items: [
        {
          title: "8.1 Online Dashboard (Recommended)",
          content: "Step-by-step portal submission:",
          steps: [
            "Login to Mega Prize Mall account",
            'Navigate to "My Orders" section',
            "Select specific order for return",
            'Click "Request Return/Refund"',
            "Select reason from dropdown menu",
            "Upload required evidence files",
            "Submit for quality team review",
          ],
          icon: FileText,
        },
        {
          title: "Evidence Requirements",
          content: "Mandatory documentation for all methods:",
          points: [
            "3-5 high-resolution photos showing issue",
            "Video demonstrating defect (for electronics)",
            "Clear packaging and shipping label images",
            "IMEI/serial number photos if applicable",
          ],
          icon: Camera,
        },
        {
          title: "8.2 Email Submission Method",
          content: "Structured email format required:",
          points: [
            "To: support@megaprizemall.com",
            "Subject: Return Request - Order #[Number]",
            "Body: Full name, order number, issue description",
            "Attachments: Required evidence files",
            "Contact: Phone number for verification",
          ],
          icon: Mail,
        },
        {
          title: "8.3 WhatsApp Support Channel",
          content: "Instant messaging submission:",
          points: [
            "Number: (Your WhatsApp support number)",
            'Format: "Return Request" as first message',
            "Details: Order number and brief description",
            "Evidence: Photos/videos via WhatsApp",
            "Verification: Phone number confirmation",
          ],
          icon: MessageCircle,
        },
      ],
    },
    {
      id: "verification-rules",
      title: "Strict Verification & Rejection Rules",
      description: "Automatic rejection criteria and verification standards",
      icon: AlertOctagon,
      color: "from-red-600 to-orange-500",
      schemaType: "Verification",
      items: [
        {
          content: "Returns automatically rejected for these violations:",
          points: [
            "Incomplete or unclear evidence submission",
            "IMEI/serial number mismatch with invoice",
            "Customer-induced damage or modification",
            "Missing accessories or original packaging",
            "Signs of use, wear, or tampering",
            "Submission beyond 72-hour window",
            "Wrong product returned (different item)",
          ],
        },
        {
          title: "Rejection Consequences",
          content: "Outcomes for rejected returns:",
          points: [
            "Return-to-sender at customer expense",
            "No refund or exchange processing",
            "Account note for return pattern",
            "Potential future return restrictions",
          ],
          warning: true,
        },
        {
          title: "Appeal Process",
          content: "Limited appeal options:",
          points: [
            "Written appeal within 7 days of rejection",
            "Additional evidence requirement",
            "Manager-level review process",
            "Final decision communication",
          ],
          note: true,
        },
      ],
    },
    {
      id: "warranty-claims",
      title: "Manufacturer Warranty Claims",
      description: "Warranty-specific procedures and limitations",
      icon: Shield,
      color: "from-indigo-500 to-purple-500",
      schemaType: "Warranty",
      items: [
        {
          title: "Warranty Coverage",
          content: "Manufacturer warranty terms:",
          points: [
            "Standard 1-year manufacturer warranty",
            "Coverage for manufacturing defects only",
            "Exclusion of physical damage or misuse",
            "Service through authorized centers",
          ],
        },
        {
          title: "Warranty Claim Process",
          content: "Structured claim procedure:",
          points: [
            "Contact manufacturer support directly",
            "Provide purchase proof and warranty card",
            "Follow manufacturer service procedures",
            "Service center assessment and repair",
          ],
        },
        {
          content:
            "Warranty claims are separate from return/refund processes and follow manufacturer terms.",
          note: true,
        },
      ],
    },
  ];

  const requestStatuses = [
    {
      status: "Submitted",
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
      description: "Request received, awaiting review",
    },
    {
      status: "Under Review",
      color: "bg-amber-100 text-amber-800",
      icon: Eye,
      description: "Quality team examination in progress",
    },
    {
      status: "Approved",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Return approved, pickup scheduled",
    },
    {
      status: "Rejected",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
      description: "Failed to meet eligibility criteria",
    },
    {
      status: "Pickup Scheduled",
      color: "bg-indigo-100 text-indigo-800",
      icon: Truck,
      description: "Pickup arranged with logistics partner",
    },
    {
      status: "In Transit",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
      description: "Item en route to inspection facility",
    },
    {
      status: "Quality Check",
      color: "bg-cyan-100 text-cyan-800",
      icon: Package,
      description: "Under inspection at quality center",
    },
    {
      status: "Refund Initiated",
      color: "bg-emerald-100 text-emerald-800",
      icon: CreditCard,
      description: "Refund processing started",
    },
    {
      status: "Refunded",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Refund completed successfully",
    },
  ];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Returns & Refunds Policy - Mega Prize Mall",
    description:
      "Complete returns and refunds policy with 72-hour return window and Shop-n-Win impact details",
    url: "https://megaprizemall.com/returns-refunds-policy",
    datePublished: "2024-01-01T00:00:00Z",
    dateModified: "2026-01-20T00:00:00Z",
    publisher: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    mainEntity: {
      "@type": "ReturnPolicy",
      name: "Returns & Refunds Policy",
      description:
        "72-hour return window policy with detailed eligibility criteria",
      returnPolicyCategory: "MerchantReturnPolicy",
      merchantReturnDays: 3,
      returnMethod: "ReturnByMail",
      returnFees: "ReturnShippingFees",
      customerRemorseReturnFees: "RestockingFees",
    },
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
              className="text-[#011b54] hover:text-[#022b82] hover:underline flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">
              Returns & Refunds Policy
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-linear-to-r from-[#011b54] via-[#022b82] to-[#011b54] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <RefreshCw className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Returns & Refunds Policy
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                Complete guide to our 72-hour return window, eligibility
                criteria, and Shop-n-Win contest impact.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Return Window:</span>
                  <span className="ml-2 font-semibold">72 Hours</span>
                </div>
                {/* <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Policy Version:</span>
                  <span className="ml-2 font-semibold">{policyVersion}</span>
                </div> */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">
                    Shop-n-Win Impact:
                  </span>
                  <span className="ml-2 font-semibold">
                    Entry Cancelled on Return
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Critical Warning Banner */}
            <div className="mb-8 p-6 bg-linear-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🚨 Critical Notice: Shop-n-Win Impact
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Returning your purchase{" "}
                    <strong>automatically cancels</strong> your Shop-n-Win
                    contest entry. This rule is strictly enforced to maintain
                    contest fairness and prevent system manipulation.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-red-200">
                    <p className="text-gray-700 font-medium">
                      No exceptions are made. Contest participation requires
                      completed, non-returned purchases.
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#011b54] text-white hover:bg-[#022b82] rounded-full text-sm font-medium transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Return Status Legend */}
            <div className="mb-12 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                📊 Return Request Status Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {requestStatuses.map((status) => (
                  <div
                    key={status.status}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        status.color.split(" ")[0]
                      } bg-opacity-20`}
                    >
                      <status.icon
                        className={`h-5 w-5 ${status.color.split(" ")[1]}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}
                        >
                          {status.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {status.description}
                      </p>
                    </div>
                  </div>
                ))}
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
                      <div className="w-16 h-1 bg-linear-to-r from-[#011b54] to-[#022b82] rounded-full mt-2"></div>
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
                            item.critical
                              ? "bg-linear-to-r from-red-100 to-orange-100 border-l-4 border-red-400"
                              : ""
                          }
                          ${
                            item.note
                              ? "bg-linear-to-r from-blue-50 to-cyan-50"
                              : ""
                          }`}
                      >
                        <div className="flex gap-4">
                          {item.icon && (
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <item.icon className="h-5 w-5 text-[#011b54]" />
                            </div>
                          )}
                          <div className="flex-1">
                            {item.title && (
                              <h3
                                className={`text-lg font-semibold text-gray-900 mb-2 
                                ${item.warning ? "text-red-700" : ""}
                                ${item.important ? "text-amber-700" : ""}
                                ${item.critical ? "text-red-800" : ""}`}
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
                              ${
                                item.critical
                                  ? "font-semibold text-red-800"
                                  : ""
                              }
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
                                    {item.warning || item.critical ? (
                                      <Ban className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                    ) : section.id === "non-eligible" ? (
                                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                    ) : section.id === "eligibility" ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    ) : (
                                      <div className="h-2 w-2 rounded-full bg-[#011b54] mt-2 shrink-0"></div>
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
                                    <div className="h-6 w-6 rounded-full bg-[#011b54] text-white flex items-center justify-center text-sm font-bold shrink-0">
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
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="flex items-start gap-3 mb-2">
                                      {subpoint.icon && (
                                        <div className="h-8 w-8 rounded-lg bg-[#011b54]/10 flex items-center justify-center shrink-0">
                                          <subpoint.icon className="h-4 w-4 text-[#011b54]" />
                                        </div>
                                      )}
                                      <h4 className="font-semibold text-gray-900">
                                        {subpoint.title}
                                      </h4>
                                    </div>
                                    <p className="text-gray-700 mb-2">
                                      {subpoint.content}
                                    </p>
                                    {subpoint.points && (
                                      <ul className="space-y-1 mt-2">
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

              {/* Key Policy Points */}
              <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  Key Policy Points Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-gray-900">
                        72-Hour Window
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Returns must be requested within 3 days of delivery
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Headphones className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">
                        Hygiene Items
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Earphones, earbuds non-returnable once opened
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">
                        Contest Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Shop-n-Win entries cancelled on return
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Evidence Required
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Photos/videos mandatory for return approval
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Original Method
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Refunds to original payment method only
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">
                        Condition-Based
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Returns accepted only in original condition
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#011b54] to-[#022b82] flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Returns Support & Contact
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#011b54] to-[#022b82] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#011b54] to-[#022b82] rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📞 Returns Support Channels
                    </h3>
                    <p className="text-white/90 mb-6">
                      For return-related inquiries, status checks, or policy
                      clarification:
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="space-y-3">
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
                            <p className="text-sm text-white/80 mt-1">
                              For detailed inquiries and attachments
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">WhatsApp:</span>
                            <span className="text-white/90">
                              +92 325 4007037
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              For instant messaging and photos
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Phone Support:
                            </span>
                            <span className="text-white/90">
                              (Your Contact Number)
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              Hours: 9 AM - 6 PM (Mon-Sat)
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
                            📋 Contact Guidelines for Returns
                          </p>
                          <p className="text-sm text-white/90">
                            When contacting support regarding returns, always
                            include: your order number, clear evidence
                            (photos/videos), issue description, and contact
                            details. This ensures faster processing and accurate
                            resolution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Version History */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📜 Policy Version History
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Version
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Effective Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Major Changes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          2.3
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Jan 20, 2026
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Enhanced SEO, structured data, improved Shop-n-Win
                          impact clarity
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Current
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          2.2
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Dec 10, 2025
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Added evidence requirements, clarified non-returnable
                          categories
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Superseded
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          2.1
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Oct 1, 2025
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          Introduced Shop-n-Win impact section, standardized
                          timelines
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Superseded
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Need help with a return or have questions about our policy?
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() =>
                        document
                          .getElementById("contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-[#011b54] hover:bg-[#022b82] text-white px-8"
                    >
                      Contact Returns Support
                    </Button>
                    <Button
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      variant="outline"
                      className="border-[#011b54] text-[#011b54] hover:bg-[#011b54]/10"
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Back to Top
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Last Updated: {lastUpdated} | Effective: {effectiveDate} |
                  72-Hour Return Window
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
