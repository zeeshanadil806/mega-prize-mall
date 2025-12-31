import { OrderHistoryClient } from '@/components/orders/OrderHistoryClient';
import { OrderModel } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Orders - Mega Prize Mall',
  description: 'View your order history, track shipments, and manage returns.',
  keywords: 'orders, purchase history, track order, returns',
};

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/orders');
  }

  const { page = '1', status } = await searchParams;
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
  
  if (status && status !== 'all') {
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
    pending: await OrderModel.countDocuments({ userId: session.user.id, status: 'pending' }),
    processing: await OrderModel.countDocuments({ userId: session.user.id, status: 'processing' }),
    delivered: await OrderModel.countDocuments({ userId: session.user.id, status: 'delivered' }),
  };

  // 4. Serialization
  // We strictly convert MongoDB objects (like _id and Date) to strings here
  // to avoid the "Only plain objects" error in Next.js
  const serializedOrders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <OrderHistoryClient
      orders={serializedOrders}
      currentPage={currentPage}
      totalPages={totalPages}
      currentStatus={status || 'all'}
      stats={stats}
    />
  );
}