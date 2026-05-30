// components/checkout/CheckoutClient.tsx - FINAL VERSION
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import {
  Loader2,
  Shield,
  Lock,
  ArrowLeft,
  Home,
  Plus,
  Check,
  User,
  MapPin,
} from "lucide-react";
import { Address, CheckoutState, CheckoutUser } from "@/types";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAllTracking } from "@/hooks/useAllTracking";
import { useTikTokPixel } from "@/lib/tiktok/client/tiktok-pixel";
import CheckoutSummary from "./CheckoutSummary";
import { useSession } from "next-auth/react";

interface CheckoutClientProps {
  user: CheckoutUser;
  userId: string;
  addresses: Address[];
}

// Format phone for display
const formatPhone = (phone: string): string => {
  if (!phone) return "";
  // Convert to +92 format
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("92")) return `+${cleaned}`;
  if (cleaned.startsWith("3")) return `+92${cleaned}`;
  if (cleaned.startsWith("0")) return `+92${cleaned.substring(1)}`;
  return phone;
};

// Get guest address from localStorage
const getGuestAddress = (): Address | null => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("mega-guest-address");
  return saved ? JSON.parse(saved) : null;
};

// Save guest address to localStorage
const saveGuestAddress = (address: Address): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("mega-guest-address", JSON.stringify(address));
};

// Clear guest address
const clearGuestAddress = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("mega-guest-address");
};

export default function CheckoutClient({
  user,
  userId,
  addresses,
}: CheckoutClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Initialize newAddress with guest address if exists
  const guestAddress = getGuestAddress();
  const [newAddress, setNewAddress] = useState({
    fullName: guestAddress?.fullName || user?.name || "",
    phone: guestAddress?.phone || user?.phone || "",
    addressLine1: guestAddress?.addressLine1 || "",
    addressLine2: guestAddress?.addressLine2 || "",
    city: guestAddress?.city || "",
    state: guestAddress?.state || "",
    postalCode: guestAddress?.postalCode || "",
    country: "Pakistan",
    isDefault: false,
  });

  const { items, clearCart, getGrandTotal } = useCartStore();
  const { trackInitiateCheckout } = useAllTracking();
  const { isInitialized } = useTikTokPixel();

  const [checkoutData, setCheckoutData] = useState<CheckoutState>(() => {
    // Initialize with guest address or saved addresses
    if (session?.user?.isGuest && guestAddress) {
      return {
        shippingAddress: guestAddress,
        billingAddress: null,
        useSameAddress: true,
        shippingMethod: "standard",
        pointsToUse: 0,
        appliedCoupons: [],
        notes: "",
      };
    }

    return {
      shippingAddress: addresses.find((addr) => addr.isDefault) || null,
      billingAddress: null,
      useSameAddress: true,
      shippingMethod: "standard",
      pointsToUse: 0,
      appliedCoupons: [],
      notes: "",
    };
  });

  const savedAddresses = addresses || [];

  // Track checkout initiation
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(
        items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.discountedPrice || item.price,
        })),
        parseFloat(
          getGrandTotal()
            .toString()
            .replace(/[^0-9.-]+/g, ""),
        ),
        "PKR",
      );
    }
  }, [items, getGrandTotal, trackInitiateCheckout, isInitialized]);

  // Auto-select first address if none selected (only for logged-in users)
  useEffect(() => {
    if (
      !session?.user?.isGuest &&
      savedAddresses.length > 0 &&
      !checkoutData.shippingAddress
    ) {
      const defaultAddress =
        savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
      setCheckoutData((prev) => ({
        ...prev,
        shippingAddress: defaultAddress,
      }));
    }
  }, [savedAddresses, checkoutData.shippingAddress, session?.user?.isGuest]);

  // Save guest address when it changes
  useEffect(() => {
    if (session?.user?.isGuest && checkoutData.shippingAddress) {
      saveGuestAddress(checkoutData.shippingAddress);
    }
  }, [checkoutData.shippingAddress, session?.user?.isGuest]);

  const handleSelectAddress = (address: Address) => {
    setCheckoutData((prev: CheckoutState) => ({
      ...prev,
      shippingAddress: address,
    }));
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    const required = [
      "fullName",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];
    const missing = required.filter(
      (field) =>
        !newAddress[field as keyof typeof newAddress]?.toString().trim(),
    );

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    try {
      const formattedPhone = formatPhone(newAddress.phone);

      if (session?.user?.isGuest) {
        // For guests, create address object and save locally
        const guestAddress: Address = {
          _id: `guest-${Date.now()}`,
          fullName: newAddress.fullName.trim(),
          phone: formattedPhone,
          addressLine1: newAddress.addressLine1.trim(),
          addressLine2: newAddress.addressLine2?.trim() || "",
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          postalCode: newAddress.postalCode.trim(),
          country: "Pakistan",
          isDefault: true,
          // isActive: true,
          label: "home",
          // userId: userId,
          // createdAt: new Date(),
          // updatedAt: new Date(),
        };

        setCheckoutData((prev: CheckoutState) => ({
          ...prev,
          shippingAddress: guestAddress,
        }));

        saveGuestAddress(guestAddress);
        toast.success("Address saved for this order");
      } else {
        // For logged-in users, save to database
        const response = await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newAddress,
            phone: formattedPhone,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save address");
        }

        const { data: savedAddress } = await response.json();
        setCheckoutData((prev: CheckoutState) => ({
          ...prev,
          shippingAddress: savedAddress,
        }));
        toast.success("Address saved successfully");
      }

      setShowAddressForm(false);

      // Don't reset form if guest (keep for editing)
      if (!session?.user?.isGuest) {
        setNewAddress({
          fullName: user?.name || "",
          phone: user?.phone || "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Pakistan",
          isDefault: false,
        });
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save address. Please try again.",
      );
    }
  };

  const handleClearAddress = () => {
    if (session?.user?.isGuest) {
      clearGuestAddress();
      setCheckoutData((prev: CheckoutState) => ({
        ...prev,
        shippingAddress: null,
      }));
      setNewAddress({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Pakistan",
        isDefault: false,
      });
      toast.info("Address cleared");
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData.shippingAddress) {
      toast.error("Please select or add a shipping address");
      return;
    }
    // For guests, require email
    if (session?.user?.isGuest && !checkoutData.guestEmail) {
      toast.error("Please enter your email address");
      return;
    }

    if (session?.user?.isGuest && checkoutData.guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(checkoutData.guestEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        userId: session?.user?.isGuest ? undefined : userId,
        guestSessionId: session?.user?.isGuest ? userId : undefined,
        guestEmail: session?.user?.isGuest
          ? checkoutData.guestEmail
          : undefined,
        guestPhone: checkoutData.shippingAddress?.phone,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          discountedPrice: item.discountedPrice,
          quantity: item.quantity,
          bargainCouponId: item.bargainCouponId,
          bargainDiscount: item.bargainDiscount,
        })),
        shippingAddress: {
          ...checkoutData.shippingAddress,
          phone: formatPhone(checkoutData.shippingAddress.phone),
        },
        billingAddress: checkoutData.useSameAddress
          ? {
              ...checkoutData.shippingAddress,
              phone: formatPhone(checkoutData.shippingAddress.phone),
            }
          : checkoutData.billingAddress,
        shippingMethod: checkoutData.shippingMethod,
        pointsToUse: checkoutData.pointsToUse,
        couponCodes: checkoutData.appliedCoupons.map((c) => c.code),
        notes: checkoutData.notes,
      };

      const response = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart and guest address on success
      clearCart();
      if (session?.user?.isGuest) {
        clearGuestAddress();
      }

      // Redirect to order confirmation
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (error) {
      console.error("Order placement error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C2C78]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header with Guest Badge */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">
            Complete Your Order
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Review your items and enter shipping details
            {session?.user?.isGuest && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Guest Checkout
              </span>
            )}
          </p>
          {session?.user?.isGuest && (
            <div className="mt-2 text-xs text-gray-500">
              <User className="inline h-3 w-3 mr-1" />
              You&apos;re checking out as a guest.
              <Link
                href="/login"
                className="text-[#7C2C78] hover:underline ml-1"
              >
                Login to earn points!
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <CheckoutSummary
              checkoutData={checkoutData}
              setCheckoutData={setCheckoutData}
              userId={userId}
            />
          </div>

          {/* Left Column - Checkout Form */}
          <div className="lg:w-2/3">
            {/* Security Badge */}
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-2.5 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-medium text-green-800 text-sm sm:text-base">
                  Secure Checkout
                </p>
                <p className="text-xs sm:text-sm text-green-700">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Home className="h-5 w-5 text-[#7C2C78]" />
                    Shipping Address
                  </h2>
                  {session?.user?.isGuest && checkoutData.shippingAddress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAddress}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Clear Address
                    </Button>
                  )}
                </div>

                {/* Guest Notice */}
                {session?.user?.isGuest && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Guest Checkout:</strong> Enter your shipping
                      address below. Your address will be saved temporarily for
                      this session.
                    </p>
                  </div>
                )}
                {session?.user?.isGuest && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={checkoutData.guestEmail || ""}
                      onChange={(e) =>
                        setCheckoutData((prev: CheckoutState) => ({
                          ...prev,
                          guestEmail: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For order confirmation and tracking
                    </p>
                  </div>
                )}

                {/* Saved Addresses (only for logged-in users) */}
                {!session?.user?.isGuest && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Select a saved address
                    </h3>
                    <div className="grid gap-3">
                      {savedAddresses.map((address: Address, index: number) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <label className="block cursor-pointer">
                            <input
                              type="radio"
                              name="shippingAddress"
                              checked={
                                checkoutData.shippingAddress?._id ===
                                address._id
                              }
                              onChange={() => handleSelectAddress(address)}
                              className="sr-only"
                            />
                            <div
                              className={`
                              p-4 border-2 rounded-xl transition-all
                              ${
                                checkoutData.shippingAddress?._id ===
                                address._id
                                  ? "border-[#7C2C78] bg-[#7C2C78]/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }
                            `}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`
                                  h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5
                                  ${
                                    checkoutData.shippingAddress?._id ===
                                    address._id
                                      ? "border-[#7C2C78] bg-[#7C2C78]"
                                      : "border-gray-300"
                                  }
                                `}
                                >
                                  {checkoutData.shippingAddress?._id ===
                                    address._id && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {address.fullName}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {address.addressLine1}
                                        {address.addressLine2 &&
                                          `, ${address.addressLine2}`}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {address.city}, {address.state}{" "}
                                        {address.postalCode}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        📞 {address.phone}
                                      </p>
                                    </div>
                                    {address.isDefault && (
                                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Selected Address Display */}
                {checkoutData.shippingAddress && !showAddressForm && (
                  <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {checkoutData.shippingAddress.fullName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {checkoutData.shippingAddress.addressLine1}
                            {checkoutData.shippingAddress.addressLine2 &&
                              `, ${checkoutData.shippingAddress.addressLine2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {checkoutData.shippingAddress.city},{" "}
                            {checkoutData.shippingAddress.state}{" "}
                            {checkoutData.shippingAddress.postalCode}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            📞 {formatPhone(checkoutData.shippingAddress.phone)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddressForm(true)}
                        className="text-[#7C2C78] hover:text-[#6A2566]"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}

                {/* Address Form */}
                {showAddressForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border border-gray-200 rounded-xl p-5"
                  >
                    <h3 className="font-medium text-gray-900 mb-4">
                      {checkoutData.shippingAddress
                        ? "Edit Shipping Address"
                        : "Add Shipping Address"}
                    </h3>

                    <div className="grid gap-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={newAddress.fullName}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                fullName: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                            placeholder="03XX XXXXXXX or +92XXXXXXXXXX"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pakistani format: 03XX XXXXXXX or +92XXXXXXXXXX
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine1}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              addressLine1: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                          placeholder="House #123, Street #45"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAddress.addressLine2}
                          onChange={(e) =>
                            setNewAddress((prev) => ({
                              ...prev,
                              addressLine2: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                          placeholder="Apartment, Suite, etc."
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                            placeholder="Karachi"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                            placeholder="Sindh"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={newAddress.postalCode}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                postalCode: e.target.value,
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#7C2C78] focus:border-transparent"
                            placeholder="75500"
                            required
                          />
                        </div>
                      </div>

                      {/* Only show "Set as default" for logged-in users */}
                      {!session?.user?.isGuest && (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="setDefault"
                            checked={newAddress.isDefault}
                            onChange={(e) =>
                              setNewAddress((prev) => ({
                                ...prev,
                                isDefault: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded"
                          />
                          <label
                            htmlFor="setDefault"
                            className="text-sm text-gray-700"
                          >
                            Set as default shipping address
                          </label>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#7C2C78] to-[#A43875] text-white rounded-lg hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all"
                        >
                          {checkoutData.shippingAddress
                            ? "Update Address"
                            : "Save Address"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : !checkoutData.shippingAddress ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowAddressForm(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#7C2C78] hover:bg-[#7C2C78]/5 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#7C2C78]/10">
                        <Plus className="h-4 w-4 text-gray-600 group-hover:text-[#7C2C78]" />
                      </div>
                      <span className="font-medium text-gray-900">
                        Add Shipping Address
                      </span>
                    </div>
                  </motion.button>
                ) : null}

                {/* Same as Billing Address */}
                {checkoutData.shippingAddress && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sameAsBilling"
                        checked={checkoutData.useSameAddress}
                        onChange={(e) =>
                          setCheckoutData((prev: CheckoutState) => ({
                            ...prev,
                            useSameAddress: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 text-[#7C2C78] focus:ring-[#7C2C78] border-gray-300 rounded"
                      />
                      <label htmlFor="sameAsBilling" className="text-gray-700">
                        Use same address for billing
                      </label>
                    </div>
                  </div>
                )}

                {/* Payment Method (COD Only) */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Payment Method
                  </h3>
                  <div className="p-4 border-2 border-[#7C2C78] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Cash on Delivery
                        </div>
                        <div className="text-sm text-gray-600">
                          Pay when you receive your order
                        </div>
                      </div>
                      <div className="h-6 w-6 rounded-full border-2 border-[#7C2C78] flex items-center justify-center">
                        <Check className="h-3 w-3 text-[#7C2C78]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !checkoutData.shippingAddress}
                    className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>

                  {!checkoutData.shippingAddress && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Please add a shipping address
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Back to Cart Link */}
            <div className="text-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
