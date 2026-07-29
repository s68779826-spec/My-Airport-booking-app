import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import {  smsLogSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";

 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = smsLogSchema.safeParse(body);

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
const smsLog = await prisma.smsLog.create({
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
    message: "Sms log created successfully",
    data: smsLog,
  },
  {
    status: 201,
  }
);
    }
catch (error) {
    console.error("Error creating Sms Log:", error);

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

 const smsLogs = await prisma.emailLog.findMany({
  orderBy: {
    id: "asc",
  },
  include: {
    user: true,
    booking: true,
  },
});

    return NextResponse.json(
      {
        success: true,
        message: "Sms Log retrieved successfully",
        data: smsLogs,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error("Error fetching Email Logs:", error);

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