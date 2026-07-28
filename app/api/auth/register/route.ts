import { NextResponse } from "next/server";
import { registerSchema } from "../../../lib/validators";
import {
  createUser,
  findUserByEmail,
  sanitizeUser,
} from "../../../lib/auth";
import { hashPassword } from "../../../lib/hash";
import { generateToken } from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingUser = await findUserByEmail(result.data.email);

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(result.data.password);

    const user = await createUser({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      password: hashedPassword,
      phone: result.data.phone,
    });

    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: sanitizeUser(user),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}