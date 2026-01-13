// app/(customer)/checkout/success/page.tsx
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import OrderSuccessClient from '@/components/checkout/OrderSuccessClient';
import { connectToDatabase } from '@/lib/mongodb';
import { OrderModel } from '@/models/Order';

export const metadata: Metadata = {
  title: 'Order Confirmed - Mega Prize Mall',
  description: 'Your order has been placed successfully',
  robots: 'noindex, nofollow',
};

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  if (!params.orderId) {
    redirect('/orders');
  }
  
  await connectToDatabase();
  
  const order = await OrderModel.findOne({
    _id: params.orderId,
    userId: session.user.id,
  }).lean();
  
  if (!order) {
    redirect('/orders');
  }
  const orderPlain = JSON.parse(JSON.stringify(order));
  return <OrderSuccessClient order={orderPlain} />;
}