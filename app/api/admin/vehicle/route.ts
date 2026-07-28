import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById } from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";
import { vehicleSchema } from "@/app/lib/validators";
import { VehicleStatus } from "@prisma/client";

export async function POST(request: Request) {
  try{
  const body = await request.json();
  const result = vehicleSchema.safeParse(body);

if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  if(!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

console.log("Authorization Header:", authHeader);
console.log("Token:", token);

const payload = verifyToken(token);

console.log("Payload:", payload);

if (!payload) {
  return NextResponse.json(
    { error: "Invalid or expired token" },
    { status: 401 }
  );
}

const user = await findUserById(Number(payload.userId));
if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
requireAdmin(user);
const vehicle = await prisma.vehicle.create({
  data: {
    name: result.data.name,
    model: result.data.model,
    plateNumber: result.data.plateNumber,
    color: result.data.color,
    capacity: result.data.capacity,
    status: result.data.status as VehicleStatus,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "vehicle created successfully",
    data: vehicle,
  },
  {
    status: 201,
  }
);
  }
catch (error) {
    console.error("Error creating vehicles:", error);

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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await findUserById(Number(payload.userId));

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    requireAdmin(user);

    const vehicle = await prisma.vehicle.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "vehicle  retrieved successfully",
        data: vehicle,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}