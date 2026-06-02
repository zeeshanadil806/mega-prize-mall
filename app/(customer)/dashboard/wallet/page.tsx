import { WalletDashboardClient } from "@/components/wallet/WalletDashboardClient";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { UserModel } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { serialize } from "@/lib/serialize";

interface WalletTransactionQuery {
  userId: string;
  status: string;
  type?: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}

export const metadata: Metadata = {
  title: "My Points Wallet | Track & Redeem Rewards - Mega Prize Mall",
  description:
    "Manage your loyalty points wallet. View balance, track transactions, redeem points for discounts, and earn more rewards. 1 point = Rs 0.10 value.",
  keywords:
    "points wallet, loyalty rewards, redeem points, points balance, reward points, wallet balance, loyalty program, mega prize mall points",
  openGraph: {
    title: "My Points Wallet | Mega Prize Mall",
    description: "Track and redeem your loyalty points for exclusive discounts",
    type: "website",
    url: "https://megaprizemall.com/dashboard/wallet",
    siteName: "Mega Prize Mall",
  },
  twitter: {
    card: "summary",
    title: "My Points Wallet | Mega Prize Mall",
    description: "Track and redeem your loyalty points for exclusive discounts",
  },
  alternates: {
    canonical: "https://megaprizemall.com/dashboard/wallet",
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
    },
  },
};

const TRANSACTIONS_PER_PAGE = 15;

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/wallet");
  }

  const { page = "1", type, month } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * TRANSACTIONS_PER_PAGE;

  await connectToDatabase();

  // Get user with current points
  const user = await UserModel.findById(session.user.id).lean();
  if (!user) {
    redirect("/login");
  }

  // Build query
  const query: WalletTransactionQuery = {
    userId: session.user.id,
    status: "completed",
  };

  if (type && type !== "all") {
    query.type = type;
  }

  if (month && month !== "all") {
    const [year, monthNum] = month.split("-");
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  // Fetch transactions with pagination
  const [transactions, totalTransactions] = await Promise.all([
    WalletTransactionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(TRANSACTIONS_PER_PAGE)
      .lean(),
    WalletTransactionModel.countDocuments(query),
  ]);
  const now = new Date();
  // Calculate monthly points summary
  // Use the stable 'now' variable we defined earlier
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  );
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [currentMonthEarned, lastMonthEarned, pointsExpiringSoon] =
    await Promise.all([
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: session.user.id,
            type: "earn",
            createdAt: {
              $gte: currentMonthStart,
              $lte: currentMonthEnd,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]),
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: session.user.id,
            type: "earn",
            createdAt: {
              $gte: lastMonthStart,
              $lte: lastMonthEnd,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]),
      WalletTransactionModel.aggregate([
        {
          $match: {
            userId: session.user.id,
            type: "earn",
            expiresAt: {
              $gte: now, // FIX: Use stable 'now'
              $lte: thirtyDaysFromNow, // FIX: Use stable pre-calculated date
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]),
    ]);

  // Get available months for filter
  const availableMonths = await WalletTransactionModel.aggregate([
    { $match: { userId: session.user.id } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
  ]);

  const monthOptions = availableMonths.map((m) => ({
    value: `${m._id.year}-${m._id.month.toString().padStart(2, "0")}`,
    label: `${new Date(m._id.year, m._id.month - 1).toLocaleString("default", {
      month: "long",
    })} ${m._id.year}`,
    count: m.count,
  }));

  const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);

  const stats = {
    currentPoints: user.points,
    monetaryValue: user.points * 0.1, // 1 point = Rs 0.10
    currentMonthEarned: currentMonthEarned[0]?.total || 0,
    lastMonthEarned: lastMonthEarned[0]?.total || 0,
    pointsExpiringSoon: pointsExpiringSoon[0]?.total || 0,
    totalEarned: await WalletTransactionModel.aggregate([
      { $match: { userId: session.user.id, type: "earn" } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]).then((res) => res[0]?.total || 0),
    totalRedeemed: await WalletTransactionModel.aggregate([
      { $match: { userId: session.user.id, type: "redeem" } },
      { $group: { _id: null, total: { $sum: { $abs: "$points" } } } },
    ]).then((res) => res[0]?.total || 0),
  };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: "Loyalty Points Wallet",
    description:
      "Mega Prize Mall loyalty points wallet for earning and redeeming rewards",
    provider: {
      "@type": "Organization",
      name: "Mega Prize Mall",
      url: "https://megaprizemall.com",
    },
    offers: {
      "@type": "Offer",
      description: "Earn 1 point for every Rs 10 spent. 1 point = Rs 0.10 value.",
    },
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://megaprizemall.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dashboard",
        item: "https://megaprizemall.com/dashboard",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Wallet",
        item: "https://megaprizemall.com/dashboard/wallet",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <WalletDashboardClient
        transactions={serialize(transactions)}
        currentPage={currentPage}
        totalPages={totalPages}
        currentType={type || "all"}
        currentMonth={month || "all"}
        monthOptions={monthOptions}
        stats={stats}
        userId={session.user.id}
      />
    </>
  );
}
