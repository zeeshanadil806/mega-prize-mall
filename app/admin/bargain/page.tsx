// src/app/admin/bargain/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminBargainClient } from "@/components/admin/bargain/AdminBargainClient";
import { connectToDatabase } from "@/lib/mongodb";
import { ProductModel, UserModel } from "@/models";
import { escapeRegex } from "@/lib/utils";
import { serialize } from "@/lib/serialize";
interface BargainRequestQuery {
  isActive: boolean;
  status?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  $or?: Array<
    | { couponCode: { $regex: string; $options: string } }
    | { message: { $regex: string; $options: string } }
  >;
}
export default async function AdminBargainPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();

  // Check authentication and admin rolea
  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user.role !== "admin" && session.user.role !== "support")) {
    redirect("/");
  }

  // Extract search params
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 20;
  const status = typeof searchParams.status === "string" ? searchParams.status : "all";
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const dateFrom = typeof searchParams.date_from === "string" ? searchParams.date_from : "";
  const dateTo = typeof searchParams.date_to === "string" ? searchParams.date_to : "";
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "-createdAt";

  // Fetch data server-side
  await connectToDatabase();
  
  const { BargainRequestModel } = await import("@/models/BargainRequest");
  
  // Build query
  const query: BargainRequestQuery = { isActive: true };

  if (status !== "all") {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      query.createdAt.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.createdAt.$lte = new Date(dateTo);
    }
  }

  if (search) {
    const safe = escapeRegex(search);
    query.$or = [
      { couponCode: { $regex: safe, $options: "i" } },
      { message: { $regex: safe, $options: "i" } },
    ];
  }

  // Fetch data
  const [bargainRequests, total] = await Promise.all([
    BargainRequestModel.find(query)
      .populate({
        path: "productId",
        select: "name slug images price",
        model: ProductModel,
      })
      .populate({
        path: "userId",
        select: "name email phone",
        model: UserModel,
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BargainRequestModel.countDocuments(query),
  ]);

  // Calculate stats
  const stats = await BargainRequestModel.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalOfferedAmount: { $sum: "$offeredPrice" },
        totalSavingAmount: { $sum: { $subtract: ["$originalPrice", "$offeredPrice"] } },
      },
    },
  ]);

  const statsMap = {
    pending: { count: 0, totalOfferedAmount: 0, totalSavingAmount: 0 },
    accepted: { count: 0, totalOfferedAmount: 0, totalSavingAmount: 0 },
    rejected: { count: 0, totalOfferedAmount: 0, totalSavingAmount: 0 },
    expired: { count: 0, totalOfferedAmount: 0, totalSavingAmount: 0 },
  };

  stats.forEach(stat => {
    statsMap[stat._id as keyof typeof statsMap] = {
      count: stat.count,
      totalOfferedAmount: stat.totalOfferedAmount,
      totalSavingAmount: stat.totalSavingAmount,
    };
  });

  const totalCount = Object.values(statsMap).reduce((sum, stat) => sum + stat.count, 0);

  // Format response
  const { formatCurrency } = await import("@/shared/format");
  const formattedRequests = bargainRequests.map((request) => ({
    id: request._id.toString(),
    product: request.productId ? {
      id: request.productId._id,
      name: request.productId.name,
      slug: request.productId.slug,
      image: request.productId.images?.[0],
      price: request.productId.price,
    } : null,
    user: request.userId ? {
      id: request.userId._id,
      name: request.userId.name,
      email: request.userId.email,
      phone: request.userId.phone,
    } : null,
    originalPrice: request.originalPrice,
    offeredPrice: request.offeredPrice,
    minPrice: request.minPrice,
    status: request.status,
    discountPercentage: Math.round(((request.originalPrice - request.offeredPrice) / request.originalPrice) * 100),
    savingAmount: request.originalPrice - request.offeredPrice,
    couponCode: request.couponCode,
    couponExpiresAt: request.couponExpiresAt,
    bargainRound: request.bargainRound,
    maxRounds: request.maxRounds,
    message: request.message,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    isExpired: request.couponExpiresAt ? new Date() > new Date(request.couponExpiresAt) : false,
    formatted: {
      originalPrice: formatCurrency(request.originalPrice),
      offeredPrice: formatCurrency(request.offeredPrice),
      minPrice: formatCurrency(request.minPrice),
      savingAmount: formatCurrency(request.originalPrice - request.offeredPrice),
    }
  }));

  const initialData = {
    requests: formattedRequests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: totalCount,
      pending: statsMap.pending.count,
      accepted: statsMap.accepted.count,
      rejected: statsMap.rejected.count,
      expired: statsMap.expired.count,
      totalOfferedAmount: statsMap.accepted.totalOfferedAmount + statsMap.pending.totalOfferedAmount,
      totalSavingAmount: statsMap.accepted.totalSavingAmount,
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1">
        <main className="p-6">
          <AdminBargainClient initialData={serialize(initialData)} />
        </main>
      </div>
    </div>
  );
}