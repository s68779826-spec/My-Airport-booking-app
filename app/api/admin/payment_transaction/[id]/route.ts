import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { paymentTransactionSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";
import { PaymentStatus } from "@prisma/client";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const paymenttransactionId = Number(id);
    if (isNaN(paymenttransactionId)) {
  return NextResponse.json(
    {
      error: "Invalid payment Transaction ID",
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
const paymentTransaction = await prisma.paymentTransaction.findUnique({
  where: {
    id: paymenttransactionId,
  },
   include: {
    payment: true,
  },
});
if (!paymentTransaction) {
  return NextResponse.json(
    {
      error: "payment Transaction not found",
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
    data: paymentTransaction,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paymenttransactionId = Number(id);
    if (isNaN(paymenttransactionId)) {
  return NextResponse.json(
    { error: "Invalid payment Transaction ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = paymentTransactionSchema.safeParse(body);
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
const paymentTransaction = await prisma.paymentTransaction.findUnique({
  where: {
    id: paymenttransactionId,
  },
});

if (!paymentTransaction) {
  return NextResponse.json(
    {
      error: "Payment Transaction not found",
    },
    {
      status: 404,
    }
  );
}
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

const updatedPaymenttransacton = await prisma.paymentTransaction.update({
  where: {
    id: paymenttransactionId,
  },
  

  data: {
   paymentId: result.data.paymentId,
    gateway: result.data.gateway,
    gatewayTransactionId: result.data.gatewayTransactionId,
    amount: result.data.amount,
    status: result.data.status as PaymentStatus,
    gatewayResponse: result.data.gatewayResponse,
    
  },
});

return NextResponse.json(
  {
    success: true,
    message: "payments  transaction updated successfully",
    data: updatedPaymenttransacton,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paymenttransactionId = Number(id);
    if (isNaN(paymenttransactionId)) {
  return NextResponse.json(
    { error: "Invalid payment transaction ID" },
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
const paymenttransaction = await prisma.paymentTransaction.findUnique({
  where: {
    id: paymenttransactionId,
  },
});
if (!paymenttransactionId) {
  return NextResponse.json(
    { error: " payment transaction not found" },
    { status: 404 }
  );
}
const deletepaymenttransaction= await prisma.payment.delete({
    where :{
        id:paymenttransactionId,
    },


});
return NextResponse.json(
  {
    success: true,
    message: "Payment deleted successfully",
    data: deletepaymenttransaction,
  },
  {
    status: 200,
  }
);

}
