// app/robots.ts
import { MetadataRoute } from 'next';

const BASE_URL = 'https://megaprizemall.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/products/',
        '/categories/',
        '/terms-and-conditions',
        '/privacy-policy',
        '/shipping-policy',
        '/returns-refunds-policy',
        '/warranty-policy',
        '/cookie-policy',
        '/disclaimer',
        '/shop-n-win-contest',
        '/faq',
      ],
      disallow: [
        // Private user areas
        '/dashboard/',
        '/cart',
        '/checkout',

        // Authentication
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',

        // Admin areas
        '/admin/',

        // API endpoints
        '/api/',

        // Defensive: reserve /search if/when a search route is added
        '/search',

        // Next internals
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    
    // Additional directives for specific bots
    host: BASE_URL,
    
    // Optional: Crawl delay for heavy traffic (in seconds)
    // crawlDelay: 1,
  };
}