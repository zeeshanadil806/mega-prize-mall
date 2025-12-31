import { LuckyDrawDashboardClient } from '@/components/lucky-draw/LuckyDrawDashboardClient';
import { getActiveDraws } from '@/lib/lucky-draw-utils';
import { getUserLuckyDrawEntries } from '@/lib/lucky-draw-utils';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lucky Draw - Mega Prize Mall',
  description: 'Participate in lucky draws, check your entries, and win amazing prizes!',
  keywords: 'lucky draw, win prizes, contests, competitions, rewards',
};

export default async function LuckyDrawPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/lucky-draw');
  }

  await connectToDatabase();

  // Get user's entries and active draws in parallel
  const [userEntries, activeDraws, completedDraws] = await Promise.all([
    getUserLuckyDrawEntries(session.user.id),
    getActiveDraws(),
    LuckyDrawModel.find({
      status: 'completed',
      isActive: true,
    })
      .sort({ resultDate: -1 })
      .limit(5)
      .lean(),
  ]);

  // Get user's recent orders that qualify for draws
  const qualifyingOrders = await (
    await import('@/models/Order')
  ).OrderModel.find({
    userId: session.user.id,
    status: 'delivered',
    grandTotal: { $gte: 3000 },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Check which orders already have entries
  const ordersWithEntries = userEntries.entries.map(entry => 
    typeof entry.orderId === 'string' ? entry.orderId : entry.orderId
  );

  const eligibleOrders = qualifyingOrders.filter(order => 
    !ordersWithEntries.includes(order._id.toString())
  );

  return (
    <LuckyDrawDashboardClient
      userEntries={userEntries}
      activeDraws={activeDraws}
      completedDraws={JSON.parse(JSON.stringify(completedDraws))}
      eligibleOrders={JSON.parse(JSON.stringify(eligibleOrders))}
      userId={session.user.id}
    />
  );
}