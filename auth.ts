import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { MongoClient } from "mongodb";
import EmailSubscriber from "./models/EmailSubscriber";
import { sendGoogleWelcomeEmail } from "./lib/email-templates";
import { v4 as uuidv4 } from "uuid"; // ADD THIS

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const uri = process.env.MONGODB_URI!;

const client = new MongoClient(uri);
const clientPromise = client.connect();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/auth-error",
  },
  // allowDangerousEmailAccountLinking: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        // Check if email exists in EmailSubscriber model
        const isSubscriber = await Promise.race([
          EmailSubscriber.findOne({ email: profile.email }),
          new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
        ]);

        const basePoints = 0;
        const bonusPoints = isSubscriber ? 500 : 0;
        const totalPoints = basePoints + bonusPoints;
        console.log("isSubscriber)>>>", isSubscriber);
        console.log("totalPoints)>>>", totalPoints);
        console.log("bonusPoints)>>>", bonusPoints);

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "customer",
          points: totalPoints, // ✅ Add points here
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const validatedFields = credentialsSchema.safeParse(credentials);

          if (!validatedFields.success) {
            throw new Error("Invalid credentials format");
          }

          const { email, password } = validatedFields.data;

          // Find user
          const user = await UserModel.findOne({ email });

          if (!user) {
            throw new Error("User not found");
          }

          if (!user.password) {
            throw new Error("Please use your social login method");
          }

          // Compare password
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            points: user.points,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    {
      id: "guest",
      name: "Guest",
      type: "credentials",
      credentials: {
        // No credentials needed for guest
      },
      async authorize() {
        try {
          // Create guest user object (NOT saved to database)
          const guestId = `guest-${uuidv4()}`;

          return {
            id: guestId,
            name: "Guest",
            email: `${guestId}@temp.megaprizemall.com`,
            role: "guest",
            isGuest: true,
            points: 0,
            image: null,
          };
        } catch (error) {
          console.error("Guest auth error:", error);
          return null;
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "guest") {
        return true; // Guest users don't need DB operations
      }
      if (account?.provider === "google") {
        // Add bonus points for new Google users
        const existingUser = await UserModel.findOne({ email: user.email });

        if (!existingUser) {
          const isSubscriber = await EmailSubscriber.findOne({
            email: user.email,
          }).catch(() => false);

          const bonusPoints = isSubscriber ? 500 : 0;

          // Update user with points
          await UserModel.findOneAndUpdate(
            { email: user.email },
            {
              $set: {
                role: "customer",
                name: user.name,
                image: user.image,
              },
              $inc: { points: bonusPoints },
            },
          );

          // Send welcome email
          if (user.email && bonusPoints > 0) {
            await sendGoogleWelcomeEmail({
              to: user.email,
              name: user.name || user.email.split("@")[0],
              points: bonusPoints,
              loginMethod: "google",
            }).catch(console.error);
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // Get fresh data from DB
        if (account?.provider === "guest") {
          token.id = user.id;
          token.role = user.role || "guest";
          token.points = 0;
          token.name = user.name || "Guest";
          token.image = user.image;
          token.isGuest = true;
        } else {
          // For regular users, get fresh data from DB
          const dbUser = await UserModel.findOne({ email: user.email }).catch(
            () => null,
          );

          token.id = dbUser?._id.toString() || user.id;
          token.role = dbUser?.role || "customer";
          token.points = dbUser?.points || 0;
          token.name = dbUser?.name || user.name;
          token.image = dbUser?.image || user.image;
          token.isGuest = false;
        }
      }
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.image = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.points = token.points as number;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.isGuest = token.isGuest as boolean;
      }
      return session;
    },
  },
});
