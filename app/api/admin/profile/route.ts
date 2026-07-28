import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth-helper";
import { requireAdmin } from "../../../lib/permissions";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);

    requireAdmin(user);

    return NextResponse.json({
      message: "Admin profile accessed successfully",
      admin: user,
    });

  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (error.message === "Forbidden") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}