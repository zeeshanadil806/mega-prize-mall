import { AdminLuckyDrawClient } from '@/components/admin/lucky-draw/AdminLuckyDrawClient';
import { LuckyDrawModel } from '@/models/LuckyDraw';
import { connectToDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Lucky Draw Management - Admin Dashboard',
  description: 'Create and manage lucky draws, select winners, and track entries.',
};

const DRAWS_PER_PAGE = 10;

export default async function AdminLuckyDrawPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    status?: string;
    search?: string;
  }>;
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

  const { 
    page = '1', 
    status,
    search,
  } = await searchParams;
  
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * DRAWS_PER_PAGE;

  await connectToDatabase();
interface LuckyDrawQuery {
  status?: string;
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
}
  // Build query
  const query: LuckyDrawQuery = {};
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { prizeName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Fetch draws with pagination
  const [draws, totalDraws] = await Promise.all([
    LuckyDrawModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(DRAWS_PER_PAGE)
      .lean(),
    LuckyDrawModel.countDocuments(query),
  ]);

  // Calculate stats
  const [draftCount, announcedCount, completedCount, activeCount] = await Promise.all([
    LuckyDrawModel.countDocuments({ ...query, status: 'draft' }),
    LuckyDrawModel.countDocuments({ ...query, status: 'announced' }),
    LuckyDrawModel.countDocuments({ ...query, status: 'completed' }),
    LuckyDrawModel.countDocuments({ ...query, status: { $in: ['announced', 'in_progress'] } }),
  ]);

  const totalPages = Math.ceil(totalDraws / DRAWS_PER_PAGE);

  return (
    <AdminLuckyDrawClient
      draws={JSON.parse(JSON.stringify(draws))}
      currentPage={currentPage}
      totalPages={totalPages}
      currentStatus={status || 'all'}
      searchQuery={search || ''}
      stats={{
        total: totalDraws,
        draft: draftCount,
        announced: announcedCount,
        completed: completedCount,
        active: activeCount,
      }}
      adminId={session.user.id}
    />
  );
}