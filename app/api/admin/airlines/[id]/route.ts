import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { AirlinesSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const airlineId = Number(id);
    if (isNaN(airlineId)) {
  return NextResponse.json(
    {
      error: "Invalid airline ID",
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
const airline = await prisma.airline.findUnique({
  where: {
    id: airlineId,
  },
});
if (!airline) {
  return NextResponse.json(
    {
      error: "airline category not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "airline Data retrieved successfully",
    data: airline,
  },
  {
    status: 200,
  }
);
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const airlineId = Number(id);
    if (isNaN(airlineId)) {
  return NextResponse.json(
    { error: "Invalid airline ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = AirlinesSchema.safeParse(body);
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
const airline = await prisma.airline.findUnique({
  where: {
    id: airlineId,
  },
});
if (!airline) {
  return NextResponse.json(
    { error: " Airline is not found" },
    { status: 404 }
  );
}

const updatedAirline = await prisma.airline.update({
  where: {
    id: airlineId,
  },
   data: {
    name: result.data.name,
    iataCode: result.data.iataCode,
    icaoCode: result.data.icaoCode,
    logo: result.data.logo,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Airport updated successfully",
    data: updatedAirline,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const airlineId = Number(id);
    if (isNaN(airlineId)) {
  return NextResponse.json(
    { error: "Invalid airport ID" },
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
const airline = await prisma.airline.findUnique({
  where: {
    id: airlineId,
  },
});
if (!airline) {
  return NextResponse.json(
    { error: "airline category not found" },
    { status: 404 }
  );
}
const deleteairline= await prisma.airline.delete({
    where :{
        id:airlineId,
    },


});

return NextResponse.json(
  { message: "Airline deleted successfully", service: deleteairline}
);

}