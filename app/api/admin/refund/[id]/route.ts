import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { refundSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const refundId = Number(id);
    if (isNaN(refundId)) {
  return NextResponse.json(
    {
      error: "Invalid Refund ID",
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
const refund = await prisma.refund.findUnique({
  where: {
    id: refundId,
  },
  include: {
    payment: true,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "refund  retrieved successfully",
    data: refund,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const refundId = Number(id);
    if (isNaN(refundId)) {
  return NextResponse.json(
    { error: "Invalid refund ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = refundSchema.safeParse(body);
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


const updatedRefund = await prisma.refund.update({
  where: {
    id: refundId,
  },
  data: {
    paymentId: result.data.paymentId,
    refundAmount: result.data.refundAmount,
    refundReason: result.data.refundReason,
    refundStatus: result.data.refundStatus as PaymentStatus,
    refundedAt: result.data.refundedAt,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Refunds updated successfully",
    data: updatedRefund,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const refundId = Number(id);
    if (isNaN(refundId)) {
  return NextResponse.json(
    { error: "Invalid refund ID" },
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
const refund = await prisma.refund.findUnique({
  where: {
    id: refundId,
  },
});

if (!refund) {
  return NextResponse.json(
    { error: "Refund not found" },
    { status: 404 }
  );
}

const deletedRefund = await prisma.refund.delete({
  where: {
    id: refundId,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Refund deleted successfully",
    data: deletedRefund,
  },
  {
    status: 200,
  }
);

}
