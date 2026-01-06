import { AdminOrdersClient } from '@/components/admin/orders/AdminOrdersClient';
import { OrderModel } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UserModel } from '@/models/User';

export const metadata: Metadata = {
  title: 'Order Management - Admin Dashboard',
  description: 'Manage and track all customer orders.',
};

const ITEMS_PER_PAGE = 20;

interface AdminUserMap {
  _id: string; 
  name: string;
  email: string;
  phone?: string;
}

interface AdminOrderQuery {
  status?: string;
  $or?: Array<Record<string, { $regex: string; $options: string }>>;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user is admin
  const user = await UserModel.findById(session.user.id).lean();
  if (!user || (user.role !== "admin" && user.role !== "support")) {
    redirect('/');
  }

  const { 
    page = '1', 
    status, 
    search,
    date_from,
    date_to 
  } = await searchParams;
  
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  await connectToDatabase();

  // Build query
  const query: AdminOrderQuery = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { 'items.productName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
    ];
  }
  
  if (date_from || date_to) {
    query.createdAt = {};
    if (date_from) query.createdAt.$gte = new Date(date_from);
    if (date_to) query.createdAt.$lte = new Date(date_to + 'T23:59:59.999Z');
  }

  // Fetch orders with user data
  const [orders, totalOrders] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),
    OrderModel.countDocuments(query),
  ]);

  // Get user details for each order
  const userIds = [...new Set(orders.map(order => order.userId))];
  const users = await UserModel.find(
    { _id: { $in: userIds } },
    { name: 1, email: 1, phone: 1 }
  ).lean();

  const userMap = users.reduce((acc, user) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {} as Record<string, AdminUserMap>);

  const enhancedOrders = orders.map(order => ({
    ...order,
    user: userMap[order.userId] || { name: 'Unknown', email: 'N/A' },
  }));

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);

  const [todayOrders, yesterdayOrders, last7DaysOrders, totalRevenue] = await Promise.all([
    OrderModel.countDocuments({ 
      ...query,
      createdAt: { $gte: today },
      status: { $nin: ['cancelled', 'refunded'] }
    }),
    OrderModel.countDocuments({ 
      ...query,
      createdAt: { 
        $gte: yesterday,
        $lt: today 
      },
      status: { $nin: ['cancelled', 'refunded'] }
    }),
    OrderModel.countDocuments({ 
      ...query,
      createdAt: { $gte: last7Days },
      status: { $nin: ['cancelled', 'refunded'] }
    }),
    OrderModel.aggregate([
      { $match: { ...query, status: { $nin: ['cancelled', 'refunded'] } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
  ]);

  const stats = {
    total: totalOrders,
    today: todayOrders,
    yesterday: yesterdayOrders,
    last7Days: last7DaysOrders,
    revenue: totalRevenue[0]?.total || 0,
    pending: await OrderModel.countDocuments({ ...query, status: 'pending' }),
    processing: await OrderModel.countDocuments({ ...query, status: 'processing' }),
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  return (
    <AdminOrdersClient
      orders={JSON.parse(JSON.stringify(enhancedOrders))}
      currentPage={currentPage}
      totalPages={totalPages}
      currentStatus={status || 'all'}
      searchQuery={search || ''}
      dateFrom={date_from || ''}
      dateTo={date_to || ''}
      stats={stats}
    />
  );
}