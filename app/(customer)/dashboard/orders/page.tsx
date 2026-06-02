import { OrderHistoryClient } from "@/components/orders/OrderHistoryClient";
import { OrderModel } from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ClientOrder } from "@/types";
import { serialize } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "My Orders | Track & Manage Purchases - Mega Prize Mall",
  description:
    "View your complete order history, track shipments, initiate returns, and download invoices. Manage all your purchases in one place.",
  keywords:
    "order history, track orders, purchase history, order tracking, returns, order status, shipment tracking, order management, my orders",
  openGraph: {
    title: "My Orders | Mega Prize Mall",
    description: "Track and manage your purchase history and orders",
    type: "website",
    url: "https://megaprizemall.com/dashboard/orders",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "My Orders | Mega Prize Mall",
    description: "Track and manage your purchase history and orders",
  },
  alternates: {
    canonical: "https://megaprizemall.com/dashboard/orders",
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

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/orders");
  }

  const { page = "1", status } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  await connectToDatabase();
  interface OrderQuery {
    userId: string;
    status?: string; // Optional because you might not set it
  }
  // 1. Build strict query
  // We use Record<string, any> for the query object to allow dynamic status
  const query: OrderQuery = { userId: session.user.id };

  if (status && status !== "all") {
    query.status = status;
  }

  // 2. Fetch orders
  const [rawOrders, totalOrders] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(), // lean() returns plain JS objects, but IDs are still Objects
    OrderModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  // 3. Stats Query (Parallelized for speed)
  const stats = {
    total: totalOrders,
    pending: await OrderModel.countDocuments({
      userId: session.user.id,
      status: "pending",
    }),
    processing: await OrderModel.countDocuments({
      userId: session.user.id,
      status: "processing",
    }),
    delivered: await OrderModel.countDocuments({
      userId: session.user.id,
      status: "delivered",
    }),
  };

  // 4. Serialization
  // Strip MongoDB ObjectId / Date / Mongoose internals so the result is safe
  // to pass to the client component.
  const serializedOrders = serialize(rawOrders);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'My Order History',
    description: 'Purchase history and order tracking',
    numberOfItems: totalOrders,
    itemListElement: serializedOrders.slice(0, 5).map((order: ClientOrder, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Order',
        orderNumber: order._id,
        orderDate: order.createdAt,
        orderStatus: order.status,
        priceCurrency: 'PKR',
        totalPrice: order.grandTotal,
        numberOfItems: order.items.length,
        ...(order.estimatedDelivery && {
          expectedArrivalFrom: order.estimatedDelivery
        })
      }
    }))
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://megaprizemall.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dashboard',
        item: 'https://megaprizemall.com/dashboard',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'My Orders',
        item: 'https://megaprizemall.com/dashboard/orders',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
    <OrderHistoryClient
      orders={serializedOrders}
      currentPage={currentPage}
      totalPages={totalPages}
      currentStatus={status || "all"}
      stats={stats}
      />
      </>
  );
}
