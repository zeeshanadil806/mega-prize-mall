import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
// import { CartProvider } from "@/components/cart/CartProvider";
import { SessProvider } from "@/components/providers/SessionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegistration } from "@/components/seo/ServiceWorkerRegistration";
import WhatsAppFloatingButton from "@/components/customer/WhatsAppFloatingButton";
import TiktokProvider from "@/components/providers/TiktokProvider";
import CookieConsent from "@/components/cookie/CookieConsent";
import TiktokScript from "@/components/providers/TiktokScript";
import MetaProvider from "@/components/providers/MetaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.megaprizemall.com"
          crossOrigin="anonymous"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      {/* <CartProvider> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsent />
        <SessProvider>
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
