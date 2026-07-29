import { NextResponse} from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById} from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import { reviewSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


 export async function POST(request:Request){
    try{
  const body = await request.json();

  const result = reviewSchema.safeParse(body);

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

const reviewUser = await prisma.user.findUnique({
  where: {
    id: result.data.userId,
  },
});

if (!reviewUser) {
  return NextResponse.json(
    {
      error: "User not found",
    },
    {
      status: 404,
    }
  );
}
const existingReview = await prisma.review.findFirst({
  where: {
    bookingId: result.data.bookingId,
    userId: result.data.userId,
  },
});

if (existingReview) {
  return NextResponse.json(
    {
      error: "Review already exists for this booking by this user",
    },
    {
      status: 409,
    }
  );
}
const review = await prisma.review.create({
  data: {
    bookingId: result.data.bookingId,
    userId: result.data.userId,
    rating: result.data.rating,
    comment: result.data.comment,
    reviewDate: result.data.reviewDate,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Review created successfully",
    data: review,
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
   const review = await prisma.review.findMany({
  orderBy: {
    id: "asc",
  },
  include: {
    booking: true,
    user: true,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Reviews retrieved successfully",
    data: review,
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