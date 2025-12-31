import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SalesAnalyticsClient from '@/components/admin/analytics/SalesAnalyticsClient';

export default async function SalesAnalyticsPage() {
  const session = await auth();
  
  // Check admin access
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <SalesAnalyticsClient />;
}