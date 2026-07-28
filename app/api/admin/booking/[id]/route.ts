import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById } from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";
import { bookingSchema } from "@/app/lib/validators";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const BookingId = Number(id);
    if (isNaN(BookingId)) {
  return NextResponse.json(
    {
      error: "Invalid booking ID",
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
    id: BookingId,
  },
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        profileImage: true,
        isVerified: true,
      },
    },
    airline: true,
    airport: true,
    departureAirport: true,
    terminal: true,
    vehicle: true,
    coupon: true,
  },
});
if (!booking) {
  return NextResponse.json(
    {
      error: "booking  not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "booking Data retrieved successfully",
    data: booking,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const BookingId = Number(id);
    if (isNaN(BookingId)) {
  return NextResponse.json(
    { error: "Invalid booking ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = bookingSchema.safeParse(body);
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
const Booking = await prisma.booking.findUnique({
  where: {
    id: BookingId,
  },
});
if (!Booking) {
  return NextResponse.json(
    { error: " booking is not found" },
    { status: 404 }
  );
}

const updatedBooking = await prisma.booking.update({
  where: {
    id: BookingId,
  },
  data: {
    userId: result.data.userId,
    airlineId: result.data.airlineId,
    airportId: result.data.airportId,
    terminalId: result.data.terminalId,
    departureAirportId: result.data.departureAirportId,
    vehicleId: result.data.vehicleId,
    couponId: result.data.couponId,
    arrivalTime: result.data.arrivalTime
      ? new Date(result.data.arrivalTime)
      : null,
    departureTime: result.data.departureTime
      ? new Date(result.data.departureTime)
      : null,
    flightNumber: result.data.flightNumber,
    specialRequest: result.data.specialRequest,
    bookingDate: new Date(result.data.bookingDate),
    travelDate: new Date(result.data.travelDate),
    bookingDirection: result.data.bookingDirection,
    
    totalAmount: result.data.totalAmount,
  },
});


 
return NextResponse.json(
  {
    success: true,
    message: "Bookings updated successfully",
    data: updatedBooking,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingId = Number(id);
    if (isNaN(bookingId)) {
  return NextResponse.json(
    { error: "Invalid boooking ID" },
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
const booking = await prisma.booking.findUnique({
  where: {
    id: bookingId,
  },
});
if (!booking) {
  return NextResponse.json(
    { error: "booking  not found" },
    { status: 404 }
  );
}
const deletebooking= await prisma.booking.delete({
    where :{
        id:bookingId,
    },


});

return NextResponse.json(
  { message: "Service deleted successfully", service: deletebooking}
);

}