// app/(customer)/addresses/page.tsx (For managing addresses)
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AddressesClient from "@/components/addresses/AddressesClient";
import { connectToDatabase } from "@/lib/mongodb";
import { AddressModel } from "@/models/Address";

export const metadata: Metadata = {
  title:
    "Manage Shipping Addresses | Add & Edit Delivery Locations - Mega Prize Mall",
  description:
    "Manage your shipping addresses for faster checkout. Add, edit, or remove delivery locations. Set default address for one-click ordering.",
  keywords:
    "shipping addresses, delivery addresses, address book, manage addresses, add address, edit address, delivery locations, address management",
  openGraph: {
    title: "Manage Shipping Addresses | Mega Prize Mall",
    description: "Add and manage your shipping addresses for faster checkout",
    type: "website",
    url: "https://megaprizemall.com/addresses",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "Manage Shipping Addresses | Mega Prize Mall",
    description: "Add and manage your shipping addresses for faster checkout",
  },
  alternates: {
    canonical: "https://megaprizemall.com/addresses",
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

export default async function AddressesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?redirect=/addresses");
  }

  await connectToDatabase();

  const addresses = await AddressModel.find({
    userId: session.user.id,
    isActive: true,
  })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Manage Shipping Addresses - Mega Prize Mall",
    description: "Address management page for shipping and delivery locations",
    url: "https://megaprizemall.com/addresses",
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
        {
          "@type": "ListItem",
          position: 3,
          name: "My Addresses",
          item: "https://megaprizemall.com/addresses",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AddressesClient addresses={addresses} userId={session.user.id} />;
    </>
  );
}
