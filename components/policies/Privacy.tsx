// app/(customer)/privacy-policy/page.tsx
"use client";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Mail,
  Phone,
  Globe,
  Cookie,
  UserCheck,
  Truck,
  CreditCard,
  Bell,
  LucideIcon,
  ArrowUp,
  ExternalLink,
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

type SectionItem =
  | string
  | {
      title: string;
      description: string;
    }
  | {
      icon: LucideIcon;
      title: string;
      description: string;
    };

interface Section {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  items: SectionItem[];
  schemaType?: string;
}

export default function PrivacyPolicyPage() {
  //   const [lastUpdated, setLastUpdated] = useState('December 15, 2025');
  //   const [effectiveDate, setEffectiveDate] = useState('December 20, 2025');
  const lastUpdated = "Jan 1, 2026";
  const effectiveDate = "Jan 1, 2026";
  // Structured data for JSON-LD
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: "Privacy Policy - Mega Prize Mall",
    description:
      "Privacy policy detailing data collection, usage, and protection practices at Mega Prize Mall",
    datePublished: "2024-01-01",
    dateModified: "2025-12-15",
    publisher: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
      logo: "https://megaprizemall.com/logo.png",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://megaprizemall.com/privacy",
    },
  };

  const sections: Section[] = [
    {
      id: "information-collection",
      title: "Information We Collect",
      description:
        "Details about personal and automated data collection at Mega Prize Mall",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      schemaType: "ItemList",
      items: [
        {
          title: "Personal Information You Provide",
          description:
            "Name, email address, phone number, shipping address, billing details (securely processed through PCI-compliant gateways), order history, account credentials, and communication preferences.",
        },
        {
          title: "Automatically Collected Data",
          description:
            "IP address, device information (model, OS), browser type, pages viewed, time spent, shopping cart activity, click patterns, referral sources, and geolocation (with consent).",
        },
        {
          title: "Third-Party Sources",
          description:
            "Payment gateways (Stripe, PayPal), delivery partners (FedEx, DHL), analytics providers (Google Analytics 4), marketing platforms, and social media integrations.",
        },
      ],
    },
    {
      id: "data-usage",
      title: "How We Use Your Information",
      description: "Purposes for processing customer data at Mega Prize Mall",
      icon: Eye,
      color: "from-purple-500 to-pink-500",
      schemaType: "HowTo",
      items: [
        {
          icon: Truck,
          title: "Order Processing & Delivery",
          description:
            "Process purchases, calculate taxes, ship items, provide real-time tracking updates, and handle returns/exchanges.",
        },
        {
          icon: UserCheck,
          title: "Account & Customer Support",
          description:
            "Create and maintain your account, verify identity, respond to support requests (average 2-hour response time), and manage loyalty programs.",
        },
        {
          icon: Bell,
          title: "Lucky Draw & Prize Programs",
          description:
            "Register competition entries, verify winners through secure algorithms, contact for prize delivery, and publish winner announcements (with consent).",
        },
        {
          icon: CreditCard,
          title: "Security & Fraud Prevention",
          description:
            "Prevent payment fraud using machine learning algorithms, detect suspicious activity, comply with legal obligations (GDPR, CCPA), and maintain transaction records for 7 years as required by law.",
        },
        {
          icon: Bell,
          title: "Personalization & Marketing",
          description:
            "Send personalized product recommendations, promotional offers (opt-out available), and relevant content based on shopping behavior.",
        },
      ],
    },
    {
      id: "data-protection",
      title: "How We Protect Your Data",
      description:
        "Security measures implemented to safeguard customer information",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      items: [
        "End-to-end encrypted data transmission using 256-bit SSL/TLS certificates",
        "PCI-DSS compliant payment processing - we never store full credit card details",
        "Role-based access control with multi-factor authentication for staff",
        "Quarterly security audits and penetration testing by third-party experts",
        "AES-256 encrypted servers with daily automated backups",
        "Advanced Web Application Firewall (WAF) and DDoS protection",
        "Regular security training for all employees handling customer data",
      ],
    },
    {
      id: "cookies-tracking",
      title: "Cookies & Tracking Technologies",
      description: "Use of cookies and similar technologies on Mega Prize Mall",
      icon: Cookie,
      color: "from-amber-500 to-orange-500",
      items: [
        "Essential cookies: Maintain user sessions and shopping cart data",
        "Preference cookies: Remember language, currency, and display settings",
        "Analytics cookies: Track site performance using anonymized data",
        "Marketing cookies: Personalized recommendations and retargeting (opt-out available)",
        "Third-party cookies: Social media integrations and payment processors",
        "Local storage: Cache frequently accessed data for faster loading",
      ],
    },
    {
      id: "data-rights",
      title: "Your Data Protection Rights",
      description:
        "Legal rights available to customers under privacy regulations",
      icon: Lock,
      color: "from-red-500 to-rose-500",
      items: [
        "Right to Access: Request a copy of your personal data in machine-readable format (GDPR Article 15)",
        "Right to Rectification: Correct inaccurate or incomplete information (GDPR Article 16)",
        "Right to Erasure: Request deletion of personal data under certain conditions (GDPR Article 17)",
        "Right to Restrict Processing: Limit how we use your data (GDPR Article 18)",
        "Right to Object: Opt-out of marketing communications and certain processing (GDPR Article 21)",
        "Right to Data Portability: Receive your data in structured, commonly used format (GDPR Article 20)",
        "Right to Withdraw Consent: Revoke previously given consent at any time",
        "Right to Non-Discrimination: Not receive discriminatory treatment for exercising rights (CCPA Section 1798.125)",
      ],
    },
    {
      id: "data-sharing",
      title: "Third-Party Data Sharing",
      description: "Partners and services with whom we share customer data",
      icon: ExternalLink,
      color: "from-indigo-500 to-blue-500",
      items: [
        "Payment Processors: SafePay - for secure transaction processing",
        "Shipping Partners: Trax - for order delivery and tracking",
        "Analytics Services: Google Analytics, Hotjar - for website optimization",
        "Marketing Platforms: Mailchimp, Meta Business Suite - for communications",
        "Cloud Services: AWS, Cloudflare - for hosting and security",
        "Customer Support: Zendesk, Intercom - for assistance and queries",
      ],
    },
  ];

  // Helper functions
  const hasIcon = (
    item: SectionItem
  ): item is { icon: LucideIcon; title: string; description: string } => {
    return typeof item !== "string" && "icon" in item;
  };

  const isObjectItem = (
    item: SectionItem
  ): item is { title: string; description: string } => {
    return typeof item !== "string";
  };

  // Schema.org BreadcrumbList
  const breadcrumbStructuredData = {
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
        name: "Privacy Policy",
        item: "https://megaprizemall.com/privacy",
      },
    ],
  };

  // Add JSON-LD to page
  useEffect(() => {
    // Add structured data script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.text = JSON.stringify(breadcrumbStructuredData);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(breadcrumbScript);
    };
  }, []);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
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
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">
                  Privacy Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Hero Section with Semantic HTML */}
        <header className="bg-linear-to-r from-[#7C2C78] via-[#8A347D] to-[#A43875] text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div
                className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm mb-6"
                role="img"
                aria-label="Privacy Shield Icon"
              >
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
                Your privacy is our priority. This policy explains how we
                collect, use, and protect your information at Mega Prize Mall.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="ml-2 font-semibold">{lastUpdated}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Effective Date:</span>
                  <span className="ml-2 font-semibold">{effectiveDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Table of Contents with Schema.org */}
            <nav
              aria-label="Table of Contents"
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </div>
            </nav>

            {/* Introduction with FAQ Schema */}
            <article className="mb-12">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Introduction
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Mega Prize Mall</strong> (&quot;we&quot;,
                  &quot;our&quot;, &quot;us&quot;) operates as an innovative
                  e-commerce marketplace specializing in mobile accessories,
                  exclusive bargain deals, and engaging prize-based shopping
                  experiences. This comprehensive Privacy Policy explains in
                  detail how we handle, process, and protect your information
                  when you use our website, mobile application, or participate
                  in our promotional programs.
                </p>

                <p className="text-lg text-gray-700 leading-relaxed">
                  By accessing or using Mega Prize Mall, you acknowledge that
                  you have read, understood, and agree to the data practices
                  described in this policy. Your continued use of our services
                  constitutes acceptance of any updates to this policy.
                </p>
              </div>
            </article>

            {/* Policy Sections with Schema.org Markup */}
            <div
              className="space-y-12"
              itemScope
              itemType="https://schema.org/FAQPage"
            >
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                  itemScope
                  itemProp="mainEntity"
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
                    className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div itemProp="text">
                      {section.id === "information-collection" ||
                      section.id === "data-usage" ||
                      section.id === "data-sharing" ? (
                        <div className="space-y-6">
                          {section.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                              {hasIcon(item) && (
                                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                  <item.icon className="h-5 w-5 text-[#7C2C78]" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {isObjectItem(item) ? item.title : item}
                                </h3>
                                {isObjectItem(item) && (
                                  <p className="text-gray-600 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {section.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="h-2 w-2 rounded-full bg-[#7C2C78] mt-2 shrink-0"></div>
                              <span className="text-gray-700 leading-relaxed">
                                {typeof item === "string"
                                  ? item
                                  : item.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              ))}

              {/* Contact Section */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-r from-[#2E297D] to-[#7C2C78] flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Contact Our Privacy Team
                    </h2>
                    <div className="w-16 h-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-full mt-2"></div>
                  </div>
                </div>

                <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-2xl p-8 text-white">
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-bold mb-4">
                      Data Protection Officer
                    </h3>
                    <p className="text-white/90 mb-6">
                      For privacy-related inquiries, data subject requests, or
                      concerns about how we handle your information, please
                      contact our dedicated privacy team. We are committed to
                      responding to all requests within the statutory
                      timeframes.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <Link
                          href="mailto:support@megaprizemall.com"
                          className="font-medium hover:underline"
                        >
                          Email: support@megaprizemall.com
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5" />
                        <Link
                          href="mailto:support@megaprizemall.com"
                          className="font-medium hover:underline"
                        >
                          DPO: support@megaprizemall.com
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5" />
                        <Link
                          href="tel:+923254007030"
                          className="font-medium hover:underline"
                        >
                          Phone: +92 325 4007037
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <Link
                          href="https://megaprizemall.com"
                          className="font-medium hover:underline"
                        >
                          Website: https://megaprizemall.com
                        </Link>
                      </div>
                      {/* <div className="mt-4">
                        <p className="text-sm text-white/80">
                          <strong>Mailing Address:</strong><br />
                          Mega Prize Mall Privacy Office<br />
                          123 Commerce Street, Suite 500<br />
                          San Francisco, CA 94107<br />
                          United States
                        </p>
                      </div> */}
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-lg">
                      <p className="text-sm">
                        <strong>Response Times:</strong> We acknowledge all
                        privacy inquiries within 24 hours and provide
                        substantive responses within 30 days as required by
                        GDPR. For urgent matters, please mark your email as
                        &quot;URGENT: Privacy Request&quot;.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Important Notes with Warning Schema */}
              <div
                className="bg-linear-to-r from-[#EAB75F]/10 to-[#FF9F45]/10 rounded-2xl p-6 md:p-8 border border-[#EAB75F]/20"
                itemScope
                itemType="https://schema.org/Warning"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Important Legal Notices
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#EAB75F] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>
                        Children&apos;s Privacy (COPPA Compliance):
                      </strong>{" "}
                      We do not knowingly collect personal data from users under
                      13 years of age. If we become aware of such collection, we
                      will delete the information immediately. Parents/guardians
                      may contact us to review or delete their child&apos;s
                      information.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#EAB75F] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>International Data Transfers:</strong> Your data
                      may be transferred to and processed in countries outside
                      your residence. We ensure appropriate safeguards through
                      Standard Contractual Clauses (SCCs) and adequacy decisions
                      as recognized by the European Commission.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#EAB75F] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>Policy Updates:</strong> We may update this policy
                      to reflect legal, technical, or business developments.
                      Continued use of our services after changes constitutes
                      acceptance of the updated terms. We notify users of
                      material changes via email or site notifications.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#EAB75F] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-gray-700">
                      <strong>Data Retention:</strong> We retain personal data
                      only as long as necessary for the purposes collected,
                      typically 7 years for transaction records as required by
                      tax laws, or until you request deletion (whichever is
                      shorter).
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center space-y-4">
                <div>
                  <p className="text-gray-600 mb-4">
                    Need help understanding your privacy rights or want to
                    exercise your data protection rights?
                  </p>
                  <Button
                    onClick={() =>
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="bg-[#7C2C78] hover:bg-[#A43875] text-white px-8"
                  >
                    Contact Privacy Team
                  </Button>
                </div>
                <div>
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
            </div>
          </div>
        </main>

        <CustomerFooter />
      </div>
    </>
  );
}
