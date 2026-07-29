import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  paymentSchema, refundSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";

 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = refundSchema.safeParse(body);

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
requireAdmin(user);
const payment = await prisma.payment.findUnique({
  where: {
    id: result.data.paymentId,
  },
});

if (!payment) {
  return NextResponse.json(
    {
      error: "Payment not found",
    },
    {
      status: 404,
    }
  );
}

const refund = await prisma.refund.create({
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
    message: "Refund created successfully",
    data: refund,
  },
  {
    status: 201,
  }
);
}
catch (error) {
    console.error("Error creating payment:", error);

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
    const refund = await prisma.refund.findMany({
  orderBy: {
    id: "asc",
  },
  include: {
    payment: {
      include: {
        booking: true,
      },
    },
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Refunds retrieved successfully",
    data: refund,
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