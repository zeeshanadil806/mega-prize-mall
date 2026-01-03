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
        '/about',
        '/contact',
        '/bargain',
        '/lucky-draw-info',
        '/terms',
        '/privacy',
        '/shipping',
        '/refund',
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
        
        // Search pages (avoid parameter crawl waste)
        '/search',
        '/products?', // Query parameter pages
        
        // Temporary/development
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