import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  invoiceSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = invoiceSchema.safeParse(body);

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
const existingInvoice = await prisma.invoice.findUnique({
  where: {
    bookingId: result.data.bookingId,
  },
});

if (existingInvoice) {
  return NextResponse.json(
    {
      error: "Invoice already exists for this booking",
    },
    {
      status: 409,
    }
  );
}
const invoice = await prisma.invoice.create({
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
    message: "Invoice created successfully",
    data: invoice,
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

export async function GET(request: Request) {
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

    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        booking: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invoices retrieved successfully",
        data: invoices,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("Error fetching invoices:", error);

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