// // lib/product-service.ts
// import { ProductModel } from '@/models/Product';
// import { connectToDatabase } from '@/lib/mongodb';
// import { log } from '@/lib/logger';
// import { ProductProps } from '@/types';

// export async function getProductById(productId: string) {
//   try {
//     await connectToDatabase();
//     const product = await ProductModel.findById(productId).lean();
//     return product;
//   } catch (error) {
//     log.error('Error fetching product', { productId, error: error as Error });
//     return null;
//   }
// }

// export async function getProductsByIds(productIds: string[]) {
//   try {
//     await connectToDatabase();
//     const products = await ProductModel.find({
//       _id: { $in: productIds },
//       isActive: true,
//     }).lean();
    
//     return products.reduce((acc, product) => {
//       acc[product._id.toString()] = product;
//       return acc;
//     }, {} as Record<string, ProductProps>);
//   } catch (error) {
//     log.error('Error fetching products by IDs', { error: error as Error });
//     return {};
//   }
// }