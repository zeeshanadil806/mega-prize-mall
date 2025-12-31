import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/admin/users/UsersClient';

export default async function AdminUsersPage() {
  const session = await auth();
  
  // Check admin access
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return <UsersClient />;
}