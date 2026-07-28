import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  paymentSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = paymentSchema.safeParse(body);

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
const currency = await prisma.currency.findUnique({
  where: {
    id: result.data.currencyId,
  },
});

if (!currency) {
  return NextResponse.json(
    {
      error: "Currency not found",
    },
    {
      status: 404,
    }
  );
}

const existingPayment = await prisma.payment.findUnique({
  where: {
    bookingId: result.data.bookingId,
  },
});

if (existingPayment) {
  return NextResponse.json(
    {
      error: "Payment already exists for this booking",
    },
    {
      status: 409,
    }
  );
}

const paymentMethod = (() => {
  if (result.data.paymentMethod === "Stripe" || result.data.paymentMethod === "Paypal") {
    return "CARD";
  }

  if (result.data.paymentMethod === "Bank Transfer") {
    return "BANK_TRANSFER";
  }

  return result.data.paymentMethod as "CASH" | "CARD" | "BANK_TRANSFER";
})();

const payment = await prisma.payment.create({
  data: {
    bookingId: result.data.bookingId,
    currencyId: result.data.currencyId,
    amount: result.data.amount,
    paymentMethod,
    paymentStatus: result.data.paymentStatus ?? "PENDING",
    transactionReference: result.data.transactionReference,
    paidAt: result.data.paidAt,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Payment created successfully",
    data: payment,
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
    const payment = await prisma.payment.findMany({
  orderBy: {
    id: "asc",
  },
});

return NextResponse.json(
  {
    success: true,
    message: "payments retrieved successfully",
    data: payment,
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