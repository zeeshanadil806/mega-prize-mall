// src/app/api/admin/bargain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { BargainRequestModel } from "@/models/BargainRequest";
import { BargainCouponModel } from "@/models/BargainCoupon";
import { ProductModel } from "@/models/Product";
import { UserModel } from "@/models/User";
import { requireSessionRoles } from '@/shared/http';
import { log } from "@/lib/logger";
import { escapeRegex } from "@/lib/utils";
import { formatCurrency } from "@/shared/format";

// GET: Fetch bargain requests with filters
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "all";
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sort") || "-createdAt";
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
    // Build query
    const query: BargainRequestQuery = { isActive: true };

    // Status filter
    if (status !== "all") {
      query.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Search filter
    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { couponCode: { $regex: safe, $options: "i" } },
        { message: { $regex: safe, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch bargain requests with population
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
        .sort(sortBy)
        .skip(skip)
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

    return NextResponse.json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    log.error("Admin bargain API error", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to fetch bargain requests" },
      { status: 500 }
    );
  }
}

// PATCH: Update bargain status
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    await connectToDatabase();

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find bargain request
    const bargainRequest = await BargainRequestModel.findById(id);
    if (!bargainRequest) {
      return NextResponse.json(
        { error: "Bargain request not found" },
        { status: 404 }
      );
    }

    // If status is being accepted and not already accepted
    if (status === 'accepted' && bargainRequest.status !== 'accepted') {
      // Check if coupon already exists
      if (!bargainRequest.couponCode) {
        // Generate coupon code
        const { generateBargainCouponCode } = await import(
          "@/features/bargain/domain"
        );
        const couponCode = generateBargainCouponCode();
        const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        bargainRequest.couponCode = couponCode;
        bargainRequest.couponExpiresAt = validUntil;

        // Create bargain coupon
        const bargainCoupon = await BargainCouponModel.create({
          code: couponCode,
          productId: bargainRequest.productId,
          userId: bargainRequest.userId,
          bargainRequestId: bargainRequest._id,
          originalPrice: bargainRequest.originalPrice,
          discountedPrice: bargainRequest.offeredPrice,
          discountAmount: bargainRequest.originalPrice - bargainRequest.offeredPrice,
          discountPercentage: Math.round(((bargainRequest.originalPrice - bargainRequest.offeredPrice) / bargainRequest.originalPrice) * 100),
          validFrom: new Date(),
          validUntil,
        });

        // Send email notification (async)
        setTimeout(async () => {
          try {
            const { sendBargainCouponEmail } = await import("@/lib/email-templates");
            const product = await ProductModel.findById(bargainRequest.productId);
            const user = await UserModel.findById(bargainRequest.userId);
            
            if (user?.email && product) {
              await sendBargainCouponEmail(bargainCoupon, product, {
                email: user.email,
                name: user.name,
              });
              log.info("Bargain coupon email sent", { couponCode, userId: user._id });
            }
          } catch (emailError) {
            log.error("Failed to send bargain coupon email", { error: emailError as Error });
          }
        }, 0);
      }
    }

    // Update status
    bargainRequest.status = status;
    if (adminNotes) {
      bargainRequest.message = `${bargainRequest.message || ''}\n[Admin Note]: ${adminNotes}`;
    }
    bargainRequest.updatedAt = new Date();
    
    await bargainRequest.save();

    log.info("Bargain status updated", {
      bargainId: id,
      status,
      adminId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: bargainRequest._id,
        status: bargainRequest.status,
        couponCode: bargainRequest.couponCode,
        couponExpiresAt: bargainRequest.couponExpiresAt,
        updatedAt: bargainRequest.updatedAt,
      }
    });
  } catch (error) {
    log.error("Update bargain API error", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to update bargain request" },
      { status: 500 }
    );
  }
}

// DELETE: Delete bargain request (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireSessionRoles(["admin"]);
    if (!session.ok) return session.response;

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing bargain ID" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const bargainRequest = await BargainRequestModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!bargainRequest) {
      return NextResponse.json(
        { error: "Bargain request not found" },
        { status: 404 }
      );
    }

    // Also deactivate associated coupon if exists
    if (bargainRequest.couponCode) {
      await BargainCouponModel.findOneAndUpdate(
        { code: bargainRequest.couponCode },
        { isActive: false }
      );
    }

    log.info("Bargain request deleted", {
      bargainId: id,
      adminId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Bargain request deleted successfully",
    });
  } catch (error) {
    log.error("Delete bargain API error", { error: error as Error });
    return NextResponse.json(
      { error: "Failed to delete bargain request" },
      { status: 500 }
    );
  }
}