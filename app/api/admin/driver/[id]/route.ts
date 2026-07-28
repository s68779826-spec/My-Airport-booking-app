import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { driverSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";
import { DriverStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const driverId = Number(id);
    if (isNaN(driverId)) {
  return NextResponse.json(
    {
      error: "Invalid driver  ID",
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
const driver = await prisma.driver.findUnique({
  where: {
    id: driverId,
  },
  include: {
    assignments: {
      include: {
        booking: true,
        vehicle: true,
      },
    },
  },
});
if (!driver) {
  return NextResponse.json(
    {
      error: "driver  not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "driver data  retrieved successfully",
    data: driver,
  },
  {
    status: 200,
  }
);
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const driverId = Number(id);
    if (isNaN(driverId)) {
  return NextResponse.json(
    { error: "Invalid driver  ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = driverSchema.safeParse(body);
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
const driver = await prisma.driver.findUnique({
  where: {
    id: driverId,
  },
});

if (!driver) {
  return NextResponse.json(
    {
      error: "Driver not found",
    },
    {
      status: 404,
    }
  );
}
const existingDriver = await prisma.driver.findFirst({
  where: {
    AND: [
      {
        OR: [
          { phone: result.data.phone },
          { email: result.data.email },
          { licenseNumber: result.data.licenseNumber },
        ],
      },
      {
        NOT: {
          id: driverId,
        },
      },
    ],
  },
});

if (existingDriver) {
  return NextResponse.json(
    {
      error: "Phone, email, or license number is already in use",
    },
    {
      status: 409,
    }
  );
}

const updatedDriver = await prisma.driver.update({
  where: {
    id: driverId,
  },
  data: {
    firstName: result.data.firstName,
        lastName: result.data.lastName,
        phone: result.data.phone,
        email: result.data.email,
        licenseNumber: result.data.licenseNumber,
        profileImage: result.data.profileImage,
         status: result.data.status as DriverStatus,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Driver  updated successfully",
    data: updatedDriver,
  },
  { status: 200 }
);
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const driverId = Number(id);
    if (isNaN(driverId)) {
  return NextResponse.json(
    { error: "Invalid driver  ID" },
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
const driver = await prisma.driver.findUnique({
  where: {
    id: driverId,
  },
});

if (!driver) {
  return NextResponse.json(
    {
      error: "Driver not found",
    },
    {
      status: 404,
    }
  );
}

const deletedriver= await prisma.driver.delete({
    where :{
        id:driverId,
    },


});

return NextResponse.json(
  { message: "Driver  deleted successfully", service: deletedriver
    
  }
);

}

