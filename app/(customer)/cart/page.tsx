import { auth } from "@/auth";
import CartPage from "@/components/cart/CartPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Review Your Items - Mega Prize Mall",
  description:
    "Review items in your shopping cart. Manage quantities, apply coupons, and proceed to checkout. Free shipping on orders over Rs 999.",
  keywords:
    "shopping cart, cart items, checkout, review cart, online shopping cart",
  openGraph: {
    title: "Shopping Cart | Mega Prize Mall",
    description: "Review and manage your shopping cart items",
    type: "website",
    url: "https://megaprizemall.com/cart",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "Shopping Cart | Mega Prize Mall",
    description: "Review and manage your shopping cart items",
  },
  alternates: {
    canonical: "https://megaprizemall.com/cart",
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
        name: "Shopping Cart",
        item: "https://megaprizemall.com/cart",
      },
    ],
  };
  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shopping Cart - Mega Prize Mall",
    description:
      "Shopping cart page for reviewing and managing items before checkout",
    url: "https://megaprizemall.com/cart",
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
      ],
    },
  };
  const session = await auth();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageStructuredData) }}
      />
      <CartPage />
    </div>
  );
}
