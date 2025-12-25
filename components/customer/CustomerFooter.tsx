"use client"

import { motion } from "framer-motion"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Heart,
  Shield,
  Truck,
  CreditCard
} from "lucide-react"

export default function CustomerFooter() {
  const footerLinks = {
    Shop: ["Mobile Cases", "Chargers", "Earphones", "Power Banks", "Smart Watches"],
    Support: ["Contact Us", "FAQ", "Shipping Policy", "Return Policy", "Privacy Policy"],
    Company: ["About Us", "Careers", "Blog", "Press", "Terms of Service"],
  }

  const features = [
    { icon: Shield, title: "Secure Payments", desc: "100% secure transactions" },
    { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
    { icon: CreditCard, title: "Easy Returns", desc: "30-day return policy" },
  ]

  return (
    <footer className="bg-linear-to-b from-white to-gray-50 border-t border-gray-200 mt-20">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="flex items-center space-x-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
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
              <div className="w-12 h-12 bg-linear-to-br from-[#7C2C78] via-[#A43875] to-[#EAB75F] rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">MPM</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">
                  Mega Prize Mall
                </h2>
                <p className="text-gray-600 text-sm">Unbeatable Deals Every Day!</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              Your one-stop destination for premium mobile accessories with exciting deals, bargains, and lucky draws.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <motion.a
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="p-2 rounded-full bg-gray-100 hover:bg-linear-to-r hover:from-[#7C2C78] hover:to-[#A43875] group transition-all"
                >
                  <Icon className="h-5 w-5 text-gray-600 group-hover:text-white" />
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
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href="#"
                      className="text-gray-600 hover:text-[#7C2C78] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Mega Prize Mall. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-[#7C2C78] text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-[#7C2C78] text-sm">
              Terms of Service
            </a>
            <div className="flex items-center text-sm text-gray-600">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> in India
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}