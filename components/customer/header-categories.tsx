import {
  Smartphone,
  Headphones,
  Gamepad2,
  Laptop,
  Zap,
  Watch,
  Camera,
  Tv,
  Wifi,
  Shield,
  Battery,
  SmartphoneCharging,
  Package,
} from "lucide-react";
import type { ReactNode } from "react";

export interface HeaderCategory {
  name: string;
  href: string;
  icon: ReactNode;
}

export function getCategoryIcon(name: string, className = "h-4 w-4"): ReactNode {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("mobile acc") || normalized.includes("mobile accessories")) {
    return <Smartphone className={className} />;
  }
  if (normalized.includes("gaming")) {
    return <Gamepad2 className={className} />;
  }
  if (normalized.includes("audio") || normalized.includes("multimedia") || normalized.includes("headphones")) {
    return <Headphones className={className} />;
  }
  if (normalized.includes("pc") || normalized.includes("laptop")) {
    return <Laptop className={className} />;
  }
  if (normalized.includes("power") || normalized.includes("charging") || normalized.includes("cable") || normalized.includes("battery")) {
    return <Zap className={className} />;
  }
  if (normalized.includes("wearable") || normalized.includes("watch")) {
    return <Watch className={className} />;
  }
  if (normalized.includes("camera") || normalized.includes("content") || normalized.includes("vlog")) {
    return <Camera className={className} />;
  }
  if (normalized.includes("tv")) {
    return <Tv className={className} />;
  }
  if (normalized.includes("wifi") || normalized.includes("connectivity") || normalized.includes("router")) {
    return <Wifi className={className} />;
  }
  if (normalized.includes("case") || normalized.includes("protector") || normalized.includes("shield")) {
    return <Shield className={className} />;
  }
  if (normalized.includes("holder") || normalized.includes("stand")) {
    return <SmartphoneCharging className={className} />;
  }
  return <Package className={className} />;
}

export const headerCategories: HeaderCategory[] = [
  {
    name: "Mobile Accessories",
    icon: <Smartphone className="h-4 w-4" />,
    href: "/products?category=Mobile+Accessories",
  },
  {
    name: "Audio and Multimedia",
    icon: <Headphones className="h-4 w-4" />,
    href: "/products?category=Audio+and+Multimedia",
  },
  {
    name: "Gaming Accessories",
    icon: <Gamepad2 className="h-4 w-4" />,
    href: "/products?category=Gaming+Accessories",
  },
  {
    name: "PC and Laptop",
    icon: <Laptop className="h-4 w-4" />,
    href: "/products?category=PC+and+Laptop+Accessories",
  },
  {
    name: "Power and Charging",
    icon: <Zap className="h-4 w-4" />,
    href: "/products?category=Power+and+Charging",
  },
];
