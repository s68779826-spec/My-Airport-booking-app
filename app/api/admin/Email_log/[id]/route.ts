import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { emailLogSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const emaillogId = Number(id);
    if (isNaN(emaillogId)) {
  return NextResponse.json(
    {
      error: "Invalid Email Log ID",
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
const emailLog = await prisma.emailLog.findUnique({
  where: {
    id: emaillogId,
  },
  include: {
    user: true,
    booking: true,
  },
});

if (!emailLog) {
  return NextResponse.json(
    {
      error: "Email log not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "Email log retrieved successfully",
    data: emailLog,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const emaillogId = Number(id);
    if (isNaN(emaillogId)) {
  return NextResponse.json(
    { error: "Invalid Email log ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = emailLogSchema.safeParse(body);
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
const emailLog = await prisma.emailLog.findUnique({
  where: {
    id: emaillogId,
  },
});

if (!emailLog) {
  return NextResponse.json(
    {
      error: "Email log not found",
    },
    {
      status: 404,
    }
  );
}

if (result.data.userId) {
  const emailUser = await prisma.user.findUnique({
    where: {
      id: result.data.userId,
    },
  });

  if (!emailUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }
}

if (result.data.bookingId) {
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
}

const updatedEmailLog = await prisma.emailLog.update({
  where: {
    id: emaillogId,
  },
  data: {
    userId: result.data.userId,
    bookingId: result.data.bookingId,
    email: result.data.email,
    subject: result.data.subject,
    status: result.data.status,
    sentAt: result.data.sentAt,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Email log updated successfully",
    data: updatedEmailLog,
  },
  {
    status: 200,
  }
);

}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const emaillogId = Number(id);
    if (isNaN(emaillogId)) {
  return NextResponse.json(
    { error: "Invalid Email Log ID" },
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
const emailLog = await prisma.emailLog.findUnique({
  where: {
    id: emaillogId,
  },
});

if (!emailLog) {
  return NextResponse.json(
    {
      error: "Email log not found",
    },
    {
      status: 404,
    }
  );
}

const deletedEmailLog = await prisma.emailLog.delete({
  where: {
    id: emaillogId,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Email log deleted successfully",
    data: deletedEmailLog,
  },
  {
    status: 200,
  }
);

}

