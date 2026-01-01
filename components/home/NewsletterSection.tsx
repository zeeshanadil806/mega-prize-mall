// components/home/NewsletterSection.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Gift, 
  Shield, 
  CheckCircle,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic email validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/email-subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          source: 'homepage-newsletter'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      setIsSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <Gift className="h-5 w-5" />,
      text: 'Exclusive coupon codes',
      color: 'text-[#EAB75F]',
      bgColor: 'bg-[#EAB75F]/10',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: 'Early access to new arrivals',
      color: 'text-[#A43875]',
      bgColor: 'bg-[#A43875]/10',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: 'Bargain success tips',
      color: 'text-[#2E297D]',
      bgColor: 'bg-[#2E297D]/10',
    },
  ];

  return (
    <section className="py-20 bg-linear-to-r from-[#2E297D]/10 to-[#7C2C78]/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 text-[#7C2C78] text-sm font-medium mb-4">
              <Mail className="h-4 w-4" />
              <span>Stay Updated</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900">Get Tech Deals & </span>
              <span className="bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                Bargain Tips
              </span>
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive electronics deals, bargain strategies, and prize draw updates
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`h-10 w-10 rounded-lg ${benefit.bgColor} flex items-center justify-center`}>
                      <div className={benefit.color}>
                        {benefit.icon}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{benefit.text}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">Successfully subscribed!</div>
                      <div className="text-sm text-green-700">
                        Check your email for a welcome coupon
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-lg bg-linear-to-r from-red-50 to-orange-50 border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Error</div>
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Newsletter Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null); // Clear error when user types
                        }}
                        placeholder="Enter your email address"
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-[#7C2C78] focus:ring-2 focus:ring-[#7C2C78]/20 outline-none transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    By subscribing, you agree to our Privacy Policy and consent to receive
                    updates about our latest deals and promotions.
                  </p>
                </div>
              </form>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-gray-200"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold bg-linear-to-r from-[#A43875] to-[#EAB75F] bg-clip-text text-transparent">
                    10K+
                  </div>
                  <div className="text-sm text-gray-600">Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#7C2C78]">₹500 OFF</div>
                  <div className="text-sm text-gray-600">Welcome Coupon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EAB75F]">Weekly</div>
                  <div className="text-sm text-gray-600">Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2E297D]">No Spam</div>
                  <div className="text-sm text-gray-600">Promise</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Join our community of tech enthusiasts. Get notified about:
              • New electronics arrivals • Limited-time bargains • Prize draw winners
              • Exclusive member-only deals
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;