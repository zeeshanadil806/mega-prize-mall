"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, User, Mail, AlertCircle } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCheckout: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onGuestCheckout,
}: CheckoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-gray-900 text-center">
            Continue to Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 sm:py-6">
          {/* Login Option */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 bg-[#011b54]/10 rounded-lg">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#011b54]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Login to Your Account
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Save your order history and track easily
                </p>
              </div>
            </div>

            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/checkout")}`}
              className="block"
              onClick={onClose}
            >
              <Button
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-linear-to-r from-[#011b54] to-[#022b82] hover:from-[#022b82] hover:to-[#03369f] text-white gap-2 sm:gap-3"
              >
                Login to Continue
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/register?callbackUrl=${encodeURIComponent("/checkout")}`}
                  className="text-[#011b54] hover:text-[#022b82] font-medium underline underline-offset-2"
                  onClick={onClose}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Guest Checkout Option */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Continue as Guest
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Checkout without creating an account
                </p>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900 gap-2 sm:gap-3"
              onClick={onGuestCheckout}
            >
              Checkout as Guest
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Guest Checkout Notice */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
              <div className="flex gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base font-medium text-amber-800 mb-1">
                    Important Notice
                  </p>
                  <ul className="text-xs sm:text-sm text-amber-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>Your order will not be saved to your account</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>
                        You will only receive email updates about order status
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>
                        Order tracking will be available via email only
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>
                        To save order history and track easily, please login
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help Text */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-[#011b54] hover:text-[#022b82] underline underline-offset-2"
                onClick={onClose}
              >
                Contact our support team
              </Link>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          <Button
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={onClose}
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
