import "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role?: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      points?: nummber | null
      role?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}