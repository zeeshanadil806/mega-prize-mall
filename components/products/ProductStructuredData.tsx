// app/components/products/ProductStructuredData.tsx
'use client';

import { ProductProps } from '@/types/index';

interface ProductStructuredDataProps {
  product: ProductProps;
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://megaprizemall.com/products/#${product.sku || product._id}`,
    name: product.name,
    description: product.description,
    sku: product.sku || product._id,
    mpn: product.sku || product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    image: product.images?.map(img => img.url) || [],
    color: product.color,
    offers: {
      '@type': 'Offer',
      url: `https://megaprizemall.com/products/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.discountedPrice > 0 ? product.discountedPrice : product.price,
    //   priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
      },
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Bargain Available',
          value: product.bargainEnabled ? 'true' : 'false',
        },
        ...(product.minBargainPrice ? [{
          '@type': 'PropertyValue',
          name: 'Minimum Bargain Price',
          value: product.minBargainPrice.toString(),
        }] : []),
      ],
    },
    ...(product.tags && product.tags.length > 0 && {
      keywords: product.tags.join(', '),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}