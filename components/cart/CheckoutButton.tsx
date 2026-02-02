"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CheckoutModal from "./CheckoutModal";

interface CheckoutButtonProps {
  className?: string;
  totalItems: number;
}

export default function CheckoutButton({
  className = "",
  totalItems,
}: CheckoutButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { status, data: session } = useSession();

  const handleCheckoutClick = () => {
    if (status === "loading") return;

    if (status === "authenticated") {
      // User is logged in, go directly to checkout
      router.push("/checkout");
    } else {
      // User is not logged in, show modal
      setShowModal(true);
    }
  };

  const handleGuestCheckout = () => {
    setShowModal(false);
    router.push("/checkout");
  };

  return (
    <>
      <Button
        size="lg"
        className={`w-full h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] text-white gap-2 ${className}`}
        onClick={handleCheckoutClick}
        disabled={totalItems === 0 || status === "loading"}
      >
        {status === "loading" ? (
          "Loading..."
        ) : (
          <>
            Proceed to Checkout
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 rotate-180" />
          </>
        )}
      </Button>

      <CheckoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onGuestCheckout={handleGuestCheckout}
      />
    </>
  );
}
