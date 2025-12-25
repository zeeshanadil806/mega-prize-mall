import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { z } from "zod";
import { log } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["customer", "admin", "support"]).default("customer"),
});

// Type from Zod schema
// type RegisterRequest = z.infer<typeof registerSchema>

// Response types
interface SuccessResponse {
  message: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
  };
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

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await UserModel.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      emailVerified: new Date(),
    });

    // Remove password from response
    const userWithoutPassword = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    log.info("User registered", {
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json<SuccessResponse>(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
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
    if (!err || typeof err !== 'object') return false
    return 'errors' in err && 'name' in err && err.name === 'ZodError'
  }

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
