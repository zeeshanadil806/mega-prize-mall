"use client"
import { Home, Search, ShoppingBag, ArrowLeft, Zap, Smartphone, Headphones, Battery } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/customer/Header'
import CustomerFooter from '@/components/customer/CustomerFooter'

export default function NotFound() {
  const popularCategories = [
    { name: 'Wireless Earbuds', icon: Headphones, color: 'from-blue-500 to-cyan-500' },
    { name: 'Power Banks', icon: Battery, color: 'from-amber-500 to-orange-500' },
    { name: 'Phone Cases', icon: Smartphone, color: 'from-purple-500 to-pink-500' },
    { name: 'Fast Chargers', icon: Zap, color: 'from-green-500 to-emerald-500' },
  ]
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7C2C78]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A43875]/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-[#EAB75F]/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto">
        {/* Header */}
        
        <Header />

        {/* Main Content */}
        <main className="max-w-4xl mx-auto text-center">
          {/* Error Code with Animation */}
          <div className="relative mb-8">
            <div className="text-[180px] md:text-[240px] font-bold text-gray-900 opacity-5 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#7C2C78] via-[#A43875] to-[#EAB75F] animate-pulse">
                  404
                </div>
                <div className="absolute -inset-4 bg-linear-to-r from-[#7C2C78]/10 via-[#A43875]/10 to-[#EAB75F]/10 rounded-full blur-xl" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-12">
            <Badge className="mb-6 bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white border-0 text-sm px-4 py-2">
              Oops! Page Not Found
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lost in <span className="text-[#7C2C78]">Tech Space</span>?
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The page you&apos;re looking for seems to have drifted into the digital void. 
              But don&apos;t worry, we&apos;ve got plenty of amazing tech accessories waiting for you!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products, categories, or brands..."
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-[#7C2C78] focus:ring-[#7C2C78]"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A]"
              >
                Search
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Try searching for &quot;earbuds&quot;, &quot;chargers&quot;, or &quot;power banks&quot;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white px-8 shadow-lg"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-[#EAB75F] text-[#EAB75F] hover:bg-[#EAB75F]/10 px-8"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Products
              </Link>
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              className="text-gray-600 hover:text-[#7C2C78]"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Explore Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group"
                >
                  <div className={`bg-linear-to-br ${category.color} p-6 rounded-2xl text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl`}>
                    <category.icon className="h-12 w-12 text-white mx-auto mb-4" />
                    <span className="text-white font-semibold">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>


          {/* Bargain Zone CTA */}
          <div className="bg-linear-to-r from-[#7C2C78]/5 via-[#A43875]/5 to-[#EAB75F]/5 rounded-3xl p-8 mb-12 border border-[#EAB75F]/20">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-linear-to-r from-[#EAB75F] to-amber-400 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want the Best Deal? Try Bargain Zone!
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Negotiate prices on select products and save big on your favorite tech accessories.
            </p>
            <Button
              size="lg"
              className="bg-linear-to-r from-[#EAB75F] to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg"
              asChild
            >
              <Link href="/products?filter=bargain">
                <Zap className="mr-2 h-5 w-5" />
                Enter Bargain Zone
              </Link>
            </Button>
          </div>

          {/* Lucky Draw CTA */}
          <div className="bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              🎉 Win Amazing Prizes!
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Every purchase above Rs3000 gives you lucky draw entries. Win wireless headphones, 
              power banks, and more every week!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-[#7C2C78] hover:bg-white/90"
                asChild
              >
                <Link href="/dashboard/lucky-draw">
                  Check My Entries
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/products">
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <CustomerFooter />
      </div>
    </div>
  )
}