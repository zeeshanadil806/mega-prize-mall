"use client";

import { motion } from "framer-motion";
import {
  Facebook,
  Instagram,
  Shield,
  ShieldCheck,
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
      icon: ShieldCheck,
      title: "100% Authentic",
      desc: "Verified genuine & warranty",
    },
    {
      icon: Truck,
      title: "Express Shipping",
      desc: "Cash on delivery nationwide",
    },
    {
      icon: RefreshCw,
      title: "Easy Returns",
      desc: "Hassle-free 72h window",
    },
    {
      icon: Gift,
      title: "Shop & Win",
      desc: "Draw entries on every order",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/185WjBxPwM/", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/megaprizemall?igsh=MWZzdDAwOHB2bTkyMQ==", label: "Instagram" },
  ];

  return (
    <footer className="bg-linear-to-b from-white to-gray-50 border-t border-gray-200 mt-4 sm:mt-6">
      {/* Features Bar - Sleek 2x2 App Grid on Mobile, 4-col on Desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 border-b border-gray-150/70">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 md:gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              className="flex items-center gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white shadow-2xs hover:shadow-xs transition-all border border-gray-150/80 hover:border-[#011b54]/25"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#011b54]/8 text-[#011b54] flex items-center justify-center shrink-0">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.9]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[11.5px] sm:text-xs md:text-sm font-bold text-gray-900 leading-tight truncate">
                  {feature.title}
                </h3>
                <p className="text-[9.5px] sm:text-[11px] md:text-xs text-gray-500 font-medium leading-tight mt-0.5 sm:mt-1 truncate">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-24 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-10 sm:h-12 w-44 sm:w-52 mb-3"
              >
                <Image
                  src="/logo-dark.png"
                  alt="Mega Prize Mall"
                  fill
                  className="object-contain object-left"
                  sizes="(max-width: 640px) 176px, 208px"
                />
              </motion.div>
              <p className="text-gray-600 text-sm font-medium">
                Your Luck, Your Price, Your Mall
              </p>
            </div>
            <p className="text-gray-600 mb-6 max-w-md text-sm leading-relaxed">
              Your one-stop destination for premium mobile accessories, gadgets,
              and tech products with exciting deals, bargains, and lucky draw
              promotions across Pakistan.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-[#011b54] group transition-all"
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
                      className="flex items-center space-x-2 text-gray-600 hover:text-[#011b54] transition-colors text-sm group"
                    >
                      {link.icon && (
                        <link.icon className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:text-[#011b54]" />
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
        <div className="mt-6 mb-2 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 text-center">
            Mega Prize Mall operates as an independent e-commerce platform.
            Shop-n-Win is a promotional program, not a lottery or gambling
            activity. No purchase guarantees winning. See our{" "}
            <Link href="/disclaimer" className="text-[#011b54] font-medium hover:underline">
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
              <Link
                href="https://alphaintellisense.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#011b54] hover:underline font-medium"
              >
                Alpha Intellisense
              </Link>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/privacy-policy"
              className="text-gray-600 hover:text-[#011b54] text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-gray-600 hover:text-[#011b54] text-sm transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
