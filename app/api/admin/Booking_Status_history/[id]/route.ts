import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { bookingStatusHistorySchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const bookingStatusHistoryId = Number(id);
    if (isNaN(bookingStatusHistoryId)) {
  return NextResponse.json(
    {
      error: "Invalid booking Status History ID",
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
const bookingstatushistory = await prisma.bookingStatusHistory.findUnique({
  where: {
    id: bookingStatusHistoryId,
  },
   include: {
    booking: true,
    
  },
});
if (!bookingstatushistory) {
  return NextResponse.json(
    {
      error: "booking status history not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "Booking status history retrieved successfully",
    data: bookingstatushistory,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const BookingStatusHistoryId = Number(id);
    if (isNaN(BookingStatusHistoryId)) {
  return NextResponse.json(
    { error: "Invalid booking status History ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = bookingStatusHistorySchema.safeParse(body);
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
    {
      error: "Booking not found",
    },
    {
      status: 404,
    }
  );
}
const history = await prisma.bookingStatusHistory.findUnique({
  where: {
    id: BookingStatusHistoryId,
  },
});

if (!history) {
  return NextResponse.json(
    { error: "Booking status history not found" },
    { status: 404 }
  );
}

const updatedbookingstatushistory = await prisma.bookingStatusHistory.update({
  where: {
    id: BookingStatusHistoryId,
  },
  

  data: {
   
  bookingId: result.data.bookingId,
  oldStatus: result.data.oldStatus,
  newStatus: result.data.newStatus,
  changedBy: result.data.changedBy,
  remarks: result.data.remarks,

  
  },
});

return NextResponse.json(
  {
    success: true,
    message: "booking service updated successfully",
    data: updatedbookingstatushistory,
  },
  {
    status: 200,
  }
);
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingstatushistoryId = Number(id);
    if (isNaN(bookingstatushistoryId)) {
  return NextResponse.json(
    { error: "Invalid booking status history ID" },
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
const bookingstatushistory = await prisma.bookingStatusHistory.findUnique({
  where: {
    id: bookingstatushistoryId,
  },
});
if (!bookingstatushistory) {
  return NextResponse.json(
    { error: " booking service not found" },
    { status: 404 }
  );
}
const deletebookingstatushistory= await prisma.bookingStatusHistory.delete({
    where :{
        id:bookingstatushistoryId,
    },


});
return NextResponse.json(
  {
    success: true,
    message: "booking status history deleted successfully",
    data: deletebookingstatushistory,
  },
  {
    status: 200,
  }
);

}

