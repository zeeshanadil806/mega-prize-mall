import { SpinWheelClient } from '@/components/admin/lucky-draw/SpinWheelClient';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
//   const { id } = await params;
  
  return {
    title: `Spin Wheel - Lucky Draw`,
    description: 'Select a winner using the spin wheel',
  };
}

export default async function SpinWheelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user is admin
  const UserModel = (await import('@/models/User')).UserModel;
  const user = await UserModel.findById(session.user.id);
  
  if (!user || user.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;
  await connectToDatabase();

  // Get draw details
  const draw = await LuckyDrawModel.findById(id).lean();
  if (!draw) {
    redirect('/admin/lucky-draw');
  }

  // Get draw entries for the wheel
  const LuckyDrawEntryModel = (await import('@/models/LuckyDrawEntry')).LuckyDrawEntryModel;
  const entries = await LuckyDrawEntryModel.find(
    { drawId: id, status: 'active' },
    'entryNumber customerName orderId orderAmount'
  ).limit(50).lean(); // Limit to 50 entries for wheel performance

  return (
    <SpinWheelClient
      draw={JSON.parse(JSON.stringify(draw))}
      entries={JSON.parse(JSON.stringify(entries))}
      adminId={session.user.id}
    />
  );
}