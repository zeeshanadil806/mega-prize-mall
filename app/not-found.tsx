"use client"
import { Home, Search, ShoppingBag, ArrowLeft, Zap, Headphones, Speaker, Gamepad, Laptop } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/customer/Header'
import CustomerFooter from '@/components/customer/CustomerFooter'

export default function NotFound() {
  const popularCategories = [
    { name: 'Mobile Accessories', icon: Headphones, color: 'from-blue-500 to-cyan-500' },
    { name: 'Audio and Multimedia', icon: Speaker, color: 'from-amber-500 to-orange-500' },
    { name: 'Gaming Accessories', icon: Gamepad, color: 'from-purple-500 to-pink-500' },
    { name: 'PC and Laptop', icon: Laptop, color: 'from-green-500 to-emerald-500' },
  ]
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#011b54]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-[#022b82]/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-48 h-48 md:w-64 md:h-64 bg-[#011b54]/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          {/* Error Code with Animation */}
          <div className="relative mb-6 md:mb-8">
            <div className="text-[120px] sm:text-[140px] md:text-[180px] lg:text-[240px] font-bold text-gray-900 opacity-5 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#011b54] via-[#022b82] to-[#011b54] animate-pulse">
                  404
                </div>
                <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-linear-to-r from-[#011b54]/10 via-[#022b82]/10 to-[#011b54]/5 rounded-full blur-lg sm:blur-xl" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 md:mb-12">
            <Badge className="mb-4 md:mb-6 bg-linear-to-r from-[#011b54] to-[#022b82] text-white border-0 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
              Oops! Page Not Found
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
              Lost in <span className="text-[#011b54]">Tech Space</span>?
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              The page you&apos;re looking for seems to have drifted into the digital void. 
              But don&apos;t worry, we&apos;ve got plenty of amazing tech accessories waiting for you!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 md:mb-12 px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for products, categories, or brands..."
                className="pl-9 sm:pl-12 pr-20 sm:pr-24 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg border-2 border-gray-300 rounded-xl focus:border-[#011b54] focus:ring-[#011b54] w-full"
              />
              <Button 
                className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#03369f] h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
              >
                Search
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              Try searching for &quot;earbuds&quot;, &quot;chargers&quot;, or &quot;power banks&quot;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-12 md:mb-16 px-2">
            <Button
              size="default"
              className="w-full sm:w-auto bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#03369f] text-white px-6 sm:px-8 shadow-lg h-10 sm:h-11"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back to Home
              </Link>
            </Button>
            
            <Button
              size="default"
              variant="outline"
              className="w-full sm:w-auto border-[#011b54] text-[#011b54] hover:bg-[#011b54]/10 px-6 sm:px-8 h-10 sm:h-11"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse Products
              </Link>
            </Button>
            
            <Button
              size="default"
              variant="ghost"
              className="w-full sm:w-auto text-gray-600 hover:text-[#011b54] h-10 sm:h-11"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Go Back
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="mb-12 md:mb-16 px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
              Explore Popular Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {popularCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name}`}
                  className="group"
                >
                  <div className={`bg-linear-to-br ${category.color} p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}>
                    <category.icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white mx-auto mb-2 sm:mb-3 md:mb-4" />
                    <span className="text-white font-semibold text-xs sm:text-sm md:text-base">{category.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>


          {/* Bargain Zone CTA */}
          <div className="bg-linear-to-r from-[#011b54]/5 via-[#022b82]/5 to-[#011b54]/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 md:mb-12 border border-[#011b54]/20 mx-2">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-linear-to-r from-[#011b54] to-amber-400 flex items-center justify-center">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Want the Best Deal? Try Bargain Zone!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Negotiate prices on select products and save big on your favorite tech accessories.
            </p>
            <Button
              size="default"
              className="bg-linear-to-r from-[#011b54] to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg h-10 sm:h-11 px-6 sm:px-8"
              asChild
            >
              <Link href="/products?filter=bargain">
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Enter Bargain Zone
              </Link>
            </Button>
          </div>

          {/* Lucky Draw CTA */}
          <div className="bg-linear-to-r from-[#011b54] to-[#022b82] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white mx-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">
              🎉 Win Amazing Prizes!
            </h3>
            <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Every purchase above Rs3000 gives you lucky draw entries. Win wireless headphones, 
              power banks, and more every week!
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Button
                size="default"
                className="w-full sm:w-auto bg-white text-[#011b54] hover:bg-white/90 h-10 sm:h-11"
                asChild
              >
                <Link href="/dashboard/lucky-draw">
                  Check My Entries
                </Link>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 h-10 sm:h-11 bg-transparent"
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