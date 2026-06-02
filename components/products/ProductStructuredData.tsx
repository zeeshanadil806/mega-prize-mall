// Server-rendered Product JSON-LD. Emits Schema.org Product markup that
// Google's rich-result eligibility requires (priceValidUntil, seller,
// hasMerchantReturnPolicy). Skips aggregateRating/review until real review
// data is collected — faking those is worse than omitting them.
import { ProductProps } from '@/types/index';

interface ProductStructuredDataProps {
  product: ProductProps;
}

// Use end-of-year as a stable price-validity horizon so the JSON-LD is
// cache-friendly (same value within a calendar year) instead of changing on
// every render.
function priceValidUntil(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 11, 31)).toISOString().slice(0, 10);
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const productUrl = `https://megaprizemall.com/products/${product.slug}`;
  const effectivePrice = product.discountedPrice && product.discountedPrice > 0
    ? product.discountedPrice
    : product.price;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: product.name,
    description: product.description,
    sku: product.sku || product._id,
    ...(product.sku && { mpn: product.sku }),
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    image: product.images?.map(img => img.url) || [],
    ...(product.color && { color: product.color }),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: effectivePrice,
      priceValidUntil: priceValidUntil(),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Mega Prize Mall',
        url: 'https://megaprizemall.com',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 10,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
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
