import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  driverAssignmentSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = driverAssignmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.flatten(),
      },
      {
        status: 400,
      }
    );
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
const booking = await prisma.booking.findUnique({
  where: {
    id: result.data.bookingId,
  },
});

if (!booking) {
  return NextResponse.json(
    {
      error: "Booking not found",
    },
    {
      status: 404,
    }
  );
}
const driver = await prisma.driver.findUnique({
  where: {
    id: result.data.driverId,
  },
});

if (!driver) {
  return NextResponse.json(
    {
      error: "Driver Not Found",
    },
    {
      status: 409,
    }
  );
}
const vehicle = await prisma.vehicle.findUnique({
  where: {
    id: result.data.vehicleId,
  },
});

if (!vehicle) {
  return NextResponse.json(
    {
      error: "Vehicle Not Found",
    },
    {
      status: 409,
    }
  );
}
const driverAssignment = await prisma.driverAssignment.create({
  data: {
    bookingId: result.data.bookingId,
    driverId: result.data.driverId,
    vehicleId: result.data.vehicleId,
    pickupLocation: result.data.pickupLocation,
    dropoffLocation: result.data.dropoffLocation,
    pickupTime: result.data.pickupTime,
    completedAt: result.data.completedAt,
  },
});
 return NextResponse.json(
  {
    success: true,
    message: "Driver Assignment created successfully",
    data: driverAssignment,
  },
  {
    status: 201,
  }
);
}
catch (error) {
    console.error("Error creating Driver Assignment:", error);

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

  const dassignment = await prisma.driverAssignment.findMany({
  orderBy: {
    assignedAt: "desc",
  },
  include: {
    booking: true,
    driver: true,
    vehicle: true,
  },
});

    return NextResponse.json(
      {
        success: true,
        message: "Driver Assignment retrieved successfully",
        data: dassignment,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("Error fetching Driver Assignments:", error);

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