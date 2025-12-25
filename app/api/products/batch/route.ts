// app/api/products/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { log } from '@/lib/logger';
import { CartItem } from '@/types';

type BatchProduct = Pick<CartItem, 
  | 'name' 
  | 'bargainEnabled' 
  | 'minBargainPrice' 
  | 'maxBargainRounds' 
  | 'bargainValidityHours' 
  | 'images'
> & { _id: string };

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid product IDs' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const products = await ProductModel.find({
      _id: { $in: productIds },
      isActive: true,
    }).select('name bargainEnabled minBargainPrice maxBargainRounds bargainValidityHours images').lean();
    
    // Convert to object with productId as key
    const productsMap = products.reduce((acc, product) => {
      acc[product._id.toString()] = {
        _id: product._id.toString(),
        name: product.name,
        bargainEnabled: product.bargainEnabled,
        minBargainPrice: product.minBargainPrice,
        maxBargainRounds: product.maxBargainRounds,
        bargainValidityHours: product.bargainValidityHours,
        images: product.images,
      };
      return acc;
    }, {} as Record<string, BatchProduct>);
    
    return NextResponse.json(productsMap);
    
  } catch (error) {
    log.error('Error fetching batch products', { error: error as Error });
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}