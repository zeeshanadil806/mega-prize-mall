// app/(customer)/checkout/page.tsx (Server Component)
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { AddressModel } from "@/models";

export const metadata: Metadata = {
  title: "Secure Checkout | Complete Your Purchase - Mega Prize Mall",
  description:
    "Finalize your purchase with secure checkout. Multiple payment options, free shipping over Rs 999, and 100% buyer protection.",
  keywords:
    "checkout, secure payment, online shopping checkout, complete purchase, payment options, buy now",
  openGraph: {
    title: "Secure Checkout | Mega Prize Mall",
    description: "Complete your purchase with our secure checkout process",
    type: "website",
    url: "https://megaprizemall.com/checkout",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "Secure Checkout | Mega Prize Mall",
    description: "Complete your purchase with our secure checkout process",
  },
  alternates: {
    canonical: "https://megaprizemall.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-video-preview": -1,
      "max-image-preview": "none",
    },
  },
};

export default async function CheckoutPage() {
  const session = await auth();
  console.log(session);
  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login?redirect=/checkout");
  }

  await connectToDatabase();

  // Fetch user data with saved addresses
  const user = await UserModel.findById(session.user.id)
    .select("name email phone")
    .lean();

  // Fetch addresses separately
  const addresses = await AddressModel.find({ userId: session.user.id }).lean();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CheckoutPage",
    name: "Secure Checkout - Mega Prize Mall",
    description: "Complete your purchase with secure payment options",
    url: "https://megaprizemall.com/checkout",
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
          name: "Cart",
          item: "https://megaprizemall.com/cart",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Checkout",
          item: "https://megaprizemall.com/checkout",
        },
      ],
    },
  };

  // Breadcrumb structured data
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
        name: "Cart",
        item: "https://megaprizemall.com/cart",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Checkout",
        item: "https://megaprizemall.com/checkout",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <CheckoutClient
        user={user ? JSON.parse(JSON.stringify(user)) : null}
        userId={session.user.id}
        addresses={JSON.parse(JSON.stringify(addresses))}
      />
    </>
  );
}
