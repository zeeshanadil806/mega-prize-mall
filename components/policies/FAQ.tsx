// app/(customer)/faq/page.tsx
"use client";
import {
  HelpCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  RefreshCw,
  Gift,
  UserPlus,
  Shield,
  Mail,
  MessageCircle,
  ChevronDown,
  Search,
  FileText,
  Users,
  Wrench,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  Home,
  Star,
  TrendingUp,
  Clock,
  ExternalLink,
  BookOpen,
  Package,
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

  // Initialize with some expanded FAQs for better UX
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(
    new Set(["what-is", "shop-win", "payment-methods", "delivery-time"])
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

  const popularQuestions = useMemo(
    () => [
      {
        id: "shop-win",
        question: "How does Shop-n-Win work?",
        category: "Shop-n-Win",
        popularity: 95,
        icon: Gift,
      },
      {
        id: "returns",
        question: "What is the return policy?",
        category: "Returns",
        popularity: 90,
        icon: RefreshCw,
      },
      {
        id: "delivery",
        question: "How long for delivery?",
        category: "Shipping",
        popularity: 92,
        icon: Truck,
      },
      {
        id: "warranty",
        question: "Do products have warranty?",
        category: "Warranty",
        popularity: 88,
        icon: Shield,
      },
      {
        id: "payment",
        question: "What payment methods?",
        category: "Payments",
        popularity: 94,
        icon: CreditCard,
      },
      {
        id: "account",
        question: "How to create account?",
        category: "General",
        popularity: 85,
        icon: UserPlus,
      },
    ],
    []
  );

  const contactOptions: ContactOption[] = useMemo(
    () => [
      {
        method: "Email Support",
        icon: Mail,
        contact: "support@megaprizemall.com",
        response: "24-48 hours",
        color: "bg-blue-100 text-blue-800",
        description: "For detailed inquiries and documentation",
      },
      {
        method: "WhatsApp Support",
        icon: MessageCircle,
        contact: "+92 325 4007037",
        response: "24 hours",
        color: "bg-green-100 text-green-800",
        description: "Quick assistance and instant messaging",
      },
      {
        method: "Dashboard Messages",
        icon: ShoppingBag,
        contact: "Account Dashboard",
        response: "24-72 hours",
        color: "bg-purple-100 text-purple-800",
        description: "Track and manage all communications",
      },
    ],
    []
  );

  // Search functionality
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            (typeof faq.answer === "string" &&
              faq.answer.toLowerCase().includes(query)) ||
            faq.points?.some((point) => point.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery, categories]);

  // Category selection filtering
  const displayedCategories = selectedCategory
    ? filteredQuestions.filter((cat) => cat.id === selectedCategory)
    : filteredQuestions;

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

      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
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
                  FAQ & Help Center
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
                aria-label="Help Center Icon"
              >
                <HelpCircle className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Help Center & Frequently Asked Questions
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Find answers to common questions about shopping, shipping,
                returns, warranty, and our exclusive Shop-n-Win program.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="search"
                    placeholder="Search for questions (e.g., 'returns', 'delivery', 'payment')..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search FAQ questions"
                  />
                </div>
                <p className="text-white/70 text-sm mt-3">
                  {searchQuery
                    ? `Found ${filteredQuestions.reduce(
                        (acc, cat) => acc + cat.questions.length,
                        0
                      )} results`
                    : "Browse categories or search for specific questions"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Popular Questions */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Most Popular Questions
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Based on customer queries
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularQuestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedCategory(
                        item.category.toLowerCase().replace(" ", "-")
                      );
                      document
                        .getElementById(
                          item.category.toLowerCase().replace(" ", "-")
                        )
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7C2C78] hover:shadow-lg transition-all duration-200 text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-[#7C2C78]/10 transition-colors">
                          <item.icon className="h-5 w-5 text-gray-600 group-hover:text-[#7C2C78] transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold">
                          {item.popularity}%
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#7C2C78] transition-colors mb-2">
                      {item.question}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Click to view answer
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-[#7C2C78] transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? "bg-[#7C2C78] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-linear-to-r " + category.color + " text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    {category.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Options */}
            <section className="mb-12 bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Need Immediate Assistance?
              </h2>
              <p className="text-gray-700 mb-6">
                Connect with our dedicated support team through these channels:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contactOptions.map((option) => (
                  <div
                    key={option.method}
                    className="bg-white rounded-xl p-5 border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          option.color.split(" ")[0]
                        }`}
                      >
                        <option.icon
                          className={`h-6 w-6 ${option.color.split(" ")[1]}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {option.method}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Response: {option.response}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-900 font-medium text-sm mb-2">
                      {option.contact}
                    </p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Categories */}
            <div className="space-y-12">
              {displayedCategories.map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-24"
                  itemScope
                  itemType="https://schema.org/FAQPage"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`h-12 w-12 rounded-xl bg-linear-to-r ${category.color} flex items-center justify-center`}
                    >
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {category.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {category.description}
                      </p>
                      <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((faq) => (
                      <div
                        key={faq.id}
                        id={faq.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                        itemScope
                        itemType="https://schema.org/Question"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                          aria-expanded={expandedFaqs.has(faq.id)}
                          aria-controls={`answer-${faq.id}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-[#7C2C78]/10 flex items-center justify-center shrink-0 mt-1">
                              <span className="text-[#7C2C78] font-bold text-sm">
                                Q
                              </span>
                            </div>
                            <div>
                              <h3
                                className="text-lg font-semibold text-gray-900 mb-2"
                                itemProp="name"
                              >
                                {faq.question}
                              </h3>
                              {faq.popularity && faq.popularity > 80 && (
                                <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 fill-amber-500" />
                                  <span>
                                    Popular Question ({faq.popularity}%)
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedFaqs.has(faq.id) ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedFaqs.has(faq.id) && (
                          <div
                            id={`answer-${faq.id}`}
                            className="px-6 pb-6"
                            itemScope
                            itemProp="acceptedAnswer"
                            itemType="https://schema.org/Answer"
                          >
                            <div className="flex gap-4">
                              <div className="h-8 w-8 shrink-0"></div>
                              <div className="flex-1">
                                <div itemProp="text">
                                  {typeof faq.answer === "string" ? (
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                      {faq.answer}
                                    </p>
                                  ) : faq.points ? (
                                    <div className="space-y-4">
                                      <p className="text-gray-700 leading-relaxed">
                                        {faq.answer}
                                      </p>
                                      <ul className="space-y-3">
                                        {faq.points.map((point, pointIdx) => (
                                          <li
                                            key={pointIdx}
                                            className="flex items-start gap-3"
                                          >
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-gray-700 leading-relaxed">
                                              {point}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-gray-700 leading-relaxed">
                                      {faq.answer}
                                    </p>
                                  )}

                                  {faq.note && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <div className="flex items-start gap-2">
                                        <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">
                                          {faq.note}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {faq.warning && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-700">
                                          {faq.warning}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {faq.important && (
                                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 font-medium">
                                          ⚠️ Important Information
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* No Results State */}
              {searchQuery && displayedCategories.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Results Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn&apos;t find any FAQs matching &quot;{searchQuery}
                    &quot;
                  </p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="border-[#7C2C78] text-[#7C2C78] hover:bg-[#7C2C78]/10"
                  >
                    Clear Search
                  </Button>
                </div>
              )}

              {/* Contact Section */}
              <section className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-bold mb-6">Still Need Help?</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">
                        📞 Contact Information
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <Mail className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Email Support</p>
                            <Link
                              href="mailto:support@megaprizemall.com"
                              className="text-white/90 hover:text-white"
                            >
                              support@megaprizemall.com
                            </Link>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <MessageCircle className="h-5 w-5" />
                          <div>
                            <p className="font-medium">WhatsApp</p>
                            <Link
                              href="https://wa.me/923254007037"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/90 hover:text-white inline-flex items-center gap-1"
                            >
                              +92 325 4007037
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">
                        💡 Tips for Quick Resolution
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                          <span>Have your order number ready</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                          <span>Include photos for product issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                          <span>Describe issue with specific details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-1 shrink-0" />
                          <span>Check spam folder for our emails</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-white/10 rounded-lg">
                    <p className="text-sm">
                      <strong>Response Time Commitment:</strong> We aim to
                      respond to all inquiries within 24 hours during business
                      days. For urgent matters, please include
                      &quot;URGENT&quot; in your subject line.
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Resources */}
              <section className="bg-linear-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📚 Related Resources & Policies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/privacy-policy" className="group">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7C2C78] transition-colors h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-5 w-5 text-gray-600 group-hover:text-[#7C2C78] transition-colors" />
                        <span className="font-medium text-gray-900 group-hover:text-[#7C2C78] transition-colors">
                          Privacy Policy
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        How we protect your personal data and privacy rights
                      </p>
                    </div>
                  </Link>
                  <Link href="/terms-and-conditions" className="group">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7C2C78] transition-colors h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-600 group-hover:text-[#7C2C78] transition-colors" />
                        <span className="font-medium text-gray-900 group-hover:text-[#7C2C78] transition-colors">
                          Terms & Conditions
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Complete terms of service and platform usage guidelines
                      </p>
                    </div>
                  </Link>
                  <Link href="/warranty-policy" className="group">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7C2C78] transition-colors h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-gray-600 group-hover:text-[#7C2C78] transition-colors" />
                        <span className="font-medium text-gray-900 group-hover:text-[#7C2C78] transition-colors">
                          Warranty Policy
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Detailed product warranty coverage and claim procedures
                      </p>
                    </div>
                  </Link>
                  <Link href="/returns-refunds-policy" className="group">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7C2C78] transition-colors h-full">
                      <div className="flex items-center gap-3 mb-2">
                        <RefreshCw className="h-5 w-5 text-gray-600 group-hover:text-[#7C2C78] transition-colors" />
                        <span className="font-medium text-gray-900 group-hover:text-[#7C2C78] transition-colors">
                          Returns & Refunds
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Comprehensive return, exchange, and refund procedures
                      </p>
                    </div>
                  </Link>
                </div>
              </section>

              {/* Call to Action */}
              <div className="text-center space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Didn&apos;t find your answer? Our support team is ready to
                    help you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button
                      onClick={() =>
                        document
                          .querySelector("#contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="bg-[#7C2C78] hover:bg-[#A43875] text-white px-8"
                    >
                      Contact Support Team
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
                  Last Updated: January 2026 | Total Questions:{" "}
                  {categories.reduce(
                    (acc, cat) => acc + cat.questions.length,
                    0
                  )}
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
