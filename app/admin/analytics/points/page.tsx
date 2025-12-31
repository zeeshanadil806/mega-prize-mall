import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PointsAnalyticsClient from '@/components/admin/analytics/PointsAnalyticsClient';

export default async function PointsAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <PointsAnalyticsClient />;
}