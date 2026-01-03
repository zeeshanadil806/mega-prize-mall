// app/(auth)/register/page.tsx
import { Metadata } from 'next';
import RegisterForm from "@/components/auth/RegisterForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: 'Create Account | Sign Up for Mega Prize Mall',
  description: 'Join Mega Prize Mall to access exclusive deals, bargains on products, and personalized shopping experience. Create your free account in seconds.',
  keywords: 'register, sign up, create account, mega prize mall, shopping account, online shopping india',
  openGraph: {
    title: 'Create Account | Mega Prize Mall',
    description: 'Join Mega Prize Mall for exclusive deals and bargain shopping',
    type: 'website',
    url: 'https://megaprizemall.com/register',
    siteName: 'Mega Prize Mall',
    images: [{
      url: '/og-register.jpg',
      width: 1200,
      height: 630,
      alt: 'Mega Prize Mall Registration',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Account | Mega Prize Mall',
    description: 'Join Mega Prize Mall for exclusive deals and bargain shopping',
    images: ['/og-register.jpg'],
  },
  alternates: {
    canonical: 'https://megaprizemall.com/register',
  },
  robots: {
    index: false, // Don't index registration pages
    follow: true,
  },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join Mega Prize Mall for exclusive deals</p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Structured Data for Registration Page */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Create Account - Mega Prize Mall',
                description: 'Registration page for Mega Prize Mall online shopping platform',
                url: 'https://megaprizemall.com/register',
                breadcrumb: {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    {
                      '@type': 'ListItem',
                      position: 1,
                      name: 'Home',
                      item: 'https://megaprizemall.com',
                    },
                    {
                      '@type': 'ListItem',
                      position: 2,
                      name: 'Register',
                      item: 'https://megaprizemall.com/register',
                    },
                  ],
                },
              }),
            }}
          />
        </div>
      </div>
    </div>
  )
}