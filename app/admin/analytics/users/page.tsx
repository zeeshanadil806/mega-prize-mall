import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UsersAnalyticsClient from '@/components/admin/analytics/UsersAnalyticsClient';

export default async function UsersAnalyticsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <UsersAnalyticsClient />;
}