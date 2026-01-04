// app/(customer)/shipping-policy/page.tsx
"use client";
import {
  Truck,
  Clock,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageCircle,
  RefreshCw,
  Eye,
  Shield,
  Home,
  Globe,
  Calendar,
  CreditCard,
  AlertOctagon,
  PhoneCall,
  Map,
  Users,
  ArrowUp,
  Info,
  Zap,
  Target,
  Navigation,
  Gift,
  Camera,
  Ban,
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
    subpoints?: {
      title: string;
      content: string;
      points?: string[];
      icon?: React.ComponentType<{ className?: string }>;
    }[];
    timeline?: {
      region: string;
      cities: string[];
      days: string;
      color: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

export default function ShippingPolicyPage() {
  const lastUpdated = "January 1, 2026";
  const effectiveDate = "January 1, 2026";

  const sections: PolicySection[] = [
    {
      id: "order-processing",
      title: "Order Processing Time Framework",
      description:
        "Standard order processing timelines and verification procedures",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      schemaType: "Processing",
      items: [
        {
          title: "1.1 Standard Processing Window",
          content: "All orders undergo systematic processing:",
          points: [
            "Processing time: 24-48 hours during business days (Monday-Friday)",
            "Orders after 5:00 PM counted for next business day",
            "Weekend/holiday orders processed next business day",
            "Order confirmation email with timeline sent immediately",
          ],
        },
        {
          title: "1.2 Processing Delay Factors",
          content: "Processing may be extended due to:",
          points: [
            "Sales events and promotional volume spikes",
            "Inventory verification and quality assurance",
            "Payment verification and fraud prevention checks",
            "Customer information validation requirements",
          ],
          important: true,
        },
        {
          content:
            "Processing delays caused by incomplete/inaccurate customer information are customer responsibility.",
          warning: true,
        },
      ],
    },
    {
      id: "delivery-timeline",
      title: "Delivery Timeline Estimates",
      description:
        "Location-based delivery time estimates and courier partner operations",
      icon: Truck,
      color: "from-green-500 to-emerald-500",
      schemaType: "Delivery",
      items: [
        {
          title: "2.1 Regional Delivery Estimates",
          content: "Estimated delivery times by region (business days):",
          timeline: [
            {
              region: "Major Metropolitan Areas",
              cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi"],
              days: "2-4 Days",
              color: "bg-green-100 text-green-800",
              icon: Zap,
            },
            {
              region: "Other Major Cities",
              cities: [
                "Faisalabad",
                "Multan",
                "Peshawar",
                "Quetta",
                "Gujranwala",
              ],
              days: "3-6 Days",
              color: "bg-blue-100 text-blue-800",
              icon: Navigation,
            },
            {
              region: "Remote & Less Accessible Areas",
              cities: [
                "Northern Areas",
                "Gilgit-Baltistan",
                "AJK",
                "Rural Villages",
              ],
              days: "5-9 Days",
              color: "bg-amber-100 text-amber-800",
              icon: Target,
            },
          ],
        },
        {
          content:
            "These are courier-provided estimates, not guaranteed delivery dates.",
          note: true,
        },
        {
          title: "2.2 Peak Season Considerations",
          content: "Timeline extensions during peak periods:",
          points: [
            "Eid festivals and religious holidays",
            "National sales events (11.11, 12.12)",
            "Black Friday and seasonal promotions",
            "Courier operational capacity constraints",
          ],
        },
        {
          content:
            "Mega Prize Mall assumes no liability for courier-caused delays beyond our direct control.",
        },
      ],
    },
    {
      id: "shipping-charges",
      title: "Shipping Charges & Payment Methods",
      description: "Shipping fee structure and payment method-specific charges",
      icon: CreditCard,
      color: "from-purple-500 to-pink-500",
      schemaType: "Fees",
      items: [
        {
          title: "3.1 Shipping Fee Structure",
          content: "Standard shipping charge calculation:",
          points: [
            "Location-based fixed shipping charges",
            "Order value thresholds for free shipping eligibility",
            "Promotional free shipping during specific campaigns",
            "Clear display during checkout process",
          ],
        },
        {
          title: "3.2 COD Service Charges",
          content: "Cash on Delivery additional fees:",
          points: [
            "Courier-imposed COD service charges",
            "Percentage-based or fixed fee structure",
            "Dependent on courier service area policies",
            "Displayed during checkout before confirmation",
          ],
          note: true,
        },
        {
          content:
            "COD availability subject to courier service area restrictions and verification.",
          warning: true,
        },
      ],
    },
    {
      id: "order-confirmation",
      title: "Order Verification & Security Protocols",
      description:
        "Order confirmation, fraud prevention, and verification procedures",
      icon: Shield,
      color: "from-indigo-500 to-blue-500",
      schemaType: "Verification",
      items: [
        {
          content: "Systematic verification process for order security:",
          points: [
            "Shipping address validation and geolocation check",
            "Active contact number verification via SMS/call",
            "Order detail confirmation for accuracy",
            "COD amount and payment method validation",
          ],
        },
        {
          title: "Verification Failure Scenarios",
          content: "Unverified orders face these actions:",
          points: [
            "Processing suspension pending clarification",
            "Automatic cancellation for suspicious patterns",
            "Account review for fraud prevention",
            "Documentation request for high-value orders",
          ],
          important: true,
        },
        {
          content:
            "Accurate contact information is mandatory for order processing completion.",
          note: true,
        },
      ],
    },
    {
      id: "tracking",
      title: "Order Tracking & Status Updates",
      description:
        "Real-time tracking systems and status notification procedures",
      icon: Eye,
      color: "from-cyan-500 to-teal-500",
      schemaType: "Tracking",
      items: [
        {
          content: "Comprehensive tracking provided post-shipment:",
          points: [
            "Tracking link SMS/email within 12-24 hours of shipment",
            "Real-time updates via courier partner systems",
            "Status notifications at key delivery milestones",
            "Estimated delivery date updates",
          ],
        },
        {
          title: "Tracking Limitations",
          content: "Important tracking system considerations:",
          points: [
            "Tracking data controlled by courier partners",
            "Updates may have 12-24 hour delay periods",
            "Technical glitches may temporarily affect tracking",
            "Remote area tracking may have limited updates",
          ],
          warning: true,
        },
        {
          content:
            "Mega Prize Mall cannot modify or override courier-provided tracking information.",
        },
      ],
    },
    {
      id: "delivery-attempts",
      title: "Delivery Attempt Procedures",
      description:
        "Courier delivery attempts, RTS policies, and customer coordination",
      icon: PhoneCall,
      color: "from-amber-500 to-orange-500",
      schemaType: "Attempts",
      items: [
        {
          title: "6.1 Delivery Attempt Protocol",
          content: "Standard delivery attempt methodology:",
          points: [
            "2-3 delivery attempts on consecutive business days",
            "SMS notification before each delivery attempt",
            "Phone contact attempt by delivery personnel",
            "Delivery window communication where possible",
          ],
        },
        {
          title: "Failed Delivery Scenarios",
          content: "Common delivery failure reasons:",
          points: [
            "Unreachable or switched-off contact numbers",
            "Incomplete/incorrect address information",
            "Unavailability at delivery location",
            "Inaccessible delivery locations or security restrictions",
          ],
        },
        {
          title: "6.2 RTS (Return to Sender) Policy",
          content: "Procedure for returned shipments:",
          points: [
            "Full advance payment required for reshipment",
            "Original shipping charges non-refundable",
            "Account review for multiple RTS incidents",
            "Potential future shipping restrictions",
          ],
          critical: true,
        },
      ],
    },
    {
      id: "customer-responsibility",
      title: "Customer Delivery Responsibility",
      description:
        "Mandatory customer actions during delivery and verification requirements",
      icon: Users,
      color: "from-red-500 to-rose-500",
      schemaType: "Responsibility",
      items: [
        {
          content: "Mandatory pre-acceptance checks required:",
          points: [
            "Visual package inspection for external damage",
            "Seal and packaging integrity verification",
            "Recipient name and order detail confirmation",
            "Package weight and dimension verification",
          ],
        },
        {
          title: "Unboxing Video Requirement",
          content: "Critical evidence collection procedure:",
          points: [
            "Continuous video recording from package receipt",
            "Clear visibility of package condition pre-opening",
            "Complete unboxing process without cuts or edits",
            "All package contents displayed and verified",
          ],
          critical: true,
        },
        {
          content:
            "Damage/missing item claims require unboxing video evidence for processing.",
          warning: true,
        },
      ],
    },
    {
      id: "delivery-address",
      title: "Delivery Address Accuracy",
      description:
        "Address requirements, accuracy standards, and customer responsibilities",
      icon: MapPin,
      color: "from-violet-500 to-purple-500",
      schemaType: "Address",
      items: [
        {
          content: "Customer responsibilities for address accuracy:",
          points: [
            "Complete, correct, and reachable physical address",
            "Active contact number with SMS capability",
            "Availability during standard delivery hours",
            "Clear delivery instructions if required",
          ],
        },
        {
          title: "Address Error Consequences",
          content: "Outcomes for address-related issues:",
          points: [
            "Processing delays for address verification",
            "Additional shipping charges for redirection",
            "RTS and reshipment costs for incorrect addresses",
            "Delivery failure and order cancellation",
          ],
          warning: true,
        },
        {
          content:
            "Address correction requests must be submitted before shipment dispatch.",
          note: true,
        },
      ],
    },
    {
      id: "shipping-restrictions",
      title: "Shipping Restrictions & Limitations",
      description:
        "Geographic restrictions, service limitations, and prohibited destinations",
      icon: Globe,
      color: "from-gray-600 to-gray-800",
      schemaType: "Restrictions",
      items: [
        {
          content: "Geographic shipping limitations:",
          points: [
            "Service limited to Pakistan mainland territory",
            "PO Box addresses not supported",
            "Restricted military and sensitive areas",
            "High-risk or blacklisted locations",
          ],
        },
        {
          title: "Service Limitations",
          content: "Additional service restrictions:",
          points: [
            "Remote area delivery subject to courier availability",
            "Special handling requirements for fragile items",
            "Size and weight restrictions for standard shipping",
            "Temperature-controlled items have specific requirements",
          ],
          note: true,
        },
        {
          content:
            "Shipping restrictions are subject to courier partner service area policies.",
        },
      ],
    },
    {
      id: "pre-orders",
      title: "Pre-Orders & Special Order Handling",
      description:
        "Pre-order processing, stock allocation, and special handling procedures",
      icon: Calendar,
      color: "from-pink-500 to-rose-500",
      schemaType: "PreOrder",
      items: [
        {
          title: "10.1 Pre-Order Processing",
          content: "Pre-order specific procedures:",
          points: [
            "Estimated delivery dates clearly displayed",
            "Regular updates on pre-order status",
            "Stock allocation and reservation system",
            "Cancellation options before shipment",
          ],
        },
        {
          title: "10.2 Mixed Order Handling",
          content: "Combination order shipping rules:",
          points: [
            "Separate shipment option with additional charges",
            "Complete order shipment when all items available",
            "Partial shipment option with consent",
            "Shipping charge adjustments for split shipments",
          ],
          note: true,
        },
        {
          content:
            "Pre-order delivery dates are estimates subject to supplier and logistics factors.",
          warning: true,
        },
      ],
    },
    {
      id: "lost-delayed-shipments",
      title: "Lost, Delayed, or Damaged Shipments",
      description:
        "Claims procedures, evidence requirements, and resolution protocols",
      icon: AlertOctagon,
      color: "from-red-600 to-orange-500",
      schemaType: "Claims",
      items: [
        {
          title: "11.1 Lost Package Protocol",
          content: "Lost shipment investigation procedure:",
          points: [
            'Official "lost" status confirmation from courier',
            "7-10 business day investigation period",
            "Resolution options: replacement or full refund",
            "Claim processing after investigation completion",
          ],
        },
        {
          title: "11.2 Delay Responsibility Allocation",
          content: "Delay causes beyond our control:",
          points: [
            "Courier operational issues or system failures",
            "Weather conditions and natural disruptions",
            "Public holidays and festive season volumes",
            "Customs or regulatory clearance delays",
          ],
        },
        {
          title: "11.3 Damage Claim Requirements",
          content: "Mandatory evidence for damage claims:",
          points: [
            "Continuous unboxing video without interruption",
            "Clear photos of damaged packaging from all angles",
            "Detailed product damage documentation",
            "Timestamp evidence and order information",
          ],
          critical: true,
        },
        {
          content:
            "Claims lacking unboxing video evidence are automatically rejected.",
          warning: true,
        },
      ],
    },
    {
      id: "lucky-draw-eligibility",
      title: "Shop-n-Win Contest Eligibility",
      description:
        "Shipping completion requirements for promotional contest participation",
      icon: RefreshCw,
      color: "from-green-600 to-emerald-600",
      schemaType: "Promotion",
      items: [
        {
          title: "12.1 Shipping Completion Mandatory",
          content: "Contest eligibility prerequisites:",
          points: [
            "Successful order dispatch from warehouse",
            "Complete delivery confirmation",
            "No return or cancellation initiation",
            "Full payment verification completion",
          ],
        },
        {
          title: "12.2 Return Impact on Contest",
          content: "Return implications for contest participation:",
          points: [
            "Automatic contest entry cancellation on return",
            'Entry status marked "Invalid - Returned"',
            "Removal from current contest cycle",
            "No exceptions or appeal process",
          ],
          critical: true,
        },
        {
          title: "12.3 Delivery Refusal Consequences",
          content: "Outcomes for delivery refusal:",
          points: [
            "Order cancellation and contest disqualification",
            "No contest entry allocation",
            "Potential refund processing fees",
            "Account review for suspicious patterns",
          ],
          important: true,
        },
      ],
    },
    {
      id: "address-changes",
      title: "Address Modification Procedures",
      description: "Address change requests, timelines, and associated charges",
      icon: Map,
      color: "from-blue-600 to-indigo-600",
      schemaType: "Modification",
      items: [
        {
          content: "Address change policy framework:",
          points: [
            "Changes permitted only pre-shipment",
            "Post-shipment changes not guaranteed",
            "Courier redirection policies vary",
            "Potential additional charges apply",
          ],
        },
        {
          title: "Change Request Process",
          content: "Procedure for address modifications:",
          points: [
            "Immediate customer support contact required",
            "Order status verification for change eligibility",
            "Courier coordination for redirection",
            "Confirmation communication to customer",
          ],
          note: true,
        },
        {
          content:
            "Address change success depends on courier policies and shipment stage.",
          warning: true,
        },
      ],
    },
  ];

  const deliveryEstimates = [
    {
      region: "Metro Cities",
      cities: ["Karachi", "Lahore", "Islamabad"],
      days: "2-4 Days",
      color: "bg-green-100 text-green-800",
    },
    {
      region: "Major Cities",
      cities: ["Faisalabad", "Multan", "Peshawar", "Quetta"],
      days: "3-6 Days",
      color: "bg-blue-100 text-blue-800",
    },
    {
      region: "Other Cities",
      cities: ["Gujranwala", "Sialkot", "Bahawalpur", "Sargodha"],
      days: "4-7 Days",
      color: "bg-purple-100 text-purple-800",
    },
    {
      region: "Remote Areas",
      cities: ["Northern", "Rural", "Less Accessible"],
      days: "5-9 Days",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  const courierPartners = [
    // { name: 'TCS', coverage: 'Nationwide', delivery: '2-7 Days', reliability: 'High' },
    // { name: 'Leopard', coverage: 'Major Cities', delivery: '3-8 Days', reliability: 'High' },
    // { name: 'Call Courier', coverage: 'Metro Cities', delivery: '2-5 Days', reliability: 'High' },
    {
      name: "Trax",
      coverage: "Major Cities",
      delivery: "3-7 Days",
      reliability: "High",
    },
    // { name: 'M&P', coverage: 'Selected Cities', delivery: '4-9 Days', reliability: 'Medium' },
  ];

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shipping Policy - Mega Prize Mall",
    description:
      "Complete shipping policy with delivery timelines, tracking, and unboxing requirements",
    url: "https://megaprizemall.com/shipping-policy",
    datePublished: "2024-01-01T00:00:00Z",
    dateModified: "2026-01-20T00:00:00Z",
    publisher: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    mainEntity: {
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
      },
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
              className="text-[#7C2C78] hover:text-[#A43875] hover:underline flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">Shipping Policy</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Truck className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Shipping Policy
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                Complete delivery guidelines, tracking procedures, and
                Shop-n-Win eligibility requirements.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Processing:</span>
                  <span className="ml-2 font-semibold">24-48 Hours</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Delivery:</span>
                  <span className="ml-2 font-semibold">2-9 Business Days</span>
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
                    🚨 Mandatory: Unboxing Video Required
                  </h3>
                  <p className="text-gray-700 mb-3">
                    For any damage or missing item claims, you{" "}
                    <strong>MUST provide</strong> a continuous, unedited
                    unboxing video showing the entire package opening process.
                  </p>
                  <div className="p-3 bg-white/50 rounded-lg border border-red-200">
                    <p className="text-gray-700 font-medium">
                      Claims without proper unboxing video evidence are
                      automatically rejected.
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
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C2C78] text-white hover:bg-[#A43875] rounded-full text-sm font-medium transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Contact Support
                </a>
              </div>
            </div>

            {/* Delivery Timeline Overview */}
            <div className="mb-12 bg-linear-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                📊 Delivery Timeline Estimates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deliveryEstimates.map((estimate, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-5 border border-green-200 hover:border-green-300 transition-colors"
                  >
                    <div className="text-center">
                      <div
                        className={`inline-block px-3 py-1 ${estimate.color} rounded-full text-sm font-medium mb-3`}
                      >
                        {estimate.region}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {estimate.days}
                      </div>
                      <div className="text-sm text-gray-600">
                        {estimate.cities.map((city, i) => (
                          <span key={i} className="block">
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                *Business days only. Excludes weekends and public holidays.
              </p>
            </div>

            {/* Courier Partners */}
            <div className="mb-12 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                🚚 Our Courier Partners
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Courier Partner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Coverage Area
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Average Delivery Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Reliability Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courierPartners.map((courier, idx) => (
                      <tr key={idx} className="bg-white hover:bg-blue-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {courier.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {courier.coverage}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {courier.delivery}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              courier.reliability === "High"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {courier.reliability}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                              <item.icon className="h-5 w-5 text-[#7C2C78]" />
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
                                    ) : item.important ? (
                                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
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

                            {item.timeline && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {item.timeline.map((time, timeIdx) => (
                                  <div
                                    key={timeIdx}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {time.icon && (
                                        <div
                                          className={`h-8 w-8 rounded-lg ${
                                            time.color.split(" ")[0]
                                          } bg-opacity-20 flex items-center justify-center`}
                                        >
                                          <time.icon
                                            className={`h-4 w-4 ${
                                              time.color.split(" ")[1]
                                            }`}
                                          />
                                        </div>
                                      )}
                                      <div
                                        className={`px-2 py-1 ${time.color} rounded text-xs font-medium`}
                                      >
                                        {time.region}
                                      </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 mb-1">
                                      {time.days}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {time.cities.map((city, cityIdx) => (
                                        <span key={cityIdx} className="block">
                                          {city}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
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
                                        <div className="h-8 w-8 rounded-lg bg-[#7C2C78]/10 flex items-center justify-center shrink-0">
                                          <subpoint.icon className="h-4 w-4 text-[#7C2C78]" />
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
                  <Info className="h-5 w-5 text-purple-600" />
                  Key Shipping Policy Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Processing Time
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      24-48 hours on business days
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">
                        Unboxing Video
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Required for damage claims
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">
                        Shop-n-Win
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Eligible only after delivery
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Delivery Timeline
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      2-9 days based on location
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">
                        COD Available
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Subject to courier availability
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">
                        Tracking Provided
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      SMS/email updates post-shipment
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Shipping Support & Contact
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                  <div className="max-w-3xl">
                    <h3 className="text-xl font-bold mb-4">
                      📞 Shipping Support Channels
                    </h3>
                    <p className="text-white/90 mb-6">
                      For shipping inquiries, tracking issues, or delivery
                      concerns:
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Email Support:
                            </span>
                            <a
                              href="mailto:support@megaprizemall.com"
                              className="text-white/90 hover:text-white"
                            >
                              support@megaprizemall.com
                            </a>
                            <p className="text-sm text-white/80 mt-1">
                              For detailed inquiries and documentation
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
                              For instant messaging and photo sharing
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium block">
                              Phone Support:
                            </span>
                            <span className="text-white/90">
                              +92 325 4007037
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
                            📋 Contact Guidelines for Shipping Issues
                          </p>
                          <p className="text-sm text-white/90">
                            When contacting support regarding shipping, always
                            include: your order number, tracking number (if
                            available), issue description, and relevant
                            photos/videos. This ensures faster resolution and
                            accurate assistance.
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
                    Need assistance with shipping or have delivery questions?
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
                      Contact Shipping Support
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
                  Mandatory Unboxing Video Policy
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
