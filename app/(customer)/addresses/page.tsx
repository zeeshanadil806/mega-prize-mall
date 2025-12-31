// app/(customer)/addresses/page.tsx (For managing addresses)
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AddressesClient from '@/components/addresses/AddressesClient';
import { connectToDatabase } from '@/lib/mongodb';
import { AddressModel } from '@/models/Address';

export const metadata: Metadata = {
  title: 'My Addresses - Mega Prize Mall',
  description: 'Manage your shipping addresses',
};

export default async function AddressesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?redirect=/addresses');
  }
  
  await connectToDatabase();
  
  const addresses = await AddressModel.find({
    userId: session.user.id,
    isActive: true,
  })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();
  
  return <AddressesClient addresses={addresses} userId={session.user.id} />;
}