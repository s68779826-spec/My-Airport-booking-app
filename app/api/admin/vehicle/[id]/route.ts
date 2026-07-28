import { NextResponse } from "next/server";
import type { VehicleStatus } from "@prisma/client";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import prisma from "@/app/lib/prisma";
import { vehicleSchema } from "@/app/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const vehicleId = Number(id);
    if (isNaN(vehicleId)) {
  return NextResponse.json(
    {
      error: "Invalid vehicle ID",
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
const vehicle = await prisma.vehicle.findUnique({
  where: {
    id: vehicleId,
  },
});
if (!vehicle) {
  return NextResponse.json(
    {
      error: "vehicles category not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "vehicles Data retrieved successfully",
    data: vehicle,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicleId = Number(id);
    if (isNaN(vehicleId)) {
  return NextResponse.json(
    { error: "Invalid vehicle ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
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
if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
requireAdmin(user);
const existingvehicle = await prisma.vehicle.findUnique({
  where: {
    id: vehicleId,
  },
});
if (!existingvehicle) {
  return NextResponse.json(
    { error: " vehicle is not found" },
    { status: 404 }
  );
}

const updatedvehicle = await prisma.vehicle.update({
  where: {
    id: vehicleId,
  },
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
    message: "vehicle updated successfully",
    data: updatedvehicle,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vehicleId = Number(id);
    if (isNaN(vehicleId)) {
  return NextResponse.json(
    { error: "Invalid vehicle ID" },
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
const vehicle = await prisma.vehicle.findUnique({
  where: {
    id: vehicleId,
  },
});
if (!vehicle) {
  return NextResponse.json(
    { error: "vehicle category not found" },
    { status: 404 }
  );
}
const deletevehicle= await prisma.vehicle.delete({
    where :{
        id:vehicleId,
    },


});

return NextResponse.json(
  { message: "Service deleted successfully", service: deletevehicle}
);

}