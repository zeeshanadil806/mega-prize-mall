"use client";

import { useState } from "react";
import { STORE_CONFIG } from "@/shared/config";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    orderNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success("Support ticket created successfully!");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: MessageSquare,
      title: "Chat on WhatsApp",
      desc: "Instant replies during business hours.",
      contact: `+${STORE_CONFIG.supportPhone.slice(0, 2)} ${STORE_CONFIG.supportPhone.slice(2, 5)} ${STORE_CONFIG.supportPhone.slice(5)}`,
      actionText: "Open WhatsApp",
      actionUrl: STORE_CONFIG.whatsappLink,
      color: "from-green-500/10 to-emerald-500/10 text-green-600 border-green-200",
    },
    {
      icon: Mail,
      title: "Email Support",
      desc: "For inquiries, billing, and returns.",
      contact: STORE_CONFIG.supportEmail,
      actionText: "Send Email",
      actionUrl: `mailto:${STORE_CONFIG.supportEmail}`,
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-200",
    },
  ];

  return (
    <div className="py-12 bg-linear-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Contact <span className="bg-linear-to-r from-[#7C2C78] to-[#A43875] bg-clip-text text-transparent">Support Team</span>
          </motion.h1>
          <p className="text-lg text-gray-600">
            Got questions about your order, bargain deals, or lucky draw entries? We&apos;re here to help. Reach out to us via the contact form or direct channels.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Cards + Address */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Cards */}
            {contactCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 bg-white rounded-2xl border ${card.color.split(" ").slice(-1)[0]} shadow-xs space-y-4`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-linear-to-br ${card.color.split(" ").slice(0, 2).join(" ")} ${card.color.split(" ").slice(2, 3)[0]}`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{card.title}</h3>
                    <p className="text-xs text-gray-500">{card.desc}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800 font-mono">
                  {card.contact}
                </div>
                <Button asChild className="w-full bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white">
                  <Link href={card.actionUrl} target="_blank">
                    {card.actionText}
                  </Link>
                </Button>
              </motion.div>
            ))}

            {/* Support Details Box */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-xs"
            >
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">Support Details</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-[#7C2C78] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Operating Hours</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Monday to Saturday: 10:00 AM - 8:00 PM</p>
                    <p className="text-xs text-gray-400">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-[#7C2C78] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Headquarters</h4>
                    <p className="text-xs text-gray-600 mt-0.5">Mega Prize Mall, Hall Road, Lahore, Pakistan</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Secure Helpdesk</h4>
                    <p className="text-xs text-gray-600 mt-0.5">All tickets are private and encrypted. Our agents will resolve questions within 24 hours.</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs relative"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Create Support Ticket</h2>
                      <p className="text-xs text-gray-500">Submit a query and we will get back to you via email.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2C78]/30 focus:border-[#7C2C78] transition-colors"
                          placeholder="e.g. Ali Ahmed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-700">Email Address <span className="text-red-500">*</span></label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2C78]/30 focus:border-[#7C2C78] transition-colors"
                          placeholder="name@domain.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="subject" className="text-xs font-semibold text-gray-700">Subject <span className="text-red-500">*</span></label>
                        <input
                          id="subject"
                          type="text"
                          required
                          value={formState.subject}
                          onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2C78]/30 focus:border-[#7C2C78] transition-colors"
                          placeholder="Support issue, return, question"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="order" className="text-xs font-semibold text-gray-700">Order Number <span className="text-gray-400">(Optional)</span></label>
                        <input
                          id="order"
                          type="text"
                          value={formState.orderNumber}
                          onChange={(e) => setFormState({ ...formState, orderNumber: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2C78]/30 focus:border-[#7C2C78] transition-colors"
                          placeholder="e.g. MPM-12345"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-xs font-semibold text-gray-700">Detailed Message <span className="text-red-500">*</span></label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C2C78]/30 focus:border-[#7C2C78] transition-colors resize-none"
                        placeholder="Write details about your question or issue here..."
                      />
                    </div>

                    <button
                      id="submit-ticket"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 sm:h-14 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#2E297D] to-[#7C2C78] hover:from-[#211E63] hover:to-[#6A2566] text-white font-semibold text-base shadow-[0_8px_30px_rgba(46,41,125,0.25)] hover:shadow-[0_12px_40px_rgba(124,44,120,0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Submit Support Request
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-6"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600 border border-green-100 shadow-xs">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
                      <p className="text-sm text-gray-600 max-w-sm mx-auto">
                        Thank you for contacting us, <strong>{formState.name}</strong>. A support representative will email you at <strong>{formState.email}</strong> shortly.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setFormState({ name: "", email: "", subject: "", message: "", orderNumber: "" });
                        setIsSubmitted(false);
                      }}
                      className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
                    >
                      Submit Another Query
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
