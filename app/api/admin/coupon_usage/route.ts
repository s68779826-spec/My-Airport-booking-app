import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  couponUsageSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = couponUsageSchema.safeParse(body);

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

const user = await findUserById(Number(payload.userId));
if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}     
const coupon = await prisma.coupon.findUnique({
  where: {
    id: result.data.couponId,
  },
});

if (!coupon) {
  return NextResponse.json(
    { error: "Coupon not found" },
    { status: 404 }
  );
}

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

const couponUser = await prisma.user.findUnique({
  where: {
    id: result.data.userId,
  },
});

if (!couponUser) {
  return NextResponse.json(
    { error: "User not found" },
    { status: 404 }
  );
}
const existingUsage = await prisma.couponUsage.findUnique({
  where: {
    couponId_bookingId: {
      couponId: result.data.couponId,
      bookingId: result.data.bookingId,
    },
  },
});

if (existingUsage) {
  return NextResponse.json(
    {
      error: "Coupon has already been used for this booking",
    },
    {
      status: 409,
    }
  );
} 
requireAdmin(user);
const couponUsage = await prisma.couponUsage.create({
  data: {
    couponId: result.data.couponId,
    bookingId: result.data.bookingId,
    userId: result.data.userId,
    discountAmount: result.data.discountAmount,
  },
});
    
 return NextResponse.json(
  {
    success: true,
    message: "coupon created successfully",
    data: couponUsage,
  },
  {
    status: 201,
  }
);
}
catch (error) {
    console.error("Error creating airport:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (error.message === "Forbidden") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
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

    requireAdmin(user); 
    const couponusage = await prisma.couponUsage.findMany({
  orderBy: {
    id: "asc",
  },
  include: {
    coupon: true,
    booking: true,
    user: true,
  }
});

return NextResponse.json(
  {
    success: true,
    message: "coupons Usage retrieved successfully",
    data: couponusage,
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