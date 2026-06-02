import {
  Smartphone,
  Headphones,
  Gamepad2,
  Laptop,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

export interface HeaderCategory {
  name: string;
  href: string;
  icon: ReactNode;
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
