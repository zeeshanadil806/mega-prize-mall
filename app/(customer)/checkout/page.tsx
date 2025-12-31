// app/(customer)/checkout/page.tsx (Server Component)
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { AddressModel } from '@/models';

export const metadata: Metadata = {
  title: 'Checkout - Mega Prize Mall',
  description: 'Complete your purchase with secure checkout',
  robots: 'noindex, nofollow',
};

export default async function CheckoutPage() {
  const session = await auth();
  console.log(session)
  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login?redirect=/checkout');
  }
  
  await connectToDatabase();
  
  // Fetch user data with saved addresses
  const user = await UserModel.findById(session.user.id)
    .select('name email phone')
    .lean();

    // Fetch addresses separately
  const addresses = await AddressModel.find({ userId: session.user.id }).lean();
  
  return <CheckoutClient user={user} userId={session.user.id} addresses={addresses}/>;
}