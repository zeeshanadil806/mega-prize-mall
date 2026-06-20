import AboutPage from "@/components/about/AboutPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Mega Prize Mall - Gamified Tech Accessory Shopping",
  description:
    "Learn about Mega Prize Mall, Pakistan's premier gamified tech accessory store. Discover our bargaining system, Shop-n-Win lucky draws, and authentic gadget collection.",
  keywords: [
    "about us",
    "mega prize mall",
    "gamified e-commerce",
    "mobile accessories pakistan",
    "lucky draw shop",
    "online bargain shopping",
    "authentic gadget store",
    "lahore tech store",
  ].join(", "),
  openGraph: {
    title: "About Us - Mega Prize Mall | Gamified E-commerce Platform",
    description:
      "Curated tech gadgets with real-time bargaining and exciting prize draws. Read our story and milestones.",
    url: "https://megaprizemall.com/about",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "About Mega Prize Mall",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Mega Prize Mall - Pakistan's Tech & Prize Hub",
    description:
      "Read our story on how we are redefining mobile accessories shopping in Pakistan with our bargain system and lucky draws.",
    images: ["https://megaprizemall.com/logo.png"],
  },
};

export default function Page() {
  return <AboutPage />;
}
