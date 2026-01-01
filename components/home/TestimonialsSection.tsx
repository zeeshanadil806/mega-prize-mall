// components/home/TestimonialsSection.tsx
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Star, 
  Quote, 
//   Smartphone, 
  Headphones,
  Gamepad2,
  Zap
} from 'lucide-react';

const TestimonialsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const testimonials = [
    {
      name: 'Ahmed Raza',
      role: 'Mobile Gamer',
      comment: 'Got my gaming headset at 30% off through bargaining! Best deal ever for PUBG sessions.',
      rating: 5,
      product: 'Gaming Headset',
      icon: <Gamepad2 className="h-5 w-5" />,
    },
    {
      name: 'Sara Khan',
      role: 'Content Creator',
      comment: 'Bargained for my vlogging mic and saved ₹2,000. The process was so smooth!',
      rating: 5,
      product: 'Vlogging Microphone',
      icon: <Headphones className="h-5 w-5" />,
    },
    {
      name: 'Ali Hassan',
      role: 'Tech Student',
      comment: 'Needed a power bank urgently, bargained and got it below market price. Super happy!',
      rating: 4,
      product: 'Power Bank',
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  return (
    <section 
      ref={ref}
      className="py-20 bg-linear-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">Tech Lovers </span>
            <span className="gradient-text">Love Us</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our community of tech enthusiasts say about their bargain experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="h-8 w-8 text-[#7C2C78]/20" />
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating
                          ? 'text-[#EAB75F] fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Comment */}
                <p className="text-gray-700 mb-6 italic">
                  &quot;{testimonial.comment}&quot;
                </p>
                
                {/* User Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {testimonial.icon}
                    <span>{testimonial.product}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;