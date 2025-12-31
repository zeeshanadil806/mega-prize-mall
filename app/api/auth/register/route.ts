import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
// import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { validateReferralCode, processReferral } from "@/lib/referral-utils";
import { z } from "zod";
import { log } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email-templates";

// Updated schema with optional referral code
const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "admin", "support"]).default("customer"),
  referralCode: z.string().optional().nullable().default(null), // NEW: Optional referral code
});

// Response types
interface SuccessResponse {
  message: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
  referralBonus?: number;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export async function POST(
  request: Request
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    await connectToDatabase();

    const body: unknown = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      email: validatedData.email,
    });

    if (existingUser) {
      return NextResponse.json<ErrorResponse>(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // --- NEW: Check and transfer EmailSubscriber points ---
    let emailSubscriberPoints = 0;

    try {
      const EmailSubscriber = (await import("@/models/EmailSubscriber"))
        .default;
      const existingSubscriber = await EmailSubscriber.findOne({
        email: validatedData.email.toLowerCase(),
      });

      if (existingSubscriber && existingSubscriber.points > 0) {
        emailSubscriberPoints = existingSubscriber.points;

        // Clear points from subscriber after transfer
        existingSubscriber.points = 0;
        await existingSubscriber.save();

        log.info("Transferred EmailSubscriber points", {
          email: validatedData.email,
          points: emailSubscriberPoints,
        });
      }
    } catch (subscriberError) {
      log.warn("Error checking EmailSubscriber", {
        email: validatedData.email,
        error: subscriberError as Error,
      });
      // Continue registration even if this fails
    }
    // --- END NEW ---

    // NEW: Validate referral code if provided
    console.log("validatedData.referralCode>>>", validatedData.referralCode);

    if (validatedData.referralCode) {
      const referralValidation = await validateReferralCode(
        validatedData.referralCode.trim(),
        validatedData.email
      );
      console.log("referralValidation>>>", referralValidation);

      if (!referralValidation.valid) {
        console.log("referralValidation.valid>>>", referralValidation.valid);
        return NextResponse.json<ErrorResponse>(
          { error: referralValidation.error || "Invalid referral code" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with 0 points initially
    const user = await UserModel.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      emailVerified: new Date(),
      points: emailSubscriberPoints || 0, // Start with 0, referral will add if valid
      referredBy: validatedData.referralCode?.trim() || null,
    });
    console.log("emailSubscriberPoints>>>", emailSubscriberPoints);
    console.log("user>>>", user);
    let referralBonus = 0;

    // NEW: Process referral if valid code provided
    if (validatedData.referralCode && validatedData.referralCode.trim()) {
      try {
        const referralResult = await processReferral(
          validatedData.referralCode.trim(),
          user._id.toString(),
          validatedData.email,
          validatedData.name
        );

        if (referralResult.success) {
          referralBonus = referralResult.newUserPoints || 0;

          // Refresh user to get updated points
          const updatedUser = await UserModel.findById(user._id);
          if (updatedUser) {
            user.points = updatedUser.points;
          }
        } else {
          console.log(referralResult);
        }
      } catch (referralError) {
        log.error("Referral processing error", {
          userId: user._id.toString(),
          error: referralError as Error,
        });
        // Continue registration even if referral fails
      }
    }

    // Remove password from response
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points,
    };

    log.info("User registered", {
      userId: user._id.toString(),
      email: user.email,
      subscriberPoints: emailSubscriberPoints,
      referralBonus: referralBonus,
    });

    const responseData: SuccessResponse = {
      message: "User created successfully",
      user: userWithoutPassword,
    };

    // Add referral bonus info if applicable
    if (referralBonus > 0) {
      responseData.referralBonus = referralBonus;
    }

    // Send welcome email (non-blocking)
    setTimeout(async () => {
      try {
        // Get user's referral code (generate or fetch)
        // const userRefCode =
        //   user.referralCode ||
        //   `REF${user._id.toString().slice(-8).toUpperCase()}`;

        await sendWelcomeEmail(
          {
            email: user.email,
            name: user.name,
            id: user._id.toString(),
          },
          emailSubscriberPoints, // 500 if from email list
          referralBonus, // 200 if referral used
          validatedData.referralCode?.trim(), // referral code used
          // userRefCode // user's own referral code
        );

        log.info("Welcome email sent", { userId: user._id.toString() });
      } catch (emailError) {
        log.error("Failed to send welcome email:", {
          error: emailError as Error,
          userId: user._id.toString(),
        });
      }
    }, 0);

    return NextResponse.json<SuccessResponse>(responseData, { status: 201 });
  } catch (error: unknown) {
    // Safe error logging
    if (error instanceof Error) {
      log.error("Registration error", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      log.error("Registration error", {
        message: String(error),
      });
    }

    const isZodError = (err: unknown): err is z.ZodError => {
      if (!err || typeof err !== "object") return false;
      return "errors" in err && "name" in err && err.name === "ZodError";
    };

    // Handle ZodError specifically
    if (isZodError(error)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: "Invalid input",
          details: error.format(),
        },
        { status: 400 }
      );
    }

    // Handle generic errors
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Internal server error";

    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
