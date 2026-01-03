import { auth } from "@/auth";
import CustomerDashboard from "@/components/customer/DashboardPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
export const metadata: Metadata = {
  title: "My Dashboard | Account Overview & Management - Mega Prize Mall",
  description:
    "Your personal dashboard for orders, points wallet, addresses, and account settings. Track orders, manage rewards, and update preferences.",
  keywords:
    "dashboard, account dashboard, order tracking, points wallet, account settings, purchase history, loyalty rewards, user profile",
  openGraph: {
    title: "My Dashboard | Mega Prize Mall",
    description:
      "Your personal account dashboard for orders, wallet, and settings",
    type: "website",
    url: "https://megaprizemall.com/dashboard",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "My Dashboard | Mega Prize Mall",
    description:
      "Your personal account dashboard for orders, wallet, and settings",
  },
  alternates: {
    canonical: "https://megaprizemall.com/dashboard",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
    },
  },
};

export default async function page() {
  const session = await auth();
  if (!session?.user) {
    redirect(
      "/login?redirect=/dashboard&message=Please login to access your dashboard"
    );
  }
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "User Dashboard - Mega Prize Mall",
    description: "Personal dashboard for account management and order tracking",
    url: "https://megaprizemall.com/dashboard",
    breadcrumb: {
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
          name: "Dashboard",
          item: "https://megaprizemall.com/dashboard",
        },
      ],
    },
  };
  // User profile structured data
  const userProfileStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    identifier: session.user.id,
    name: session.user.name,
    email: session.user.email,
    memberOf: {
      "@type": "ProgramMembership",
      membershipNumber: session.user.id,
      membershipPointsEarned: session.user.points || 0,
      programName: "Mega Prize Mall Loyalty Program",
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(userProfileStructuredData),
        }}
      />
      <CustomerDashboard />
    </div>
  );
}
