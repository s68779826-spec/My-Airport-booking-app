import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { driverAssignmentSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const Driver_AssignmentId = Number(id);
    if (isNaN(Driver_AssignmentId)) {
  return NextResponse.json(
    {
      error: "Invalid driver assignment ID",
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
const driverassignment = await prisma.driverAssignment.findUnique({
  where: {
    id: Driver_AssignmentId,
  },
});
if (!driverassignment) {
  return NextResponse.json(
    {
      error: "driver assignment not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "driver assignment  retrieved successfully",
    data: driverassignment,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const driverassignmentId = Number(id);
    if (isNaN(driverassignmentId)) {
  return NextResponse.json(
    { error: "Invalid driver Assignment ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = driverAssignmentSchema.safeParse(body);
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
const booking = await prisma.booking.findUnique({
  where: {
    id: result.data.bookingId,
  },
});

if (!booking) {
  return NextResponse.json(
    { error: "Booking not found" },
    { status: 404 }
  );
}
const driver = await prisma.driver.findUnique({
  where: { id: result.data.driverId },
});

if (!driver) {
  return NextResponse.json(
    { error: "Driver not found" },
    { status: 404 }
  );
}

const vehicle = await prisma.vehicle.findUnique({
  where: { id: result.data.vehicleId },
});

if (!vehicle) {
  return NextResponse.json(
    { error: "Vehicle not found" },
    { status: 404 }
  );
}
const updatedDriverAssignment = await prisma.driverAssignment.update({
  where: {
    id: driverassignmentId,
  },
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
    message: "Driver Assignment updated successfully",
    data: updatedDriverAssignment,
  },
  { status: 200 }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const driverassignmentId = Number(id);
    if (isNaN(driverassignmentId)) {
  return NextResponse.json(
    { error: "Invalid driver assignment ID" },
    { status: 400 }
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
const driverassignment = await prisma.driverAssignment.findUnique({
  where: {
    id: driverassignmentId,
  },
});
if (!driverassignment) {
  return NextResponse.json(
    { error: "driver Assignment  not found" },
    { status: 404 }
  );
}
const deletedriverassignment= await prisma.driverAssignment.delete({
    where :{
        id:driverassignmentId,
    },


});

return NextResponse.json(
  { message: "Driver Assignment deleted successfully", service: deletedriverassignment
    
  }
);

}

