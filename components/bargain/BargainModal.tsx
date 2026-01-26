"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  // X,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  TrendingDown,
  AlertCircle,
  Sparkles,
  Timer,
} from "lucide-react";
import {
  formatCurrency,
  calculateDiscountPercentage,
} from "@/lib/bargain-utils";
// import { useTikTokTracking } from "@/hooks/useTikTokTracking";
import { useAllTracking } from '@/hooks/useAllTracking';

interface BargainModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    bargainEnabled: boolean;
    minBargainPrice: number;
    maxBargainRounds: number;
    bargainValidityHours: number;
    images?: Array<{ url: string; alt?: string }>;
  };
  userId: string;
  userBargainHistory?: {
    currentRound: number;
    previousOffers: Array<{
      offeredPrice: number;
      status: "accepted" | "rejected";
      createdAt: Date;
    }>;
  };
  onBargainSuccess?: (couponId: string, discountAmount: number) => void; // ADD THIS
}

export default function BargainModal({
  isOpen,
  onClose,
  product,
  userId,
  userBargainHistory,
  onBargainSuccess,
}: BargainModalProps) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    status: "accepted" | "rejected" | null;
    couponCode?: string;
    validUntil?: Date;
    discountPercentage?: number;
    savingAmount?: number;
  }>({ status: null });

  // Calculate current price (discounted or regular)
  const currentPrice = product.discountedPrice || product.price;

  // Calculate default offer (10% below current price)
  const defaultOffer = Math.max(
    product.minBargainPrice,
    Math.round(currentPrice * 0.9)
  );

  // Initialize offer price
  useEffect(() => {
    if (isOpen) {
      setOfferPrice(defaultOffer);
      setResult({ status: null });
      setMessage("");
    }
  }, [isOpen, defaultOffer]);

  // Calculate discount percentage
  const discountPercentage = calculateDiscountPercentage(
    currentPrice,
    offerPrice
  );

  // Calculate saving amount
  const savingAmount = currentPrice - offerPrice;

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setOfferPrice(value[0]);
  };
  const { trackBargainAccepted ,trackBargainInitiated } = useAllTracking();

  // Handle bargain submission
  const handleBargainSubmit = async () => {
    if (!userId) {
      toast.error("Please login to bargain");
      return;
    }

    if (offerPrice < product.minBargainPrice) {
      toast.error(`Minimum offer is Rs ${product.minBargainPrice}`);
      return;
    }

    if (offerPrice >= currentPrice) {
      toast.error("Offer must be less than current price");
      return;
    }
    trackBargainInitiated(
      product.id,
      product.name,
      currentPrice, // original price
      offerPrice // user's offer
    );

    setLoading(true);
    setProcessing(true);

    try {
      // Simulate 3-second processing delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const response = await fetch("/api/bargain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          offeredPrice: offerPrice,
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bargain failed");
      }

      if (data.success && data.data.status === "accepted") {
        trackBargainAccepted(
    product.id,
    product.name,
    currentPrice, // original price
    offerPrice, // accepted price
    data.data.couponId || data.data._id // bargain/coupon ID
  );
        setResult({
          status: data.data.status,
          couponCode: data.data.couponCode,
          validUntil: new Date(data.data.validUntil),
          discountPercentage: data.data.discountPercentage,
          savingAmount: data.data.savingAmount,
        });

        // Call onBargainSuccess if provided
        if (onBargainSuccess && data.data.couponId) {
          onBargainSuccess(data.data.couponId, data.data.savingAmount);
        }

        toast.success("🎉 Bargain Accepted! Coupon generated.");
      } else {
        toast.info("Bargain rejected. Try a better offer!");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Bargain failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setProcessing(false), 500);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!processing) {
      onClose();
    }
  };

  // Get bargain round info
  const currentRound = userBargainHistory?.currentRound || 1;
  const roundsLeft = product.maxBargainRounds - currentRound + 1;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center text-xl">
              <Tag className="h-5 w-5 mr-2 text-[#7C2C78]" />
              Make an Offer
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={processing}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
          <DialogDescription>
            Negotiate a better price for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Comparison */}
          <Card className="p-4 border-2 border-dashed border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Current Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentPrice)}
                </p>
                {product.discountedPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Your Offer</p>
                <p className="text-2xl font-bold text-[#7C2C78]">
                  {formatCurrency(offerPrice)}
                </p>
                <p className="text-sm text-green-600">
                  Save {formatCurrency(savingAmount)} ({discountPercentage}%)
                </p>
              </div>
            </div>
          </Card>

          {/* Bargain Rounds Info */}
          {userBargainHistory && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  Round {currentRound} of {product.maxBargainRounds}
                </span>
              </div>
              <Badge variant="outline">
                {roundsLeft} {roundsLeft === 1 ? "round" : "rounds"} left
              </Badge>
            </div>
          )}

          {/* Minimum Price Warning */}
          {offerPrice < product.minBargainPrice && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Offer too low
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Minimum acceptable price is{" "}
                    {formatCurrency(product.minBargainPrice)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="offer-price">Your Offer Price</Label>
              <span className="text-2xl font-bold text-[#7C2C78]">
                {formatCurrency(offerPrice)}
              </span>
            </div>

            <Slider
              id="offer-price"
              min={product.minBargainPrice}
              max={currentPrice}
              step={10}
              value={[offerPrice]}
              onValueChange={handleSliderChange}
              disabled={processing || loading}
              className="py-4"
            />

            <div className="flex justify-between text-sm text-gray-500">
              <span>Min: {formatCurrency(product.minBargainPrice)}</span>
              <span>Max: {formatCurrency(currentPrice)}</span>
            </div>
          </div>

          {/* Quick Offer Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((percent) => {
              const quickPrice = Math.max(
                product.minBargainPrice,
                Math.round(currentPrice * (1 - percent / 100))
              );
              return (
                <Button
                  key={percent}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOfferPrice(quickPrice)}
                  disabled={processing || loading}
                  className="text-sm"
                >
                  {percent}% Off
                </Button>
              );
            })}
          </div>

          {/* Optional Message */}
          <div>
            <Label htmlFor="message">Message to Seller (Optional)</Label>
            <Input
              id="message"
              placeholder="Why should we accept your offer?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={processing || loading}
              className="mt-2"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/200 characters
            </p>
          </div>

          {/* Processing Animation */}
          <AnimatePresence>
            {processing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center py-6"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-16 w-16 mb-4">
                    <div className="absolute inset-0 border-4 border-[#7C2C78]/20 rounded-full"></div>
                    <div className="absolute inset-2 border-4 border-[#7C2C78] rounded-full animate-spin border-t-transparent"></div>
                    <Timer className="absolute inset-4 h-8 w-8 text-[#7C2C78]" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    Processing your offer...
                  </p>
                  <p className="text-gray-600 mt-1">This will take 3 seconds</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Display */}
          <AnimatePresence>
            {result.status && !processing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card
                  className={`p-6 border-2 ${
                    result.status === "accepted"
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
                        result.status === "accepted"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {result.status === "accepted" ? (
                        <CheckCircle className="h-8 w-8" />
                      ) : (
                        <XCircle className="h-8 w-8" />
                      )}
                    </div>

                    <h3
                      className={`text-xl font-bold ${
                        result.status === "accepted"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {result.status === "accepted"
                        ? "🎉 Offer Accepted!"
                        : "Offer Rejected"}
                    </h3>

                    <p
                      className={`mt-2 ${
                        result.status === "accepted"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {result.status === "accepted"
                        ? `You saved ${formatCurrency(
                            result.savingAmount || 0
                          )}!`
                        : `Offer must be at least ${formatCurrency(
                            product.minBargainPrice
                          )}`}
                    </p>

                    {result.status === "accepted" && result.couponCode && (
                      <div className="mt-6 w-full space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-center mb-2">
                            <Sparkles className="h-5 w-5 text-[#EAB75F] mr-2" />
                            <span className="font-mono font-bold text-lg text-[#7C2C78]">
                              {result.couponCode}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Valid for 24 hours • Product specific
                          </p>
                          {result.validUntil && (
                            <div className="mt-3 flex items-center justify-center text-sm">
                              <Clock className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">
                                Expires:{" "}
                                {result.validUntil.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                tomorrow
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(result.couponCode!);
                              toast.success("Coupon copied to clipboard!");
                            }}
                          >
                            Copy Code
                          </Button>
                          <Button
                            className="bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white"
                            onClick={() => {
                              if (onBargainSuccess && result.couponCode) {
                                onBargainSuccess(
                                  result.couponCode,
                                  result.savingAmount || 0
                                );
                              }
                              toast.success("Added to cart with coupon!");
                              onClose();
                            }}
                          >
                            Use Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {result.status === "rejected" && roundsLeft > 0 && (
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setResult({ status: null });
                            setOfferPrice(
                              Math.max(
                                product.minBargainPrice,
                                Math.round(offerPrice * 1.05) // 5% increase
                              )
                            );
                          }}
                        >
                          Try Again ({roundsLeft - 1} attempts left)
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {!result.status && !processing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBargainSubmit}
                disabled={
                  loading ||
                  processing ||
                  offerPrice < product.minBargainPrice ||
                  offerPrice >= currentPrice ||
                  currentRound > product.maxBargainRounds
                }
                className="flex-1 bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Make Offer
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Tips */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              💡 <strong>Bargain Tips:</strong> Start with 10-15% below price.
              You have {product.maxBargainRounds} attempts. Accepted offers
              generate 24-hour coupons.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
