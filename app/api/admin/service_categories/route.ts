import {NextResponse} from "next/server";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import prisma from "@/app/lib/prisma";
import { serviceCategorySchema } from "@/app/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = serviceCategorySchema.safeParse(body);
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
const serviceCategory = await prisma.serviceCategory.create({
  data: {
    name: result.data.name,
    description: result.data.description,
  },
});

return NextResponse.json(
  {
    success: true,
    message: "Service category created successfully",             
    data: serviceCategory,
  }
);
  
  }
    catch (error) {
    console.error("Error during service category creation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },                                                                              
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

    const serviceCategories = await prisma.serviceCategory.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Service categories retrieved successfully",
        data: serviceCategories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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
  
   


       
 








