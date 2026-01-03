import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
import { OrderModel, type Order } from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { ProductModel } from '@/models/Product';

// Define a minimal interface for the product data we are fetching
// This avoids using 'any' for the product map
interface ProductSubset {
  _id: string; // lean() IDs are often objects, but we convert to string keys
  images?: { url: string }[];
  name: string;
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Order #${id} - Mega Prize Mall`,
    description: 'View order details, track shipment, and manage your order.',
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/orders');
  }

  const { id } = await params;
  
  await connectToDatabase();

  // 1. Fix: Cast the lean() result to your Order type
  // We use (Order & { _id: any }) because Zod types usually don't include the raw _id field by default
  const order = await OrderModel.findOne({
    _id: id,
    userId: session.user.id,
  }).lean() as (Order & { _id: string }) | null;

  if (!order) {
    notFound();
  }

  // Fetch product details for images
  // TypeScript now knows 'item' is an OrderItem because 'order' is typed
  const productIds = order.items.map((item) => item.productId);
  
  // 2. Fix: Type the products result
  const products = await ProductModel.find(
    { _id: { $in: productIds } },
    { images: 1, name: 1, slug: 1 }
  ).lean() as unknown as ProductSubset[];

  // 3. Fix: Replace 'Record<string, any>' with strict type
  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {} as Record<string, ProductSubset>);

  // Enhance order items with product images
  const enhancedItems = order.items.map((item) => ({
    ...item,
    // TypeScript now knows exactly what productMap[...] contains
    productImage: productMap[item.productId]?.images?.[0]?.url || item.productImage,
    productSlug: productMap[item.productId]?.slug || item.productSlug,
  }));

  const enhancedOrder = {
    ...order,
    items: enhancedItems,
  };

  return (
    <OrderDetailClient 
      order={JSON.parse(JSON.stringify(enhancedOrder))}
      userId={session.user.id}
    />
  );
}