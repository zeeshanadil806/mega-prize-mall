// app/(customer)/shop-n-win-contest/page.tsx
"use client";
import {
  Gift,
  Shield,
  UserCheck,
  Award,
  Ban,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  MessageCircle,
  Globe,
  Clock,
  RefreshCw,
  FileText,
  Users,
  Trophy,
  Sparkles,
  ShoppingBag,
  Ticket,
  Truck,
  ArrowUp,
  Home,
  DollarSign,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/customer/Header";
import CustomerFooter from "@/components/customer/CustomerFooter";
import Link from "next/link";

interface ContestSection {
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
    critical?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    subpoints?: {
      title: string;
      content: string;
      icon?: React.ComponentType<{ className?: string }>;
      requirement?: boolean;
    }[];
    legalReferences?: string[];
  }[];
}

interface ParticipationStep {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: string;
  requirement: string;
}

export default function ShopNWinContestPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "January 1, 2026";
  //   const policyVersion = '4.2';

  const participationSteps: ParticipationStep[] = [
    {
      step: 1,
      title: "Make a Valid Purchase",
      description: "Place a qualifying order on Mega Prize Mall platform",
      icon: ShoppingBag,
      duration: "Order placement to payment confirmation",
      requirement: "Minimum order value may apply during promotions",
    },
    {
      step: 2,
      title: "Successful Order Delivery",
      description: "Receive your order without returns or cancellations",
      icon: Truck,
      duration: "3-7 business days",
      requirement: "Valid address and contact information required",
    },
    {
      step: 3,
      title: "Automatic Entry Award",
      description: "Entry automatically added to contest pool",
      icon: Ticket,
      duration: "Within 24 hours of delivery",
      requirement: "No returns or refunds initiated",
    },
    {
      step: 4,
      title: "Winner Selection Process",
      description: "Random selection from valid entries",
      icon: Award,
      duration: "As per contest cycle schedule",
      requirement: "All eligibility criteria met",
    },
    {
      step: 5,
      title: "Prize Claim & Verification",
      description: "Complete verification and receive prize",
      icon: Gift,
      duration: "7-14 days after selection",
      requirement: "Valid ID and order verification required",
    },
  ];

  const sections: ContestSection[] = [
    {
      id: "legal-disclaimer",
      title: "Legal Disclaimer & Contest Classification",
      description:
        "Official legal classification and regulatory compliance statements",
      icon: Shield,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Legal",
      items: [
        {
          title: "1.1 Contest Classification & Legal Status",
          content:
            "Shop-n-Win operates as a promotional loyalty program with specific legal characteristics:",
          points: [
            "Free entry program with purchase requirement (No Consideration Principle)",
            "Not classified as gambling, lottery, or chance-based game",
            "Compliant with consumer protection and promotional laws",
            "Transparent and verifiable selection process",
            "No monetary value assigned to contest entries",
          ],
          legalReferences: [
            "Consumer Protection Act",
            "Promotional Contest Guidelines",
            "Anti-Gambling Regulations",
          ],
        },
        {
          title: "1.2 Distinction from Gambling Activities",
          content:
            "Critical legal distinctions ensuring regulatory compliance:",
          points: [
            "No entry fee or participation charge (free with purchase)",
            "Product purchase represents fair market value exchange",
            "Contest entry is incidental bonus, not primary consideration",
            "No betting, wagering, or chance-based money transactions",
            "Transparent odds and fair participation mechanism",
          ],
          legal: true,
        },
        {
          title: "1.3 Regulatory Compliance Assurance",
          content: "Program designed and operated within legal frameworks:",
          points: [
            "Regular legal audits and compliance reviews",
            "Transparent terms and conditions publication",
            "Proper prize fulfillment and winner verification",
            "Record keeping for regulatory compliance",
            "Consumer dispute resolution mechanisms",
          ],
          legalReferences: [
            "Data Protection Regulations",
            "Consumer Rights Legislation",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      title: "Eligibility Requirements & Participation Criteria",
      description:
        "Comprehensive eligibility requirements and participant qualifications",
      icon: UserCheck,
      color: "from-green-500 to-emerald-500",
      schemaType: "Requirements",
      items: [
        {
          content:
            "To qualify for Shop-n-Win Contest participation, participants must meet ALL mandatory requirements:",
          points: [
            "Valid account registration with verified contact information",
            "Successful order placement with confirmed payment (prepaid or approved COD)",
            "Complete delivery to verified address within specified timeframe",
            "No returns, refunds, or order modifications after delivery",
            "Compliance with all platform terms and contest rules",
          ],
        },
        {
          title: "Automatic Disqualification Criteria",
          content: "Participants are automatically disqualified for:",
          points: [
            "Fraudulent account creation or multiple account abuse",
            "Provision of false or misleading information",
            "Violation of platform terms of service",
            "Chargeback or payment dispute initiation",
            "Abusive or manipulative contest participation",
          ],
          warning: true,
        },
        {
          title: "Geographical & Age Restrictions",
          content: "Additional eligibility constraints:",
          points: [
            "Must be legal resident of service area (currently Pakistan)",
            "Minimum age requirement: 18 years for prize eligibility",
            "Employees and relatives of Mega Prize Mall ineligible",
            "Void where prohibited by local laws and regulations",
            "Additional restrictions may apply for specific prize categories",
          ],
          legal: true,
        },
      ],
    },
    {
      id: "entry-mechanics",
      title: "Entry Mechanics & Award Process",
      description:
        "Detailed explanation of entry calculation and award procedures",
      icon: Award,
      color: "from-purple-500 to-pink-500",
      schemaType: "Process",
      items: [
        {
          content:
            "Entry calculation follows transparent, automated processes:",
          subpoints: [
            {
              title: "Automatic Entry Trigger",
              content:
                "Entry awarded automatically upon successful delivery confirmation",
              icon: CheckCircle,
              requirement: true,
            },
            {
              title: "Delivery Verification",
              content: "Courier confirmation and customer acceptance required",
              icon: Truck,
              requirement: true,
            },
            {
              title: "Fraud Prevention Check",
              content: "Automated system validates order authenticity",
              icon: Shield,
              requirement: true,
            },
          ],
        },
        {
          title: "Entry Value & Multipliers",
          content: "Entry calculation methods may include:",
          points: [
            "Standard entry: One per qualifying order",
            "Promotional multipliers: During special campaigns",
            "Category bonuses: Specific product category purchases",
            "Loyalty bonuses: Repeat customer rewards",
            "Referral bonuses: Additional entries for referrals",
          ],
        },
        {
          content:
            "All entry calculations are automated, transparent, and verifiable through account dashboard.",
          //   note: true
        },
      ],
    },
    {
      id: "winner-selection",
      title: "Winner Selection & Verification Process",
      description:
        "Transparent winner selection methodology and verification procedures",
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
      schemaType: "Selection",
      items: [
        {
          content:
            "Winner selection employs transparent, verifiable methodologies:",
          points: [
            "Randomized algorithm with cryptographic verification",
            "Third-party auditing and validation capabilities",
            "Selection recorded with timestamp and audit trail",
            "Multiple verification layers for fairness assurance",
            "Real-time result publication and verification",
          ],
        },
        {
          title: "Automated Disqualification Protocols",
          content: "System automatically excludes participants for:",
          points: [
            "Order returns or refunds initiated after entry",
            "Address verification failures or delivery issues",
            "Payment disputes or chargeback activities",
            "Account suspension or policy violations",
            "Technical fraud detection system triggers",
          ],
        },
        {
          title: "Selection Audit & Verification",
          content: "Comprehensive verification procedures:",
          points: [
            "Independent audit trail maintenance",
            "Selection algorithm transparency documentation",
            "Participant verification of selection process",
            "Regulatory compliance verification",
            "Dispute resolution and appeal procedures",
          ],
          legalReferences: [
            "Fair Competition Guidelines",
            "Consumer Protection Standards",
          ],
        },
      ],
    },
    {
      id: "contest-cycle",
      title: "Contest Cycles & Prize Distribution",
      description:
        "Contest scheduling, prize categories, and distribution timelines",
      icon: Clock,
      color: "from-cyan-500 to-teal-500",
      schemaType: "Schedule",
      items: [
        {
          content:
            "Contest operates on multiple cycles with distinct characteristics:",
          points: [
            "Weekly cycles for regular participation",
            "Monthly cycles for larger prize distributions",
            "Special event cycles for seasonal promotions",
            "Flash contest cycles for limited-time offers",
            "Ongoing cycles for continuous participation",
          ],
        },
        {
          title: "Prize Categories & Values",
          content: "Prize offerings across different contest categories:",
          points: [
            "Electronics and gadgets (smartphones, tablets, wearables)",
            "Shopping vouchers and gift cards (platform and partner)",
            "Cash prizes (when explicitly specified in promotions)",
            "Brand merchandise and exclusive accessories",
            "Travel and experience prizes (special promotions only)",
          ],
        },
        {
          title: "Prize Claim & Distribution Protocol",
          content: "Comprehensive prize fulfillment procedures:",
          points: [
            "Winner notification within 48 hours of selection",
            "Verification completion within 7 days of notification",
            "Prize delivery within 14-30 days of verification",
            "Tax compliance and reporting as required",
            "Substitute prizes for unavailable items",
          ],
          legalReferences: [
            "Prize Distribution Regulations",
            "Tax Compliance Requirements",
          ],
        },
      ],
    },
    {
      id: "disqualification",
      title: "Disqualification Rules & Violations",
      description:
        "Comprehensive disqualification criteria and violation consequences",
      icon: Ban,
      color: "from-red-500 to-rose-500",
      schemaType: "Disqualification",
      items: [
        {
          content: "Immediate disqualification occurs for these violations:",
          points: [
            "Product return after contest entry award",
            "Order cancellation or delivery refusal post-entry",
            "False information submission during registration",
            "Multiple account creation for entry manipulation",
            "System exploitation or technical manipulation attempts",
            "Fraudulent purchase or payment method use",
          ],
        },
        {
          title: "Post-Winner Disqualification Scenarios",
          content:
            "Additional disqualification scenarios after winner selection:",
          points: [
            "Failed identity verification or documentation",
            "Prize claim deadline expiration",
            "Violation of prize acceptance terms",
            "Attempted prize transfer or sale",
            "Misrepresentation of winner status",
          ],
          warning: true,
        },
        {
          content:
            "All disqualification decisions are final and documented with specific reasoning.",
          legal: true,
        },
      ],
    },
    {
      id: "returns-impact",
      title: "Return Policy & Contest Impact",
      description:
        "Critical relationship between returns, refunds, and contest eligibility",
      icon: RefreshCw,
      color: "from-red-600 to-orange-500",
      schemaType: "Returns",
      items: [
        {
          title: "7.1 Immediate Entry Cancellation",
          content: "Return initiation triggers automatic entry cancellation:",
          points: [
            "Entry marked invalid within 1 hour of return request",
            "Removal from current contest cycle pool",
            "Automatic disqualification from pending selections",
            "Entry void notification sent to account email",
            "Historical record maintained for audit purposes",
          ],
          critical: true,
        },
        {
          title: "7.2 Post-Winner Return Scenarios",
          content: "Critical rules for returns after winner selection:",
          points: [
            "Prize forfeiture and re-award to alternate winner",
            "Account suspension for fraudulent return attempts",
            "Legal action eligibility for system manipulation",
            "Permanent contest participation restriction",
            "Public announcement of disqualification (if required)",
          ],
          important: true,
        },
        {
          title: "7.3 Return Verification & Fraud Prevention",
          content: "Systematic fraud prevention measures:",
          points: [
            "Automated return-entry cross-referencing",
            "Pattern detection for return abuse",
            "Manual review for suspicious return patterns",
            "Customer notification and verification requirements",
            "Escalation to fraud prevention team for investigation",
          ],
          legalReferences: [
            "Fraud Prevention Protocols",
            "Consumer Protection Standards",
          ],
        },
      ],
    },
    {
      id: "no-paid-entries",
      title: "No Paid Entries Policy",
      description:
        "Strict prohibition of monetary consideration for contest participation",
      icon: XCircle,
      color: "from-gray-600 to-gray-800",
      schemaType: "Policy",
      items: [
        {
          title: "8.1 Zero Monetary Consideration Principle",
          content: "Contest operates on strict no-payment participation basis:",
          points: [
            "No entry fees, participation charges, or ticket sales",
            "No additional costs for contest eligibility",
            "No premium features or paid advantages",
            "No hidden charges or mandatory purchases",
            "Transparent free participation with purchase requirement",
          ],
        },
        {
          title: "8.2 Legal Structure & Compliance",
          content: "Legal framework ensuring no-gambling classification:",
          points: [
            "Purchase requirement for actual product value",
            "Contest entry as incidental promotional benefit",
            "No consideration or payment for chance to win",
            "Compliance with anti-gambling regulations",
            "Regular legal review and compliance verification",
          ],
          legal: true,
        },
        {
          content:
            "This policy ensures contest remains classified as promotional activity, not gambling or lottery.",
          legalReferences: [
            "Gambling Act Exemptions",
            "Promotional Contest Guidelines",
          ],
        },
      ],
    },
    {
      id: "prize-verification",
      title: "Prize Acceptance & Verification Requirements",
      description:
        "Comprehensive winner verification and prize acceptance procedures",
      icon: FileText,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Verification",
      items: [
        {
          content:
            "Winner verification requires completion of these mandatory steps:",
          points: [
            "Original order confirmation and delivery proof presentation",
            "Valid government-issued ID verification (CNIC, Passport, License)",
            "Address verification through multiple channels",
            "Contact verification via SMS/email confirmation",
            "Prize acceptance declaration and release form signature",
          ],
        },
        {
          title: "Verification Timeframes & Deadlines",
          content: "Strict verification completion requirements:",
          points: [
            "Initial response required within 48 hours of notification",
            "Document submission deadline: 7 calendar days",
            "Verification completion: 14 calendar days maximum",
            "Prize forfeiture after deadline expiration",
            "Alternate winner selection after forfeiture",
          ],
          warning: true,
        },
        {
          title: "Tax Compliance & Reporting",
          content: "Winner responsibilities for tax compliance:",
          points: [
            "Tax liability rests solely with prize winner",
            "Tax forms and documentation as required by law",
            "Reporting to tax authorities as applicable",
            "Withholding requirements for certain prize values",
            "Legal compliance for international winners",
          ],
          legalReferences: [
            "Income Tax Regulations",
            "Prize Taxation Guidelines",
          ],
        },
      ],
    },
    {
      id: "company-rights",
      title: "Company Rights & Contest Modifications",
      description:
        "Rights reserved by Mega Prize Mall for contest operation and modification",
      icon: Users,
      color: "from-violet-500 to-purple-500",
      schemaType: "Rights",
      items: [
        {
          content:
            "Mega Prize Mall reserves comprehensive rights for contest operation:",
          points: [
            "Modify contest rules, eligibility, or prize structures",
            "Suspend, extend, or terminate contests at any time",
            "Disqualify participants for rule violations or abuse",
            "Substitute prizes of equal or greater value",
            "Make final decisions on all contest-related matters",
          ],
        },
        {
          title: "Contest Modification Notification",
          content: "Modification and change management procedures:",
          points: [
            "Website announcement for significant changes",
            "Email notification to active participants",
            "Clear version control and update history",
            "Grace periods for major rule changes",
            "Archive of previous contest versions",
          ],
        },
        {
          content:
            "All decisions regarding contest operation and management are final and binding.",
          legal: true,
        },
      ],
    },
    {
      id: "liability",
      title: "Liability Limitations & Disclaimers",
      description: "Comprehensive liability limitations and legal disclaimers",
      icon: AlertTriangle,
      color: "from-amber-600 to-orange-600",
      schemaType: "Liability",
      items: [
        {
          content:
            "Mega Prize Mall assumes limited liability for contest operations:",
          points: [
            "No liability for technical failures or system outages",
            "No responsibility for courier delays or delivery issues",
            "No liability for incorrect participant information",
            "No responsibility for third-party service failures",
            "Limited liability for prize fulfillment delays",
          ],
        },
        {
          title: "Prize Warranty & Service Disclaimers",
          content: "Additional prize-related disclaimers:",
          points: [
            'Prizes provided "as-is" with manufacturer warranty only',
            "No cash alternative unless explicitly stated",
            "Prize transfer restrictions may apply",
            "Service and support through standard channels",
            "No endorsement implied by prize provision",
          ],
          legal: true,
        },
        {
          content:
            "Contest participation constitutes acceptance of all liability limitations and disclaimers.",
          legalReferences: [
            "Liability Limitation Clauses",
            "Consumer Protection Standards",
          ],
        },
      ],
    },
  ];

  // Generate structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Shop-n-Win Contest - Mega Prize Mall",
    description:
      "Promotional shopping contest with prize awards for qualifying purchases",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2026-12-31T23:59:59Z",
    eventStatus: "EventScheduled",
    eventAttendanceMode: "OnlineEventAttendanceMode",
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
      availability: "InStock",
      validFrom: "2024-01-01T00:00:00Z",
    },
  };

  return (
    <>
      {/* Structured Data for Rich Snippets */}
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
              Shop-n-Win Contest
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Gift className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Shop-n-Win Contest Official Rules
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                Comprehensive rules, terms, and conditions for participating in
                Mega Prize Mall&apos;s promotional contest program.
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
                  <span className="ml-2 font-semibold">{policyVersion}</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Legal Disclaimer Banner */}
            <div className="mb-8 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-start gap-4">
                <Shield className="h-8 w-8 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ⚖️ Legal Classification Disclaimer
                  </h3>
                  <p className="text-gray-700 mb-3">
                    The Shop-n-Win Contest is legally classified as a{" "}
                    <strong>promotional loyalty program</strong>, NOT a lottery,
                    raffle, or gambling activity. Participation requires no
                    additional payment, and entries are awarded exclusively as
                    bonus rewards for qualifying purchases.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-blue-200">
                    <p className="text-gray-700 font-medium">
                      This structure ensures compliance with consumer protection
                      laws and anti-gambling regulations in all operating
                      jurisdictions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participation Process */}
            <div className="mb-12 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                📝 How to Participate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {participationSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="bg-white rounded-xl p-4 border border-green-200 h-full">
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#7C2C78] text-white flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                        <step.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-center">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {step.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {step.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {step.requirement}
                          </span>
                        </div>
                      </div>
                    </div>
                    {step.step < 5 && (
                      <div className="hidden lg:block absolute top-1/2 right-0 w-full h-0.5 bg-green-200 transform translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Warning */}
            <div className="mb-12 bg-linear-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    🚨 Critical Rule: Return Policy Impact
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Returning your purchase{" "}
                    <strong>automatically cancels</strong> your Shop-n-Win
                    entry. This rule ensures contest fairness and prevents
                    system manipulation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-gray-700 font-medium">
                          Entry Cancellation Triggers:
                        </span>
                      </div>
                      <ul className="space-y-1 pl-7">
                        <li className="text-gray-600">
                          Product return after delivery
                        </li>
                        <li className="text-gray-600">
                          Order refund or cancellation
                        </li>
                        <li className="text-gray-600">
                          Delivery refusal or RTS
                        </li>
                        <li className="text-gray-600">
                          Payment dispute or chargeback
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Ban className="h-5 w-5 text-red-500" />
                        <span className="text-gray-700 font-medium">
                          Consequences:
                        </span>
                      </div>
                      <ul className="space-y-1 pl-7">
                        <li className="text-gray-600">
                          Immediate entry voidance
                        </li>
                        <li className="text-gray-600">
                          Prize forfeiture if winner
                        </li>
                        <li className="text-gray-600">
                          Account review and possible suspension
                        </li>
                        <li className="text-gray-600">
                          Future contest restrictions
                        </li>
                      </ul>
                    </div>
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
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
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
                          }
                          ${
                            item.critical
                              ? "bg-linear-to-r from-red-100 to-orange-100 border-l-4 border-red-400"
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
                                ${item.legal ? "text-blue-700" : ""}
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
                              ${item.legal ? "text-blue-700" : ""}
                              ${
                                item.critical
                                  ? "font-semibold text-red-800"
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
                                    ) : item.legal ? (
                                      <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                                    ) : item.critical ? (
                                      <Ban className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                    ) : section.id === "eligibility" ? (
                                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
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
                                  <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">
                                      Legal References & Compliance:
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
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="flex items-start gap-3">
                                      {subpoint.icon && (
                                        <div className="h-10 w-10 rounded-lg bg-[#7C2C78]/10 flex items-center justify-center shrink-0">
                                          <subpoint.icon className="h-5 w-5 text-[#7C2C78]" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <h4 className="font-semibold text-gray-900">
                                            {subpoint.title}
                                          </h4>
                                          {subpoint.requirement && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                              Required
                                            </span>
                                          )}
                                        </div>
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

              {/* Key Points Summary */}
              <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Contest Key Points Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Free Participation
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      No entry fees - participation free with purchase
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Purchase Required
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Valid order and successful delivery mandatory
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">
                        Returns Cancel Entry
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Entry automatically voided if order returned
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">
                        Legal Promotion
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Not gambling - compliant promotional contest
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-gray-900">
                        Fair Selection
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Random, transparent winner selection process
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-teal-600" />
                      <span className="font-medium text-gray-900">
                        ID Verification
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Required for prize claim and fraud prevention
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Contest Support & Contact Information
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📞 Contact & Support Channels
                    </h3>
                    <p className="text-white/90 mb-6">
                      For contest-related inquiries, winner verification, or
                      rule clarification:
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
                            <p className="text-sm text-white/80 mt-1">
                              For detailed inquiries and documentation
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Contest Portal:
                            </span>
                            {/* <a 
                              href="https://megaprizemall.com/contest" 
                              className="text-white/90 hover:text-white inline-flex items-center gap-1"
                            >
                              megaprizemall.com/contest
                              <ExternalLink className="h-3 w-3" />
                            </a> */}
                            <p className="text-sm text-white/80 mt-1">
                              Live winners list and announcements
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              WhatsApp Support:
                            </span>
                            <span className="text-white/90">
                              +92 325 4007037
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              Quick queries and instant messaging
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Bell className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Notification Channel:
                            </span>
                            <span className="text-white/90">
                              Website & Email Announcements
                            </span>
                            <p className="text-sm text-white/80 mt-1">
                              Winner announcements and contest updates
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
                            📋 Important Contact Guidelines
                          </p>
                          <p className="text-sm text-white/90">
                            When contacting support regarding contest entries,
                            always include your order number, account email, and
                            specific contest query. For winner verification, be
                            prepared to provide order confirmation and valid
                            government-issued ID.
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
                    Need clarification on contest rules or have questions about
                    participation?
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
                      Contact Contest Support
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
                  Legal Promotional Contest
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
