import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById } from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";
import { airportSchema } from "@/app/lib/validators";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const airportId = Number(id);
    if (isNaN(airportId)) {
  return NextResponse.json(
    {
      error: "Invalid airport ID",
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
const airport = await prisma.airport.findUnique({
  where: {
    id: airportId,
  },
});
if (!airport) {
  return NextResponse.json(
    {
      error: "airport category not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "airport Data retrieved successfully",
    data: airport,
  },
  {
    status: 200,
  }
);
}


export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const airportId = Number(id);
    if (isNaN(airportId)) {
  return NextResponse.json(
    { error: "Invalid airport ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = airportSchema.safeParse(body);
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
const airport = await prisma.airport.findUnique({
  where: {
    id: airportId,
  },
});
if (!airport) {
  return NextResponse.json(
    { error: " Airport is not found" },
    { status: 404 }
  );
}

const updatedAirport = await prisma.airport.update({
  where: {
    id: airportId,
  },
  data: {
    countryId: result.data.countryId,
    cityId: result.data.cityId,
    name: result.data.name,
    iataCode: result.data.iataCode,
    address: result.data.address,
  },
});


 
return NextResponse.json(
  {
    success: true,
    message: "Airport updated successfully",
    data: updatedAirport,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const airportId = Number(id);
    if (isNaN(airportId)) {
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
const airport = await prisma.airport.findUnique({
  where: {
    id: airportId,
  },
});
if (!airport) {
  return NextResponse.json(
    { error: "airport category not found" },
    { status: 404 }
  );
}
const deleteairport= await prisma.airport.delete({
    where :{
        id:airportId,
    },


});

return NextResponse.json(
  { message: "Service deleted successfully", service: deleteairport}
);

}











