import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { paymentSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const paymentId = Number(id);
    if (isNaN(paymentId)) {
  return NextResponse.json(
    {
      error: "Invalid payment ID",
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
    id: paymentId,
  },
   include: {
    booking: true,
  },
});
if (!payment) {
  return NextResponse.json(
    {
      error: "payment not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "payment  retrieved successfully",
    data: payment,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paymentId = Number(id);
    if (isNaN(paymentId)) {
  return NextResponse.json(
    { error: "Invalid payment ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = paymentSchema.safeParse(body);
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
const payment = await prisma.payment.findUnique({
  where: {
    id: paymentId,
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
const paymentMethod = (() => {
  if (result.data.paymentMethod === "Stripe" || result.data.paymentMethod === "Paypal") {
    return "CARD";
  }

  if (result.data.paymentMethod === "Bank Transfer") {
    return "BANK_TRANSFER";
  }

  return result.data.paymentMethod as "CASH" | "CARD" | "BANK_TRANSFER";
})();

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
const updatedPayment = await prisma.payment.update({
  where: {
    id: paymentId,
  },
  

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
    message: "payments updated successfully",
    data: updatedPayment,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paymentId = Number(id);
    if (isNaN(paymentId)) {
  return NextResponse.json(
    { error: "Invalid payment ID" },
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
const payment = await prisma.payment.findUnique({
  where: {
    id: paymentId,
  },
});
if (!paymentId) {
  return NextResponse.json(
    { error: " payment not found" },
    { status: 404 }
  );
}
const deletepayment= await prisma.payment.delete({
    where :{
        id:paymentId,
    },


});
return NextResponse.json(
  {
    success: true,
    message: "Payment deleted successfully",
    data: deletepayment,
  },
  {
    status: 200,
  }
);

}
