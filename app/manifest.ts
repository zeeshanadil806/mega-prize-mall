// app/manifest.ts
import { MetadataRoute } from 'next';

const BASE_URL = 'https://megaprizemall.com';

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Basic App Info
    name: 'Mega Prize Mall',
    short_name: 'MPM',
    description: 'Mobile accessories store with bargain feature & lucky draw rewards. Shop phone cases, chargers, earbuds with price negotiation.',
    
    // Identity
    id: '/?source=pwa',
    start_url: '/',
    scope: '/',
    
    // Display
    display: 'standalone', // or 'fullscreen', 'minimal-ui'
    display_override: ['window-controls-overlay'],
    orientation: 'portrait-primary',
    
    // Theme & Colors
    theme_color: '#7C2C78', // Your primary color
    background_color: '#F8F9FA', // Your light color
    
    // Icons - CRITICAL: You need to create these files in /public
    icons: [
      // Android/Chrome
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png', // ✅ REQUIRED for Android
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png', // ✅ REQUIRED for Android
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // iOS/Safari
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
      // Splash screen for iOS
      {
        src: '/icons/splash-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/splash-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    
    // Categories for App Stores
    categories: ['shopping', 'ecommerce', 'lifestyle'],
    
    // E-commerce specific features
    prefer_related_applications: false,
    
    // Shortcuts for quick actions (Android)
    shortcuts: [
      {
        name: 'Shop Now',
        short_name: 'Shop',
        description: 'Browse mobile accessories',
        url: '/products',
        icons: [
          {
            src: '/icons/shortcut-shop-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Bargain Deals',
        short_name: 'Bargain',
        description: 'Make offers on products',
        url: '/bargain',
        icons: [
          {
            src: '/icons/shortcut-bargain-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Lucky Draw',
        short_name: 'Draw',
        description: 'Check your lucky draw entries',
        url: '/dashboard/lucky-draw',
        icons: [
          {
            src: '/icons/shortcut-draw-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
    
    // App features declaration
    related_applications: [],
    
    // Protocol handlers (if you have deep links)
    protocol_handlers: [
      {
        protocol: 'web+megaprizemall',
        url: '/products/%s',
      },
    ],
  };
}