"use client";

import { STORE_CONFIG } from "@/shared/config";
import {
  ChevronDown,
  Search,
  X,
  Mail,
  MessageCircle,
  Home,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  CreditCard,
  Truck,
  RefreshCw,
  Gift,
  Users,
  Shield,
  Wrench,
} from "lucide-react";
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
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  schemaType?: string;
  questions: {
    id: string;
    question: string;
    answer: string | React.ReactNode;
    points?: string[];
    note?: string;
    warning?: string;
    important?: boolean;
    relatedCategories?: string[];
    popularity?: number;
  }[];
}

interface ContactOption {
  method: string;
  icon: React.ComponentType<{ className?: string }>;
  contact: string;
  response: string;
  color: string;
  description: string;
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  //   const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // FAQ Schema Data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  };

  // Initialize with 1 expanded FAQ for clean mobile view without scroll fatigue
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(
    new Set(["what-is"])
  );

  // Wrap categories in useMemo to prevent unnecessary re-renders
  const categories: FAQCategory[] = useMemo(
    () => [
      {
        id: "general",
        title: "General Questions",
        description:
          "Common questions about Mega Prize Mall platform and services",
        icon: HelpCircle,
        color: "from-blue-500 to-cyan-500",
        schemaType: "General",
        questions: [
          {
            id: "what-is",
            question: "What is Mega Prize Mall?",
            answer:
              "Mega Prize Mall is a leading e-commerce platform specializing in mobile accessories, consumer electronics, gadgets, gaming products, wearables, and tech accessories. We provide secure payments, fast shipping, and exclusive promotional rewards including our innovative Shop-n-Win program.",
            popularity: 95,
          },
          {
            id: "create-account",
            question: "How do I create an account?",
            answer:
              "Follow these simple steps to create your Mega Prize Mall account:",
            points: [
              'Click "Sign Up" button on homepage header navigation',
              "Enter valid email address and mobile number",
              "Create strong password with minimum 8 characters",
              "Verify contact information via OTP/SMS confirmation",
              "Complete profile with shipping address and preferences",
            ],
            note: "Account creation is mandatory for placing orders, tracking purchases, and participating in Shop-n-Win program.",
            popularity: 85,
          },
          {
            id: "international",
            question: "Is Mega Prize Mall available outside Pakistan?",
            answer:
              "Currently, we only deliver within Pakistan to all major cities and remote areas. International shipping is not available at this time. We plan to expand to Middle East and other regions in 2026.",
            note: "Subscribe to our newsletter for international expansion updates.",
            popularity: 45,
          },
          {
            id: "business-hours",
            question: "What are your business hours?",
            answer: "Our customer support operates during these hours:",
            points: [
              "Monday - Saturday: 9:00 AM - 6:00 PM (PKT)",
              "Sunday: 10:00 AM - 4:00 PM (PKT)",
              "Public Holidays: Limited email support available",
              "24/7: Order placement and tracking available",
            ],
            note: "Response times may vary during peak seasons and holidays.",
            popularity: 60,
          },
        ],
      },
      {
        id: "orders-payments",
        title: "Orders & Payments",
        description:
          "Questions about placing orders, payment methods, and transaction security",
        icon: CreditCard,
        color: "from-green-500 to-emerald-500",
        schemaType: "Payment",
        questions: [
          {
            id: "payment-methods",
            question: "What payment methods are accepted?",
            answer:
              "We accept multiple secure payment options for customer convenience:",
            points: [
              "Credit/Debit Cards (Visa, MasterCard, UnionPay) - PCI DSS compliant",
              "Bank Transfers (Online banking, IBAN transfers)",
              "Cash on Delivery (COD) - Available nationwide",
              "Mobile Wallets (JazzCash, Easypaisa, SadaPay)",
              "UPI/QR Code Payments (where available)",
              "Installment Plans (Partner banks, subject to approval)",
            ],
            note: "All transactions are encrypted using 256-bit SSL encryption for maximum security.",
            popularity: 90,
          },
          {
            id: "cancel-order",
            question: "Can I cancel or modify an order?",
            answer: "Order modification depends on current order status:",
            points: [
              "Pending orders: Can be cancelled freely within 1 hour",
              "Processing orders: Contact support immediately for cancellation",
              "Shipped orders: Cannot be cancelled; initiate return after delivery",
              "COD orders: Can be rejected at delivery without penalty",
              "Address changes: Only possible before dispatch",
            ],
            note: "Check real-time order status in your dashboard for cancellation eligibility.",
            warning:
              "Shop-n-Win entries may be affected by order cancellations.",
            popularity: 80,
          },
          {
            id: "track-order",
            question: "How do I track my order status?",
            answer:
              "Multiple tracking options available for complete visibility:",
            points: [
              "Dashboard: Log in → Orders → View Details → Track Order",
              "SMS Updates: Automated notifications from courier partners",
              "Email Tracking: Click tracking links in order confirmation emails",
              "Courier Apps: Use tracking number on partner websites/apps",
              "Support: Contact us with order number for manual tracking",
            ],
            note: "Tracking numbers are provided within 24 hours of dispatch.",
            popularity: 75,
          },
          {
            id: "order-confirmation",
            question: "When will I receive order confirmation?",
            answer: "Order confirmations are sent immediately:",
            points: [
              "Email confirmation: Instant upon successful payment",
              "SMS notification: Within 5 minutes for mobile number verification",
              "Dashboard update: Real-time order status in account",
              "Invoice generation: Available in dashboard for download",
            ],
            note: "Check spam folder if email not received within 15 minutes.",
            popularity: 65,
          },
        ],
      },
      {
        id: "shipping-delivery",
        title: "Shipping & Delivery",
        description:
          "Information about shipping timelines, charges, and delivery procedures",
        icon: Truck,
        color: "from-amber-500 to-orange-500",
        schemaType: "Delivery",
        questions: [
          {
            id: "delivery-time",
            question: "How long does delivery take?",
            answer: "Delivery timelines vary based on location and order type:",
            points: [
              "Major cities (Karachi, Lahore, Islamabad): 2–4 business days",
              "Metro cities (Rawalpindi, Faisalabad, Multan): 3–5 business days",
              "Other cities & towns: 4–7 business days",
              "Remote areas & villages: 5–6 business days",
              "Express shipping: 1-2 days (additional charges apply)",
            ],
            note: "Delays may occur due to courier limitations, weather conditions, public holidays, or customs clearance.",
            warning:
              "These are estimated timelines, not guaranteed delivery dates.",
            popularity: 95,
          },
          {
            id: "shipping-charges",
            question: "Are there shipping charges?",
            answer:
              "Shipping charges are calculated based on multiple factors:",
            points: [
              "Delivery location and distance from fulfillment center",
              "Order value and total weight/dimensions",
              "Courier service type (standard vs express)",
              "Special handling requirements (fragile, high-value)",
              "Free shipping thresholds (varies by promotion)",
            ],
            note: "Free shipping is available on orders above specific amounts. Check product page for current offers.",
            popularity: 70,
          },
          {
            id: "delivery-attempt",
            question: "What happens if I miss delivery?",
            answer: "Our courier partners follow this delivery protocol:",
            points: [
              "First attempt: Primary delivery with phone notification",
              "Second attempt: Next business day delivery",
              "Third attempt: Final delivery attempt with advance notice",
              "Hold option: Request hold at nearest courier facility",
              "Rescheduling: Available via courier partner app/website",
            ],
            warning:
              "If undelivered after 3 attempts, package returns to sender. Re-shipping requires additional charges.",
            popularity: 60,
          },
          {
            id: "multiple-items-delivery",
            question: "Will all items in my order arrive together?",
            answer: "Delivery depends on item availability and location:",
            points: [
              "Single warehouse items: Usually shipped together",
              "Multiple vendor items: May ship separately",
              "Pre-order items: Shipped when available",
              "Backordered items: Shipped when restocked",
            ],
            note: "Shipping notifications are sent for each package separately.",
            popularity: 55,
          },
        ],
      },
      {
        id: "returns-warranty",
        title: "Returns, Refunds & Warranty",
        description:
          "Policies for returns, refunds, and product warranty claims",
        icon: RefreshCw,
        color: "from-red-500 to-rose-500",
        schemaType: "ReturnPolicy",
        questions: [
          {
            id: "request-return",
            question: "How do I request a return or refund?",
            answer: "Submit return/refund requests through these methods:",
            points: [
              "Dashboard Portal: Orders → Return Request → Upload evidence → Submit",
              "Email: support@megaprizemall.com with subject: Return Request #[Order Number]",
              "WhatsApp: Send order number + photos/videos to support number",
              "Mobile App: Use in-app support chat feature",
            ],
            note: "All claims require clear photographic/video evidence of defects for verification.",
            important: true,
            popularity: 85,
          },
          {
            id: "return-shop-win",
            question: "Can I return a product purchased under Shop-n-Win?",
            answer:
              "Returns are accepted if eligible, but Shop-n-Win rules apply:",
            points: [
              "Shop-n-Win entry for returned product is automatically cancelled",
              "Prize eligibility becomes void immediately",
              "Assigned prizes (if any) become invalid",
              "New winner selected from remaining valid entries",
              "No prize transfer to replacement products",
            ],
            warning:
              "This policy prevents system manipulation and ensures fairness for all participants.",
            important: true,
            popularity: 75,
          },
          {
            id: "product-warranty",
            question: "Do products come with warranty?",
            answer: "Warranty coverage varies by product category:",
            points: [
              "Branded electronics: Manufacturer warranty (6-24 months)",
              "Mega Prize Mall products: Replacement warranty (7-30 days)",
              "Accessories: Limited warranty (3-6 months)",
              "Clearance/special offers: No warranty (as-is basis)",
            ],
            note: "Check product description page for specific warranty details and review our comprehensive Warranty Policy.",
            popularity: 80,
          },
          {
            id: "refund-timeline",
            question: "How long do refunds take?",
            answer: "Refund processing timelines vary by payment method:",
            points: [
              "Credit/Debit Cards: 7-14 business days",
              "Bank Transfers: 3-5 business days",
              "Mobile Wallets: 1-2 business days",
              "COD Refunds: Store credit or bank transfer",
            ],
            note: "Refunds begin after return inspection and approval.",
            popularity: 70,
          },
        ],
      },
      {
        id: "shop-n-win",
        title: "Shop-n-Win / Lucky Draw",
        description: "Questions about our promotional program and prize draws",
        icon: Gift,
        color: "from-purple-500 to-pink-500",
        schemaType: "Promotion",
        questions: [
          {
            id: "what-is-shop-win",
            question: "What is Shop-n-Win?",
            answer: "Shop-n-Win is our innovative promotional loyalty program:",
            points: [
              "Eligible purchases earn automatic entries into prize draws",
              "Not a lottery, gambling, or chance-based game",
              "Participation is completely free with eligible orders",
              "Multiple prize tiers and categories available",
              "Transparent winner selection and announcement process",
            ],
            note: "Program is governed by our official Terms & Conditions.",
            popularity: 90,
          },
          {
            id: "qualify-shop-win",
            question: "How do I qualify for Shop-n-Win?",
            answer: "Automatic qualification requires meeting all criteria:",
            points: [
              "Order must be fully paid (prepaid or successful COD)",
              "Successful delivery to verified address",
              "No cancellations, returns, or refunds on order",
              "Order placed during active promotional period",
              "Compliance with all terms and conditions",
            ],
            note: "Entries are automatically awarded within 24 hours of successful delivery.",
            popularity: 80,
          },
          {
            id: "return-impact-shop-win",
            question: "What happens if I return a Shop-n-Win product?",
            answer: "Critical Shop-n-Win rules regarding returns:",
            points: [
              "Shop-n-Win entry automatically voided upon return initiation",
              "All prize eligibility becomes immediately invalid",
              "Previously assigned prizes (if any) become void",
              "New winner selected from remaining valid entries",
              "No exceptions or special considerations granted",
            ],
            warning:
              "This policy ensures system integrity and fairness for all participants.",
            important: true,
            popularity: 85,
          },
          {
            id: "winner-notification",
            question: "How are winners notified?",
            answer: "Winner notification follows this transparent process:",
            points: [
              "Email notification to registered email address",
              "SMS confirmation to verified mobile number",
              "Dashboard announcement with winner list",
              "Social media announcement (with consent)",
              "Public winner list on website (first name, initial)",
            ],
            note: "Winners must respond within 72 hours to claim prize.",
            popularity: 65,
          },
        ],
      },
      {
        id: "vendor-seller",
        title: "Vendor & Seller Program",
        description:
          "Information for sellers and vendors about partnership opportunities",
        icon: Users,
        color: "from-indigo-500 to-blue-500",
        schemaType: "Business",
        questions: [
          {
            id: "become-vendor",
            question: "How can I become a Mega Prize Mall vendor?",
            answer: "Follow these steps to become an approved vendor:",
            points: [
              "Complete Vendor Application Form online",
              "Submit business registration and tax documents",
              "Provide identity verification for all partners",
              "Product catalog and inventory verification",
              "Quality assurance and compliance review",
            ],
            note: "Application review typically takes 7-10 business days.",
            popularity: 50,
          },
          {
            id: "sell-products",
            question: "What products can I sell?",
            answer: "Approved product categories for vendors:",
            points: [
              "Mobile Accessories (cases, chargers, cables)",
              "Consumer Electronics (gadgets, tech products)",
              "Wearables (smartwatches, fitness bands)",
              "Gaming Products (controllers, accessories)",
              "Audio Devices (headphones, speakers)",
              "Computer Accessories (keyboards, mice, components)",
            ],
            note: "All products must be original, authentic, and meet quality standards.",
            popularity: 55,
          },
          {
            id: "vendor-payouts",
            question: "How do vendor payouts work?",
            answer: "Transparent vendor payout process:",
            points: [
              "Payouts processed after order fulfillment verification",
              "Return/refund period clearance before payment",
              "Multiple payment methods (bank transfer, mobile wallet)",
              "Scheduled payout cycles (weekly, bi-weekly, monthly)",
              "Detailed payout statements with commission breakdown",
            ],
            note: "Refer to Vendor Agreement for specific payout terms.",
            popularity: 60,
          },
        ],
      },
      {
        id: "security-privacy",
        title: "Security & Privacy",
        description:
          "Questions about data protection, privacy, and account security",
        icon: Shield,
        color: "from-green-600 to-emerald-600",
        schemaType: "Privacy",
        questions: [
          {
            id: "data-safety",
            question: "Is my personal and payment data safe?",
            answer: "We implement comprehensive security measures:",
            points: [
              "End-to-end SSL/TLS encryption for all data transmission",
              "PCI DSS compliant payment processing",
              "Regular security audits and penetration testing",
              "Two-factor authentication for account security",
              "Strict data access controls and monitoring",
            ],
            note: "Review our detailed Privacy Policy for complete information.",
            popularity: 75,
          },
          {
            id: "opt-out-marketing",
            question: "How can I manage marketing communications?",
            answer: "Complete control over marketing preferences:",
            points: [
              "Unsubscribe link in every promotional email",
              "Communication preferences in account settings",
              "Support request for immediate opt-out",
              "Customization during account creation/update",
              "Category-specific subscription management",
            ],
            note: "Transactional emails (order updates) cannot be opted out.",
            popularity: 55,
          },
        ],
      },
      {
        id: "technical-issues",
        title: "Technical Support",
        description:
          "Solutions for website errors, app issues, and technical problems",
        icon: Wrench,
        color: "from-gray-600 to-gray-800",
        schemaType: "TechSupport",
        questions: [
          {
            id: "website-errors",
            question: "What if I face website errors or failed transactions?",
            answer: "Troubleshooting steps for technical issues:",
            points: [
              "Contact support immediately with screenshots",
              "Clear browser cache and cookies",
              "Try different browser or incognito mode",
              "Update browser to latest version",
              "Check internet connection stability",
            ],
            note: "Technical team aims to resolve issues within 24-48 hours.",
            popularity: 65,
          },
          {
            id: "supported-browsers",
            question: "Which browsers and devices are supported?",
            answer: "Optimal experience on these platforms:",
            points: [
              "Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+",
              "Mobile: iOS 14+, Android 10+",
              "Tablets: iPadOS 14+, Android Tablet 10+",
              "Desktop: Windows 10+, macOS 11+",
              "Mobile App: Available on iOS App Store and Google Play",
            ],
            note: "Older versions may experience limited functionality.",
            popularity: 50,
          },
        ],
      },
    ],
    []
  ); // Empty dependency array means this only runs once

  // Search functionality
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase().trim();
    return categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            (typeof faq.answer === "string" &&
              faq.answer.toLowerCase().includes(query)) ||
            faq.points?.some((point) => point.toLowerCase().includes(query)) ||
            category.title.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery, categories]);

  // Category selection filtering
  const displayedCategories = useMemo(() => {
    if (selectedCategory) {
      return filteredQuestions.filter((cat) => cat.id === selectedCategory);
    }
    return filteredQuestions;
  }, [selectedCategory, filteredQuestions]);

  const totalResultCount = useMemo(() => {
    return filteredQuestions.reduce(
      (acc, cat) => acc + cat.questions.length,
      0
    );
  }, [filteredQuestions]);

  // Toggle FAQ expansion
  const toggleFaq = (faqId: string) => {
    setExpandedFaqs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (catId: string | null) => {
    setSelectedCategory(catId);
    setSearchQuery("");
    setTimeout(() => {
      const contentEl = document.getElementById("faq-content-area");
      if (contentEl) {
        contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  // Generate FAQ Schema
  // Generate FAQ Schema
  // Generate FAQ Schema
  useEffect(() => {
    // Define proper types for the schema structure
    interface FAQSchema {
      "@context": string;
      "@type": "FAQPage";
      mainEntity: Array<{
        "@type": "Question";
        name: string;
        acceptedAnswer: {
          "@type": "Answer";
          text: string;
        };
      }>;
    }

    // Create a fresh schema object inside useEffect to avoid mutating the original
    const schema: FAQSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [],
    };

    const allQuestions = categories.flatMap((category) =>
      category.questions.map((faq) => ({
        "@type": "Question" as const,
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text:
            typeof faq.answer === "string"
              ? faq.answer
              : faq.points
              ? `${faq.answer}\n${faq.points.join("\n")}`
              : "",
        },
      }))
    );

    schema.mainEntity = allQuestions.slice(0, 10); // Limit to 10 for performance

    // Breadcrumb structured data - keep this separate
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList" as const,
      itemListElement: [
        {
          "@type": "ListItem" as const,
          position: 1,
          name: "Home",
          item: "https://megaprizemall.com",
        },
        {
          "@type": "ListItem" as const,
          position: 2,
          name: "FAQ",
          item: "https://megaprizemall.com/faq",
        },
      ],
    };

    // Store references to the scripts we create
    const faqScript = document.createElement("script");
    faqScript.type = "application/ld+json";
    faqScript.text = JSON.stringify(schema);
    faqScript.id = "faq-structured-data";
    document.head.appendChild(faqScript);

    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.text = JSON.stringify(breadcrumbData);
    breadcrumbScript.id = "breadcrumb-structured-data";
    document.head.appendChild(breadcrumbScript);

    // Cleanup function
    return () => {
      // Safely remove the scripts by ID
      const existingFaqScript = document.getElementById("faq-structured-data");
      const existingBreadcrumbScript = document.getElementById(
        "breadcrumb-structured-data"
      );

      if (existingFaqScript && existingFaqScript.parentNode) {
        existingFaqScript.parentNode.removeChild(existingFaqScript);
      }
      if (existingBreadcrumbScript && existingBreadcrumbScript.parentNode) {
        existingBreadcrumbScript.parentNode.removeChild(
          existingBreadcrumbScript
        );
      }
    };
  }, [categories]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased">
        <Header />

        {/* ── 1. Clean, Compact Navy Header ── */}
        <section className="bg-[#011b54] text-white py-8 sm:py-10">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Breadcrumb */}
            <div className="mb-3">
              <Breadcrumb>
                <BreadcrumbList className="text-white/70 text-xs">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="/"
                      className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      <Home className="h-3 w-3" />
                      Home
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-white/30" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium text-white text-xs">
                      FAQ & Help Center
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5 text-white">
              Help Center & FAQ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-5">
              Find quick answers about orders, payments, shipping, warranty, and returns.
            </p>

            {/* Minimal Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search questions (e.g. 'returns', 'cash on delivery', 'warranty')..."
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-white/20 transition-all shadow-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search FAQ"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Clean Horizontal Category Bar (Sticky) ── */}
        <div className="sticky top-[64px] lg:top-[70px] z-30 bg-white border-b border-gray-200 shadow-xs">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => handleSelectCategory(null)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-[#011b54] text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                All Topics
              </button>

              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() =>
                      handleSelectCategory(isSelected ? null : category.id)
                    }
                    className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-[#011b54] text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {category.title.replace(" Questions", "")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Compact Questions Section ── */}
        <main id="faq-content-area" className="container mx-auto px-4 max-w-3xl py-6 sm:py-8">
          {/* Search Result Info */}
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between text-xs text-gray-600">
              <span>
                Found <strong>{totalResultCount}</strong> matching question{totalResultCount === 1 ? "" : "s"}
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#011b54] font-medium hover:underline flex items-center gap-1"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Active Category Filter Header */}
          {selectedCategory && !searchQuery && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {categories.find((c) => c.id === selectedCategory)?.title}
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#011b54] font-medium hover:underline"
              >
                View all topics
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {displayedCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-32">
                {!selectedCategory && !searchQuery && (
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                    {category.title}
                  </h2>
                )}

                <div className="space-y-2">
                  {category.questions.map((faq) => {
                    const isExpanded = expandedFaqs.has(faq.id);
                    return (
                      <div
                        key={faq.id}
                        id={faq.id}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-gray-900 hover:text-[#011b54] transition-colors"
                          aria-expanded={isExpanded}
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-[#011b54]" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-3.5 pt-1 border-t border-gray-100 bg-gray-50/50 text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {typeof faq.answer === "string" ? (
                              <p>{faq.answer}</p>
                            ) : faq.points ? (
                              <div className="space-y-2">
                                <p>{faq.answer}</p>
                                <ul className="space-y-1.5 pl-1">
                                  {faq.points.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#011b54] mt-1.5 shrink-0" />
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p>{faq.answer}</p>
                            )}

                            {faq.note && (
                              <div className="mt-2.5 p-2.5 bg-blue-50/70 border border-blue-100 rounded text-xs text-blue-900">
                                <strong>Note:</strong> {faq.note}
                              </div>
                            )}

                            {faq.warning && (
                              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                                <strong>Warning:</strong> {faq.warning}
                              </div>
                            )}

                            {faq.important && (
                              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-900">
                                <strong>Important:</strong> Please review before ordering.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Empty State */}
            {searchQuery && displayedCategories.length === 0 && (
              <div className="text-center py-10 bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  No matching answers found
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Try searching for something else or ask our support team directly.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 text-xs font-semibold text-[#011b54] border border-[#011b54] rounded-md hover:bg-[#011b54]/5 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* ── 4. Compact 1-Line Support Strip ── */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                Still have questions?
              </p>
              <p className="text-xs text-gray-500">
                Karachi support desk is active Mon – Sat (10:00 AM – 8:00 PM PKT).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={STORE_CONFIG.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                WhatsApp
              </a>
              <a
                href={`mailto:${STORE_CONFIG.supportEmail}`}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            </div>
          </div>
        </main>

        <CustomerFooter />
      </div>
    </>
  );
}
