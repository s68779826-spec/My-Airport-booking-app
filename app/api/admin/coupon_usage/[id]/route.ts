import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { couponUsageSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const couponusageId = Number(id);
    if (isNaN(couponusageId)) {
  return NextResponse.json(
    {
      error: "Invalid coupon usage ID",
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
const couponUsage = await prisma.couponUsage.findUnique({
  where: {
    id: couponusageId,
  },
  include: {
    coupon: true,
    booking: true,
    user: true,
  },
});

if (!couponUsage) {
  return NextResponse.json(
    {
      error: "Coupon usage not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "Coupon usage retrieved successfully",
    data: couponUsage,
  },
  {
    status: 200,
  }
);


}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const couponusageId = Number(id);
    if (isNaN(couponusageId)) {
  return NextResponse.json(
    { error: "Invalid coupon usage ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = couponUsageSchema.safeParse(body);
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
const couponUsage = await prisma.couponUsage.findUnique({
  where: {
    id: couponusageId,
  },
});

if (!couponUsage) {
  return NextResponse.json(
    { error: "Coupon usage not found" },
    { status: 404 }
  );
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

const existingUsage = await prisma.couponUsage.findFirst({
  where: {
    couponId: result.data.couponId,
    bookingId: result.data.bookingId,
    NOT: {
      id: couponusageId,
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

const updatedCouponUsage = await prisma.couponUsage.update({
  where: {
    id: couponusageId,
  },
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
    message: "Coupon usage updated successfully",
    data: updatedCouponUsage,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const couponusageId = Number(id);
    if (isNaN(couponusageId)) {
  return NextResponse.json(
    { error: "Invalid coupon Usage ID" },
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
const couponusage = await prisma.couponUsage.findUnique({
  where: {
    id: couponusageId,
  },
});
if (!couponusage) {
  return NextResponse.json(
    { error: "airport category not found" },
    { status: 404 }
  );
}
const deletecouponusage= await prisma.couponUsage.delete({
    where :{
        id:couponusageId,
    },


});

return NextResponse.json(
  {
    success: true,
    message: "Coupon usage deleted successfully",
    data: deletecouponusage,
  },
  {
    status: 200,
  }
);

}
