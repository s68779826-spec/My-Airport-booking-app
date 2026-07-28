import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { bookingServiceSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const bookingservicesId = Number(id);
    if (isNaN(bookingservicesId)) {
  return NextResponse.json(
    {
      error: "Invalid booking service ID",
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
const bookingservice = await prisma.bookingService.findUnique({
  where: {
    id: bookingservicesId,
  },
   include: {
    booking: true,
    service:true
  },
});
if (!bookingservice) {
  return NextResponse.json(
    {
      error: "booking service not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "Booking service  retrieved successfully",
    data: bookingservice,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingserviceId = Number(id);
    if (isNaN(bookingserviceId)) {
  return NextResponse.json(
    { error: "Invalid booking service ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = bookingServiceSchema.safeParse(body);
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
const bookingservice = await prisma.bookingService.findUnique({
  where: {
    id: bookingserviceId,
  },
});

if (!bookingservice) {
  return NextResponse.json(
    {
      error: "booking service not found",
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
const service = await prisma.service.findUnique({
  where: {
    id: result.data.serviceId,
  },
});

if (!service) {
  return NextResponse.json(
    {
      error: "Service not found",
    },
    {
      status: 404,
    }
  );
}

const updatedbookingservice = await prisma.bookingService.update({
  where: {
    id: bookingserviceId,
  },
  

  data: {
     bookingId: result.data.bookingId,
    serviceId: result.data.serviceId,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "booking service updated successfully",
    data: updatedbookingservice,
  },
  {
    status: 200,
  }
);
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingserviceId = Number(id);
    if (isNaN(bookingserviceId)) {
  return NextResponse.json(
    { error: "Invalid booking service ID" },
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
const bookingservice = await prisma.bookingService.findUnique({
  where: {
    id: bookingserviceId,
  },
});
if (!bookingservice) {
  return NextResponse.json(
    { error: " booking service not found" },
    { status: 404 }
  );
}
const deletebookingservice= await prisma.bookingService.delete({
    where :{
        id:bookingserviceId,
    },


});
return NextResponse.json(
  {
    success: true,
    message: "booking service deleted successfully",
    data: deletebookingservice,
  },
  {
    status: 200,
  }
);

}

