// app/api/admin/coupons/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { CouponServices, GlobalCouponModel } from '@/models/GlobalCoupon';
import { log } from '@/lib/logger';
import { z } from 'zod';

// Schema for bulk generation
const BulkGenerateSchema = z.object({
  count: z.number().int().min(1).max(1000),
  prefix: z.string().max(5).optional(),
  suffix: z.string().max(5).optional(),
  codeLength: z.number().int().min(6).max(20).default(10),
  template: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
    discountValue: z.number().positive(),
    maxDiscountAmount: z.number().positive().optional(),
    validFrom: z.string().transform(val => new Date(val)).optional(),
    validUntil: z.string().transform(val => new Date(val)),
    maxUses: z.number().int().positive().optional(),
    maxUsesPerUser: z.number().int().positive().optional(),
    minOrderAmount: z.number().min(0).default(0),
    applicableTo: z.enum(['all_products', 'specific_categories', 'specific_products']).default('all_products'),
    categoryIds: z.array(z.string()).default([]),
    productIds: z.array(z.string()).default([]),
    excludedProductIds: z.array(z.string()).default([]),
    userEligibility: z.enum(['all_users', 'new_users', 'specific_users']).default('all_users'),
    canCombineWithBargain: z.boolean().default(false),
    canCombineWithOtherGlobal: z.boolean().default(false),
    firstOrderOnly: z.boolean().default(false),
    notes: z.string().max(1000).optional(),
  }),
});

// POST - Bulk generate coupons
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = BulkGenerateSchema.parse(body);
    
    await connectToDatabase();
    
    const { count, prefix, suffix, codeLength, template } = validatedData;
    
    // Generate coupons
    const coupons = [];
    const generatedCodes = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let code: string;
      let attempts = 0;
      
      // Generate unique code
      do {
        const randomPart = await CouponServices.generateUniqueCode(codeLength);
        code = `${prefix || ''}${randomPart}${suffix || ''}`;
        attempts++;
        
        if (attempts > 10) {
          throw new Error('Failed to generate unique coupon codes');
        }
      } while (generatedCodes.has(code));
      
      generatedCodes.add(code);
      
      coupons.push({
        ...template,
        code,
        createdBy: session.user.id,
        isActive: true,
        usedCount: 0,
        totalDiscountGiven: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Insert all coupons
    const result = await GlobalCouponModel.insertMany(coupons);
    
    log.info('Bulk coupons generated', { 
      count: result.length,
      generatedBy: session.user.id,
      templateName: template.name,
    });
    
    // Return summary (not all coupons to avoid large response)
    return NextResponse.json({
      success: true,
      message: `${count} coupons generated successfully`,
      summary: {
        count: result.length,
        prefix,
        suffix,
        codeLength,
        templateName: template.name,
        sampleCodes: result.slice(0, 5).map(c => c.code),
        downloadUrl: `/api/admin/coupons/bulk/export?batchId=${Date.now()}`, // Optional: create export endpoint
      },
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    log.error('Error bulk generating coupons', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to generate coupons' },
      { status: 500 }
    );
  }
}

// GET - Export bulk generated coupons (CSV)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    await connectToDatabase();
    interface CouponExportQuery {
  createdBy: string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
}
    // Build query for recently created coupons
    const query: CouponExportQuery = { createdBy: session.user.id };
    
    if (batchId) {
      const batchTime = new Date(parseInt(batchId));
      query.createdAt = {
        $gte: new Date(batchTime.getTime() - 5 * 60 * 1000), // 5 minutes before
        $lte: new Date(batchTime.getTime() + 5 * 60 * 1000), // 5 minutes after
      };
    }
    
    const coupons = await GlobalCouponModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Generate CSV
    const headers = ['Code', 'Name', 'Description', 'Discount Type', 'Discount Value', 'Valid From', 'Valid Until', 'Max Uses', 'Status'];
    const csvRows = [
      headers.join(','),
      ...coupons.map(coupon => [
        coupon.code,
        `"${coupon.name.replace(/"/g, '""')}"`,
        `"${coupon.description?.replace(/"/g, '""') || ''}"`,
        coupon.discountType,
        coupon.discountValue,
        coupon.validFrom.toISOString(),
        coupon.validUntil.toISOString(),
        coupon.maxUses || 'Unlimited',
        coupon.isActive ? 'Active' : 'Inactive',
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="coupons_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
    
  } catch (error) {
    log.error('Error exporting coupons', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to export coupons' },
      { status: 500 }
    );
  }
}