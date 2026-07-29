import {NextResponse} from "next/server";
import {verifyToken} from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import prisma from "@/app/lib/prisma";
import { smsLogSchema } from "@/app/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(typeof id);
  const smslogId = Number(id);
  if (isNaN(smslogId)) {
  return NextResponse.json(
    { error: "Invalid Sms Log ID" },
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
const smsLog = await prisma.smsLog.findUnique({
  where: {
    id: smslogId,
  },
  include: {
    user: true,
    booking: true,
  },
});

if (!smsLog) {
  return NextResponse.json(
    { error: "SMS log not found" },
    { status: 404 }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "SMS log retrieved successfully",
    data: smsLog,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const smslogId = Number(id);
    if (isNaN(smslogId)) {
  return NextResponse.json(
    { error: "Invalid Sms Log ID" },
    { status: 400 }
  );
}
    const body = await request.json();
   console.log(body);
   console.log(typeof body);
    const result = smsLogSchema.safeParse(body);
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
const smsLog = await prisma.smsLog.findUnique({
  where: {
    id: smslogId,
  },
});

if (!smsLog) {
  return NextResponse.json(
    { error: "SMS log not found" },
    { status: 404 }
  );
}

if (result.data.userId) {
  const smsUser = await prisma.user.findUnique({
    where: {
      id: result.data.userId,
    },
  });

  if (!smsUser) {
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

const updatedSmsLog = await prisma.smsLog.update({
  where: {
    id: smslogId,
  },
  data: {
    userId: result.data.userId,
    bookingId: result.data.bookingId,
    phone: result.data.phone,
    message: result.data.message,
    status: result.data.status,
    sentAt: result.data.sentAt,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "SMS log updated successfully",
    data: updatedSmsLog,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const smslogId = Number(id);
    if (isNaN(smslogId)) {
  return NextResponse.json(
    { error: "Invalid Sms Log ID" },
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
const smsLog = await prisma.smsLog.findUnique({
  where: {
    id: smslogId,
  },
});

if (!smsLog) {
  return NextResponse.json(
    { error: "SMS log not found" },
    { status: 404 }
  );
}

const deletedSmsLog = await prisma.smsLog.delete({
  where: {
    id: smslogId,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "SMS log deleted successfully",
    data: deletedSmsLog,
  },
  {
    status: 200,
  }
);

return NextResponse.json(
  { message: "Service deleted successfully", service: deletedSmsLog }
);
 


}





