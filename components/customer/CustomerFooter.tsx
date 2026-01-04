"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  Truck,
  CreditCard,
  HelpCircle,
  FileText,
  Gift,
  RefreshCw,
  AlertTriangle,
  Cookie,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CustomerFooter() {
  const footerLinks = {
    "Shop & Policies": [
      { name: "Shop-n-Win Contest", href: "/shop-n-win-contest", icon: Gift },
      {
        name: "Returns & Refunds",
        href: "/returns-refunds-policy",
        icon: RefreshCw,
      },
      { name: "Warranty Policy", href: "/warranty-policy", icon: Shield },
      { name: "Shipping Policy", href: "/shipping-policy", icon: Truck },
    ],
    "Legal & Terms": [
      {
        name: "Terms & Conditions",
        href: "/terms-and-conditions",
        icon: FileText,
      },
      { name: "Privacy Policy", href: "/privacy-policy", icon: Shield },
      { name: "Cookie Policy", href: "/cookie-policy", icon: Cookie },
      { name: "Disclaimer", href: "/disclaimer", icon: AlertTriangle },
    ],
    "Help & Support": [
      { name: "FAQ", href: "/faq", icon: HelpCircle },
      { name: "Contact Us", href: "/contact", icon: HelpCircle },
      { name: "About Us", href: "/about", icon: HelpCircle },
    ],
  };

  const features = [
    {
      icon: Shield,
      title: "Secure Payments",
      desc: "100% secure transactions",
    },
    {
      icon: Truck,
      title: "Fast Shipping",
      desc: "2-9 business days across Pakistan",
    },
    {
      icon: CreditCard,
      title: "Easy Returns",
      desc: "72-hour return window",
    },
    {
      icon: Gift,
      title: "Shop & Win",
      desc: "Win prizes with every purchase",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/185WjBxPwM/", label: "Facebook" },
    // { icon: Twitter, href: "https://www.tiktok.com/@mega.prize.mall?_r=1&_t=ZS-92NZ1rNTia5", label: "Tiktok" },
    { icon: Instagram, href: "https://www.instagram.com/megaprizemall?igsh=MWZzdDAwOHB2bTkyMQ==", label: "Instagram" },
    // { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-linear-to-b from-white to-gray-50 border-t border-gray-200 mt-10">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="flex items-center space-x-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="p-3 rounded-xl bg-linear-to-br from-[#7C2C78]/10 to-[#EAB75F]/10">
                <feature.icon className="h-6 w-6 text-[#7C2C78]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative h-10 w-10 sm:h-12 sm:w-12"
              >
                <Image
                  src="/logo.png"
                  alt="Mega Prize Mall"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">
                  Mega Prize Mall
                </h2>
                <p className="text-gray-600 text-sm">
                  Unbeatable Deals Every Day!
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Your one-stop destination for premium mobile accessories, gadgets,
              and tech products with exciting deals, bargains, and lucky draw
              promotions.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-full bg-gray-100 hover:bg-linear-to-r hover:from-[#7C2C78] hover:to-[#A43875] group transition-all"
                >
                  <social.icon className="h-5 w-5 text-gray-600 group-hover:text-white" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-600 hover:text-[#7C2C78] transition-colors text-sm group"
                    >
                      {link.icon && (
                        <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                      )}
                      <span>{link.name}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal Notice */}
        <div className="mt-6 mb-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Mega Prize Mall operates as an independent e-commerce platform.
            Shop-n-Win is a promotional program, not a lottery or gambling
            activity. No purchase guarantees winning. See our{" "}
            <Link href="/disclaimer" className="text-[#7C2C78] hover:underline">
              Disclaimer
            </Link>{" "}
            for full details.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col space-y-2">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Mega Prize Mall. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              Developed and maintained by{" "}
              <a
                href="https://alphaintellisense.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7C2C78] hover:underline font-medium"
              >
                Alpha Intellisense
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/privacy-policy"
              className="text-gray-600 hover:text-[#7C2C78] text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-gray-600 hover:text-[#7C2C78] text-sm transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
