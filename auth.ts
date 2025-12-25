import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { UserModel } from "@/models/User"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { MongoClient } from "mongodb"

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const uri = process.env.MONGODB_URI!

const client = new MongoClient(uri)
const clientPromise = client.connect()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/auth-error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
      role: "customer", // ✅ Always set as customer for Google sign-ins
    }
  }
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = credentialsSchema.safeParse(credentials)
          
          if (!validatedFields.success) {
            throw new Error("Invalid credentials format")
          }
          
          const { email, password } = validatedFields.data
          
          // Find user
          const user = await UserModel.findOne({ email })
          
          if (!user) {
            throw new Error("User not found")
          }
          
          if (!user.password) {
            throw new Error("Please use your social login method")
          }
          
          // Compare password
          const isValid = await bcrypt.compare(password, user.password)
          
          if (!isValid) {
            throw new Error("Invalid password")
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})