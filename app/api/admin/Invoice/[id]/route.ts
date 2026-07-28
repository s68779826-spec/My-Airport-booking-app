import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { invoiceSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const invoiceId = Number(id);
    if (isNaN(invoiceId)) {
  return NextResponse.json(
    {
      error: "Invalid invoice ID",
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
const invoice = await prisma.invoice.findUnique({
  where: {
    id: invoiceId,
  },
});
if (!invoice) {
  return NextResponse.json(
    {
      error: "invoice not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "invoices  retrieved successfully",
    data: invoice,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoiceId = Number(id);
    if (isNaN(invoiceId)) {
  return NextResponse.json(
    { error: "Invalid invoice ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = invoiceSchema.safeParse(body);
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
const existingInvoice = await prisma.invoice.findFirst({
  where: {
    bookingId: result.data.bookingId,
    NOT: {
      id: invoiceId,
    },
  },
});

if (existingInvoice) {
  return NextResponse.json(
    {
      error: "An invoice already exists for this booking",
    },
    {
      status: 409,
    }
  );
}
const updatedinvoice = await prisma.invoice.update({
  where: {
    id: invoiceId,
  },
  data: {
    bookingId: result.data.bookingId,
    invoiceNumber: result.data.invoiceNumber,
    subtotal: result.data.subtotal,
    tax: result.data.tax,
    discount: result.data.discount,
    total: result.data.total,
    pdfUrl: result.data.pdfUrl,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Invoice updated successfully",
    data: updatedinvoice,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoiceId = Number(id);
    if (isNaN(invoiceId)) {
  return NextResponse.json(
    { error: "Invalid invoice ID" },
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
const invoice = await prisma.invoice.findUnique({
  where: {
    id: invoiceId,
  },
});
if (!invoice) {
  return NextResponse.json(
    { error: "Invoice  not found" },
    { status: 404 }
  );
}
const deleteinvoice= await prisma.invoice.delete({
    where :{
        id:invoiceId,
    },


});

return NextResponse.json(
  { message: "Coupon deleted successfully", service: deleteinvoice}
);

}
