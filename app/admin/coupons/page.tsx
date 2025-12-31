// app/admin/coupons/page.tsx
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CouponsClient from '@/components/admin/coupons/CouponsClient';

export const metadata: Metadata = {
  title: 'Coupon Management - Admin Dashboard',
  description: 'Manage discount coupons for your store',
};

export default async function CouponsPage() {
  const session = await auth();
  
  // Redirect if not admin
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/admin');
  }
  
  return <CouponsClient />;
}