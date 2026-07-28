import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { passengerSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const passengerId = Number(id);
    if (isNaN(passengerId)) {
  return NextResponse.json(
    {
      error: "Invalid passenger ID",
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
const passenger = await prisma.passenger.findUnique({
  where: {
    id: passengerId,
  },
   include: {
    booking: true,
  },
});
if (!passenger) {
  return NextResponse.json(
    {
      error: "passenger not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "passenger Data retrieved successfully",
    data: passenger,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const passengerId = Number(id);
    if (isNaN(passengerId)) {
  return NextResponse.json(
    { error: "Invalid passenger ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = passengerSchema.safeParse(body);
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
const passenger = await prisma.passenger.findUnique({
  where: {
    id: passengerId,
  },
});

if (!passenger) {
  return NextResponse.json(
    {
      error: "Passenger not found",
    },
    {
      status: 404,
    }
  );
}

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

const updatedPassenger = await prisma.passenger.update({
  where: {
    id: passengerId,
  },
  

  data: {
    bookingId: result.data.bookingId,
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    age: result.data.age,
    gender: result.data.gender,
    phone: result.data.phone,
    email: result.data.email,
    travelClass: result.data.travelClass,
    dateOfBirth: result.data.dateOfBirth,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "passengers updated successfully",
    data: updatedPassenger,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const passengerId = Number(id);
    if (isNaN(passengerId)) {
  return NextResponse.json(
    { error: "Invalid passenger ID" },
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
const passenger = await prisma.passenger.findUnique({
  where: {
    id: passengerId,
  },
});
if (!passengerId) {
  return NextResponse.json(
    { error: " passenger not found" },
    { status: 404 }
  );
}
const deletepassenger= await prisma.passenger.delete({
    where :{
        id:passengerId,
    },


});
return NextResponse.json(
  {
    success: true,
    message: "Passenger deleted successfully",
    data: deletepassenger,
  },
  {
    status: 200,
  }
);

}
