import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import { bookingSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function POST(request:Request){
    
  const body = await request.json();

  const result = bookingSchema.safeParse(body);

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
const admin = await findUserById(Number(payload.userId));

if (!admin) {
  return NextResponse.json(
    { error: "User not found" },
    { status: 404 }
  );
}

requireAdmin(admin);

const bookingUser = await prisma.user.findUnique({
  where: {
    id: result.data.userId,
  },
});

if (!bookingUser) {
  return NextResponse.json(
    {
      error: "Booking user not found",
    },
    {
      status: 404,
    }
  );
}


const airline = await prisma.airline.findUnique({
  where: {
    id: result.data.airlineId,
  },
});

if (!airline) {
  return NextResponse.json(
    {
      error: "Airline not found",
    },
    {
      status: 404,
    }
  );
}
const airport = await prisma.airport.findUnique({
  where: {
    id: result.data.airportId,
  },
});

if (!airport) {
  return NextResponse.json(
    {
      error: "Airport not found",
    },
    {
      status: 404,
    }
  );
}
const terminal = await prisma.terminal.findUnique({
  where: {
    id: result.data.terminalId,
  },
});

if (!terminal) {
  return NextResponse.json(
    {
      error: "Terminal not found",
    },
    {
      status: 404,
    }
  );
}
if (result.data.vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: result.data.vehicleId,
    },
  });

  if (!vehicle) {
    return NextResponse.json(
      {
        error: "Vehicle not found",
      },
      {
        status: 404,
      }
    );
  }
}
if (result.data.couponId) {
  const coupon = await prisma.coupon.findUnique({
    where: {
      id: result.data.couponId,
    },
  });

  if (!coupon) {
    return NextResponse.json(
      {
        error: "Coupon not found",
      },
      {
        status: 404,
      }
    );
  }
}
if (result.data.departureAirportId) {
  const departureAirport  = await prisma.airport.findUnique({
    where: {
      id: result.data.departureAirportId,
    },
  });

  if (!departureAirport) {
    return NextResponse.json(
      {
        error: "departure airport not found",
      },
      {
        status: 404,
      }
    );
  }
}

const bookingReference = `BK-${Date.now()}`;

const booking = await prisma.booking.create({
  data: {
    userId: result.data.userId,
    airlineId: result.data.airlineId,
    airportId: result.data.airportId,
    terminalId: result.data.terminalId,
    departureAirportId: result.data.departureAirportId,
    vehicleId: result.data.vehicleId,
    couponId: result.data.couponId,
    bookingReference,
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
    bookingStatus:
      result.data.bookingStatus === "INPROGRESS"
        ? "IN_PROGRESS"
        : result.data.bookingStatus,
    totalAmount: result.data.totalAmount,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Booking created successfully",
    data: booking,
  },
  {
    status: 201,
  }
);
}
export async function GET(request:Request) {
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

  const bookings = await prisma.booking.findMany({
  include: {
    user: true,
    airline: true,
    airport: true,
    departureAirport: true,
    terminal: true,
    vehicle: true,
    coupon: true,
  },
  orderBy: {
    id: "asc",
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings,
  },
  {
    status: 200,
  }
);  
    
}
catch (error) {
    console.error(error);

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





