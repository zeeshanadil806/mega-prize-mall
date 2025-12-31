import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ProductsAnalyticsClient from '@/components/admin/analytics/ProductsAnalyticsClient';

export default async function ProductsAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <ProductsAnalyticsClient />;
}