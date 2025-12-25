// app/(customer)/page.tsx
import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesSection from '@/components/home/CategoriesSection';
import HowItWorks from '@/components/home/HowItWorks';
// import Testimonials from '@/components/home/Testimonials';
// import CallToAction from '@/components/home/CallToAction';
import { getFeaturedProducts, getCategoriesWithCount } from '@/lib/home-data';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Mega Prize Mall - Bargain, Earn Points, Win Prizes!',
  description: 'Pakistan\'s first gamified e-commerce platform. Bargain for better prices, earn points on purchases, and win amazing prizes in lucky draws!',
  keywords: 'bargain shopping, earn points, lucky draw, Pakistan e-commerce, online shopping',
  openGraph: {
    title: 'Mega Prize Mall - Bargain, Earn Points, Win Prizes!',
    description: 'Pakistan\'s first gamified e-commerce platform',
    type: 'website',
    images: ['/og-home.jpg'],
  },
};

export default async function HomePage() {
  // Fetch data in parallel for better performance
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategoriesWithCount(),
  ]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section with Parallax */}
      <HeroSection />
      
      {/* Featured Products */}
      <section id="featured" className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-linear-to-b from-white via-gray-50/50 to-white -z-10" />
        <div className="container mx-auto px-4">
          <FeaturedProducts products={featuredProducts} />
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 md:py-24 bg-linear-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <HowItWorks />
        </div>
      </section>
      
      {/* Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesSection categories={categories} />
          </Suspense>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          {/* <Testimonials /> */}
        </div>
      </section>
      
      {/* Call to Action */}
      {/* <CallToAction /> */}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}