import { NextResponse } from "next/server";
import { loginSchema } from "../../../lib/validators";
import { findUserByEmail, sanitizeUser } from "../../../lib/auth";
import { comparePassword } from "../../../lib/hash";
import { generateToken } from "../../../lib/jwt";
import {verifyToken} from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
  const body = await req.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const user = await findUserByEmail(result.data.email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isPasswordValid = await comparePassword(result.data.password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid password or email" }, { status: 401 });
  }

  const token = generateToken({
    userId: user.id.toString(),
    email: user.email,
    role: user.role.name,
  });

  return NextResponse.json({ success: true, message: "Login successful", token, user: sanitizeUser(user) },
{ status: 200 });
}
catch (error) {
  console.error("Error during login:", error);
  return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
}
}
