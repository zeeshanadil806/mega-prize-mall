import ContactPage from "@/components/contact/ContactPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Mega Prize Mall Support & Helpdesk",
  description:
    "Get in touch with the Mega Prize Mall support team. Submit a support ticket, contact us via WhatsApp, or locate our main branch in Lahore, Pakistan.",
  keywords: [
    "contact us",
    "mega prize mall support",
    "customer service",
    "whatsapp support pakistan",
    "order support",
    "returns helpdesk",
    "tech accessories support",
  ].join(", "),
  openGraph: {
    title: "Contact Us - Mega Prize Mall Support & Helpdesk",
    description:
      "Have questions about bargains, orders, or lucky draws? Contact our secure customer support desk or open WhatsApp.",
    url: "https://megaprizemall.com/contact",
    siteName: "Mega Prize Mall",
    images: [
      {
        url: "https://megaprizemall.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Contact Mega Prize Mall Support",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Mega Prize Mall Helpdesk",
    description:
      "We're here to help. Reach out to our customer support team via chat, email, or our interactive ticket form.",
    images: ["https://megaprizemall.com/logo.png"],
  },
};

export default function Page() {
  return <ContactPage />;
}
