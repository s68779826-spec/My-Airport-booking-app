import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { bookingDocumentSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const bookingDocumentId = Number(id);
    if (isNaN(bookingDocumentId)) {
  return NextResponse.json(
    {
      error: "Invalid booking document ID",
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
const bookingDocument = await prisma.bookingDocument.findUnique({
  where: {
    id: bookingDocumentId,
  },
  include: {
    booking: true,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Booking service  retrieved successfully",
    data: bookingDocument,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingDocumentId = Number(id);
    if (isNaN(bookingDocumentId)) {
  return NextResponse.json(
    { error: "Invalid booking Document ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = bookingDocumentSchema.safeParse(body);
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
const bookingDocument = await prisma.bookingDocument.findUnique({
  where: {
    id: bookingDocumentId,
  },
});

if (!bookingDocument) {
  return NextResponse.json(
    {
      error: "Booking document not found",
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
const updatedBookingDocument =
  await prisma.bookingDocument.update({
    where: {
      id: bookingDocumentId,
    },
    data: {
      bookingId: result.data.bookingId,
      documentType: result.data.documentType,
      fileName: result.data.fileName,
      fileUrl: result.data.fileUrl,
      uploadedAt: result.data.uploadedAt,
    },
  });

return NextResponse.json(
  {
    success: true,
    message: "booking service updated successfully",
    data: updatedBookingDocument,
  },
  {
    status: 200,
  }
);
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bookingDocumentId = Number(id);
    if (isNaN(bookingDocumentId)) {
  return NextResponse.json(
    { error: "Invalid booking Document ID" },
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
const bookingDocument = await prisma.bookingDocument.findUnique({
  where: {
    id: bookingDocumentId,
  },
});

if (!bookingDocument) {
  return NextResponse.json(
    {
      error: "Booking document not found",
    },
    {
      status: 404,
    }
  );
}

const deletedBookingDocument =
  await prisma.bookingDocument.delete({
    where: {
      id: bookingDocumentId,
    },
  });

return NextResponse.json(
  {
    success: true,
    message: "Booking document deleted successfully",
    data: deletedBookingDocument,
  },
  {
    status: 200,
  }
);
}

