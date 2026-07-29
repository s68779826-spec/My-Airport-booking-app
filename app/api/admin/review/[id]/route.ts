import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import { reviewSchema } from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";



export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const reviewId = Number(id);
    if (isNaN(reviewId)) {
  return NextResponse.json(
    {
      error: "Invalid review ID",
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
const review = await prisma.review.findUnique({
  where: {
    id: reviewId,
  },
  include: {
    booking: true,
  },
});

if (!review) {
  return NextResponse.json(
    {
      error: "Booking document not found",
    },
    {
      status: 404,
    }
  );
}

return NextResponse.json(
  {
    success: true,
    message: "reviews  retrieved successfully",
    data: review,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const reviewId = Number(id);
    if (isNaN(reviewId)) {
  return NextResponse.json(
    { error: "Invalid review ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = reviewSchema.safeParse(body);
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
const review = await prisma.review.findUnique({
  where: {
    id: reviewId,
  },
});

if (!review) {
  return NextResponse.json(
    {
      error: "Review not found",
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


const updatedReview = await prisma.review.update({
  where: {
    id: reviewId,
  },
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
    message: "Reviews updated successfully",
    data: updatedReview,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const reviewId = Number(id);
    if (isNaN(reviewId)) {
  return NextResponse.json(
    { error: "Invalid review ID" },
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
const review = await prisma.review.findUnique({
  where: {
    id: reviewId,
  },
});

if (!review) {
  return NextResponse.json(
    {
      error: "Review not found",
    },
    {
      status: 404,
    }
  );
}

const deletedReview = await prisma.review.delete({
  where: {
    id: reviewId,
  },
});
return NextResponse.json(
  {
    success: true,
    message: "Reviews deleted successfully",
    data: deletedReview,
  },
  {
    status: 200,
  }
);

}
