import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth-helper";
import { sanitizeUser } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: sanitizeUser(user),
    });

  } catch (error) {
    console.error("Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}