import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { auth } from '@/auth';
import { formatCurrency } from '@/lib/bargain-utils';
import { log } from '@/lib/logger';

interface WalletExportQuery {
  userId: string;
  type?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const month = searchParams.get('month');

    await connectToDatabase();

    // Build query
    const query: WalletExportQuery = { userId: session.user.id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (month && month !== 'all') {
      const [year, monthNum] = month.split('-');
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Fetch all matching transactions
    const transactions = await WalletTransactionModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Prepare CSV data
    const headers = [
      'Transaction ID',
      'Date',
      'Type',
      'Points',
      'Monetary Value',
      'Balance After',
      'Description',
      'Status',
      'Order ID',
      'Expiry Date',
    ];

    const csvData = transactions.map(tx => [
      tx._id.toString(),
      new Date(tx.createdAt).toLocaleDateString('en-PK'),
      tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      tx.points > 0 ? `+${tx.points}` : tx.points.toString(),
      formatCurrency(Math.abs(tx.points) * tx.rate),
      tx.balanceAfter?.toString() || 'N/A',
      tx.description,
      tx.status,
      tx.orderId || 'N/A',
      tx.expiresAt ? new Date(tx.expiresAt).toLocaleDateString('en-PK') : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create response
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="wallet-transactions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    log.error('Error exporting wallet data', { error: error as Error });
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice';
    return NextResponse.json(
      { error: errorMessage || 'Failed to export data' },
      { status: 400 }
    );
  }
}