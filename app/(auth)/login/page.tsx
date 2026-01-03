import LoginPage from '@/components/auth/LoginPage'
import React from 'react'
import type { Metadata } from 'next';
import Head from 'next/head';

export const metadata: Metadata = {
  title: "Login to Your Account | Mega Prize Mall - Accessories Mall",
  description: "Sign in to your Mega Prize Mall account to access your dashboard, track orders, use bargain feature, check lucky draw entries, and manage your mobile accessories shopping.",
  keywords: "login, sign in, account login, Mega Prize Mall login, shopping account, bargain account, lucky draw account",
  
  robots: {
    index: false, // Login pages should NOT be indexed
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  
  // Open Graph
  openGraph: {
    title: "Login | Mega Prize Mall",
    description: "Sign in to access your shopping dashboard, bargain features, and lucky draw entries",
    type: "website",
    url: "https://megaprizemall.com/login",
    siteName: "Mega Prize Mall",
  },
  
  // Canonical
  alternates: {
    canonical: "https://megaprizemall.com/login",
  },
  
  // Additional security/privacy
  other: {
    'og:type': 'website',
    'og:site_name': 'Mega Prize Mall',
    'robots': 'noindex, nofollow',
  },
};

export default function page() {
  return (
    <div>
      <Head>
  <meta name="robots" content="noindex, nofollow, noarchive, nocache, nosnippet" />
  <meta name="googlebot" content="noindex, nofollow, noimageindex" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</Head>
      <LoginPage />
    </div>
  )
}
