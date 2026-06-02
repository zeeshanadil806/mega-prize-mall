import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
// import { CartProvider } from "@/components/cart/CartProvider";
import { SessProvider } from "@/components/providers/SessionProvider";
import { auth } from "@/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegistration } from "@/components/seo/ServiceWorkerRegistration";
import WhatsAppFloatingButton from "@/components/customer/WhatsAppFloatingButton";
import TiktokProvider from "@/components/providers/TiktokProvider";
import CookieConsent from "@/components/cookie/CookieConsent";
import TiktokScript from "@/components/providers/TiktokScript";
import MetaProvider from "@/components/providers/MetaProvider";

// Single Inter load that drives `font-sans` and the body's default
// font-family across every page. Display=swap avoids FOIT on slow networks.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Mono kept for SKUs, order IDs, code-style displays via `font-mono`.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://megaprizemall.com"),
  title: {
    default:
      "Mega Prize Mall - Mobile Accessories with Bargain & Lucky Draw",
    template: "%s | Mega Prize Mall",
  },
  description:
    "Pakistan's first mobile accessories store where you can bargain prices & win prizes. Shop phone cases, chargers, earbuds and more with price negotiation and lucky draw rewards.",
  applicationName: "Mega Prize Mall",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Mega Prize Mall" }],
  creator: "Mega Prize Mall",
  publisher: "Mega Prize Mall",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#7C2C78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://pub-b072b472844f414b9c691e5a9b16d1e1.r2.dev"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://pub-b072b472844f414b9c691e5a9b16d1e1.r2.dev"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      {/* <CartProvider> */}
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <CookieConsent />
        <SessProvider session={session}>
          <ToastProvider />
          <TiktokProvider enabled={process.env.NODE_ENV === "production"}>
            <MetaProvider enabled={process.env.NODE_ENV === "production"}>
              <TiktokScript />
              {children}
            </MetaProvider>
          </TiktokProvider>
          <SpeedInsights />
          <Analytics />
          <ServiceWorkerRegistration />
          <WhatsAppFloatingButton
            phoneNumber="923254007037"
            message="Hello Mega Prize Mall! I have a question about your mobile accessories."
            position="bottom-right"
            showOnMobile={true}
            showOnDesktop={true}
            bounceInterval={5000}
          />
        </SessProvider>
      </body>
      {/* </CartProvider> */}
    </html>
  );
}
