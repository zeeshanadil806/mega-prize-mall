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
  ChevronDown,
  Package,
  Phone,
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
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

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
    let resolvedAddress = checkoutData.shippingAddress;

    // If no address selected yet, validate and build from inline form
    if (!resolvedAddress) {
      const required = ["fullName", "phone", "addressLine1", "city", "state", "postalCode"] as const;
      const missing = required.filter((f) => !newAddress[f]?.toString().trim());
      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.map((f) => f.replace(/([A-Z])/g, " $1").toLowerCase()).join(", ")}`);
        return;
      }
      const formattedPhone = formatPhone(newAddress.phone);
      resolvedAddress = {
        _id: `inline-${Date.now()}`,
        fullName: newAddress.fullName.trim(),
        phone: formattedPhone,
        addressLine1: newAddress.addressLine1.trim(),
        addressLine2: newAddress.addressLine2?.trim() || "",
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        postalCode: newAddress.postalCode.trim(),
        country: "Pakistan",
        isDefault: false,
        label: "home",
      };
      // Update state so the rest of handlePlaceOrder uses it
      setCheckoutData((prev: CheckoutState) => ({ ...prev, shippingAddress: resolvedAddress }));
      if (session?.user?.isGuest) saveGuestAddress(resolvedAddress);
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
        guestPhone: resolvedAddress?.phone,
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
          ...resolvedAddress,
          phone: formatPhone(resolvedAddress!.phone),
        },
        billingAddress: checkoutData.useSameAddress
          ? {
              ...resolvedAddress,
              phone: formatPhone(resolvedAddress!.phone),
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
        <Loader2 className="h-8 w-8 animate-spin text-[#011b54]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MINIMAL HEADER (Shopify-style)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <header className="border-b border-gray-200">
        {/* Mobile: Logo + collapsible order total */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileSummaryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200"
          >
            <div className="flex items-center gap-2 text-[#011b54] font-semibold text-sm">
              <Package className="h-4 w-4" />
              <span>Order summary</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  mobileSummaryOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {/* Grand total shown inline */}
              {typeof window !== "undefined" &&
                items.reduce((sum, item) => {
                  const price = item.discountedPrice || item.price;
                  return sum + price * item.quantity;
                }, 0) > 0
                ? `Rs ${items
                    .reduce((sum, item) => {
                      const price = item.discountedPrice || item.price;
                      return sum + price * item.quantity;
                    }, 0)
                    .toLocaleString("en-PK")}`
                : ""}
            </span>
          </button>

          {/* Collapsible mobile order summary */}
          {mobileSummaryOpen && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-4">
              <CheckoutSummary
                checkoutData={checkoutData}
                setCheckoutData={setCheckoutData}
                userId={userId}
              />
            </div>
          )}
        </div>

        {/* Desktop header: just logo centered */}
        <div className="hidden lg:flex items-center justify-center py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-[#011b54] hover:bg-[#022b82] bg-clip-text text-transparent tracking-tight">
              Mega Prize Mall
            </span>
          </Link>
        </div>
      </header>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 max-w-6xl mx-auto">

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              LEFT COLUMN â€” Form
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="flex-1 min-w-0">

            {/* Breadcrumb steps */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
              <span className="text-gray-900 font-medium">Information</span>
              <span>â€º</span>
              <span>Shipping</span>
              <span>â€º</span>
              <span>Payment</span>
            </nav>

            {/* â”€â”€ CONTACT SECTION â”€â”€ */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Contact</h2>
                {!session?.user || session?.user?.isGuest ? (
                  <Link href="/login" className="text-sm text-[#011b54] hover:underline">
                    Sign in
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium text-gray-800">{user?.name || user?.email}</span>
                    {session?.user?.isGuest && (
                      <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">Guest</span>
                    )}
                  </div>
                )}
              </div>

              {/* Guest email field */}
              {session?.user?.isGuest && (
                <div>
                  <input
                    type="email"
                    id="guestEmail"
                    value={checkoutData.guestEmail || ""}
                    onChange={(e) =>
                      setCheckoutData((prev: CheckoutState) => ({
                        ...prev,
                        guestEmail: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                    placeholder="Email or mobile phone number"
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-400">For order confirmation and tracking</p>
                </div>
              )}

              {/* Logged-in user email display */}
              {session?.user && !session?.user?.isGuest && (
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50 text-sm text-gray-600">
                  {user?.email}
                </div>
              )}
            </div>

            {/* â”€â”€ SHIPPING ADDRESS â”€â”€ */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Shipping address</h2>
                {session?.user?.isGuest && checkoutData.shippingAddress && (
                  <button
                    onClick={handleClearAddress}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Saved addresses for logged-in users */}
              {!session?.user?.isGuest && savedAddresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {savedAddresses.map((address, index) => (
                    <label key={index} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={checkoutData.shippingAddress?._id === address._id}
                        onChange={() => handleSelectAddress(address)}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 border-2 rounded-xl transition-all ${
                          checkoutData.shippingAddress?._id === address._id
                            ? "border-[#011b54] bg-[#011b54]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              checkoutData.shippingAddress?._id === address._id
                                ? "border-[#011b54] bg-[#011b54]"
                                : "border-gray-300"
                            }`}
                          >
                            {checkoutData.shippingAddress?._id === address._id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-gray-900 text-sm">{address.fullName}</p>
                              {address.isDefault && (
                                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {address.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}

                  {/* Add new address toggle */}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full flex items-center gap-2 p-3 text-sm text-[#011b54] hover:bg-[#011b54]/5 rounded-xl border border-dashed border-[#011b54]/40 hover:border-[#011b54] transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Use a different address
                  </button>
                </div>
              )}

              {/* Country/Region â€” always shown */}
              {(session?.user?.isGuest || savedAddresses.length === 0 || showAddressForm) && (
                <div className="space-y-3">
                  {/* Country - static */}
                  <div className="w-full border border-gray-300 rounded-xl px-4 py-3.5 bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Country/Region</p>
                      <p className="text-sm text-gray-900 font-medium">Pakistan</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newAddress.fullName.split(" ")[0] || ""}
                      onChange={(e) => {
                        const last = newAddress.fullName.split(" ").slice(1).join(" ");
                        setNewAddress((prev) => ({ ...prev, fullName: `${e.target.value} ${last}`.trim() }));
                      }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="First name"
                    />
                    <input
                      type="text"
                      value={newAddress.fullName.split(" ").slice(1).join(" ") || ""}
                      onChange={(e) => {
                        const first = newAddress.fullName.split(" ")[0] || "";
                        setNewAddress((prev) => ({ ...prev, fullName: `${first} ${e.target.value}`.trim() }));
                      }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="Last name"
                    />
                  </div>

                  {/* Address */}
                  <input
                    type="text"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                    placeholder="Address"
                    required
                  />

                  {/* Address line 2 */}
                  <input
                    type="text"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, addressLine2: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                    placeholder="Apartment, suite, etc. (optional)"
                  />

                  {/* City + Postal */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="City"
                      required
                    />
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="Postal code (optional)"
                    />
                  </div>

                  {/* State + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="Province / State"
                      required
                    />
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors"
                      placeholder="Phone"
                      required
                    />
                  </div>

                  {/* Save info checkbox for guests */}
                  {session?.user?.isGuest && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#011b54] focus:ring-[#011b54]"
                      />
                      <span className="text-sm text-gray-700">Save this information for next time</span>
                    </label>
                  )}

                  {/* Set as default for logged-in */}
                  {!session?.user?.isGuest && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-[#011b54] focus:ring-[#011b54]"
                      />
                      <span className="text-sm text-gray-700">Set as default shipping address</span>
                    </label>
                  )}

                  {/* Cancel button when editing (logged-in only) */}
                  {showAddressForm && checkoutData.shippingAddress && (
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      â† Cancel and use saved address
                    </button>
                  )}
                </div>
              )}

              {/* Selected address confirmation (logged-in, no form) */}
              {!session?.user?.isGuest && checkoutData.shippingAddress && !showAddressForm && savedAddresses.length > 0 && (
                <div className="mt-3 p-3 border border-green-200 bg-green-50 rounded-xl flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-green-800">
                    <p className="font-semibold">{checkoutData.shippingAddress.fullName}</p>
                    <p>{checkoutData.shippingAddress.addressLine1}{checkoutData.shippingAddress.addressLine2 && `, ${checkoutData.shippingAddress.addressLine2}`}</p>
                    <p>{checkoutData.shippingAddress.city}, {checkoutData.shippingAddress.state} {checkoutData.shippingAddress.postalCode}</p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="ml-auto text-xs text-[#011b54] hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* â”€â”€ PAYMENT METHOD â”€â”€ */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
              <div className="border-2 border-[#011b54] rounded-xl p-4 bg-[#011b54]/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-[#011b54]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when you receive your order</p>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-[#011b54] flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* â”€â”€ NOTES (optional) â”€â”€ */}
            <div className="mb-8">
              <textarea
                value={checkoutData.notes}
                onChange={(e) =>
                  setCheckoutData((prev: CheckoutState) => ({ ...prev, notes: e.target.value }))
                }
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#011b54]/30 focus:border-[#011b54] transition-colors resize-none"
                placeholder="Order notes (optional) â€” special instructions, landmarks, etc."
              />
            </div>

            {/* â”€â”€ PLACE ORDER BUTTON â”€â”€ */}
            <button
              onClick={handleSaveAddress}
              disabled={false}
              className="hidden"
              aria-hidden
            />
            <button
              onClick={handlePlaceOrder}
              disabled={
                isSubmitting ||
                (!checkoutData.shippingAddress &&
                  !(newAddress.addressLine1 && newAddress.city && newAddress.phone && newAddress.fullName))
              }
              className="w-full h-14 rounded-xl flex items-center justify-center gap-2 bg-[#011b54] hover:bg-[#022b82] hover:from-[#211E63] hover:to-[#6A2566] text-white font-semibold text-base shadow-[0_8px_30px_rgba(46,41,125,0.3)] hover:shadow-[0_12px_40px_rgba(124,44,120,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
              ) : (
                <><Lock className="h-4 w-4" /> Place Order</>
              )}
            </button>

            {(!checkoutData.shippingAddress &&
              !(newAddress.addressLine1 && newAddress.city && newAddress.phone)) && (
              <p className="text-xs text-center text-red-500 mt-2">Please complete your shipping address</p>
            )}

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
              <Shield className="h-3.5 w-3.5" />
              <span>All transactions are secure and encrypted</span>
            </div>

            {/* Back to cart */}
            <div className="text-center mt-6">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to cart
              </Link>
            </div>

            {/* Footer policy links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-8 pt-6 border-t border-gray-100">
              <Link href="/returns-refunds-policy" className="text-xs text-gray-400 hover:text-gray-600">Refund policy</Link>
              <Link href="/privacy-policy" className="text-xs text-gray-400 hover:text-gray-600">Privacy policy</Link>
              <Link href="/terms-and-conditions" className="text-xs text-gray-400 hover:text-gray-600">Terms of service</Link>
            </div>
          </div>

          {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
              RIGHT COLUMN â€” Sticky Order Summary (desktop only)
          â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="hidden lg:block lg:w-[380px] shrink-0">
            <div className="sticky top-8">
              <CheckoutSummary
                checkoutData={checkoutData}
                setCheckoutData={setCheckoutData}
                userId={userId}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
