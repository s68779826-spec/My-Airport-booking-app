import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { couponSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const couponId = Number(id);
    if (isNaN(couponId)) {
  return NextResponse.json(
    {
      error: "Invalid coupon ID",
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
    id: couponId,
  },
});
if (!couponId) {
  return NextResponse.json(
    {
      error: "Coupon not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "coupon Data retrieved successfully",
    data: airport,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const couponId = Number(id);
    if (isNaN(couponId)) {
  return NextResponse.json(
    { error: "Invalid coupon ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = couponSchema.safeParse(body);
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
const coupon = await prisma.coupon.findUnique({
  where: {
    id: couponId,
  },
});
if (!coupon) {
  return NextResponse.json(
    { error: " Coupon is not found" },
    { status: 404 }
  );
}

const updatedCoupon = await prisma.coupon.update({
  where: {
    id: couponId,
  },
  data: {
    code: result.data.code,
    discount: result.data.discount,
    expiryDate: new Date(result.data.expiryDate),
    isActive: result.data.isActive ?? true,
   },
});


return NextResponse.json(
  {
    success: true,
    message: "Coupon updated successfully",
    data: updatedCoupon,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const couponId = Number(id);
    if (isNaN(couponId)) {
  return NextResponse.json(
    { error: "Invalid coupon ID" },
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
    id: couponId,
  },
});
if (!couponId) {
  return NextResponse.json(
    { error: "airport category not found" },
    { status: 404 }
  );
}
const deletecoupon= await prisma.coupon.delete({
    where :{
        id:couponId,
    },


});

return NextResponse.json(
  { message: "Coupon deleted successfully", service: deletecoupon}
);

}
