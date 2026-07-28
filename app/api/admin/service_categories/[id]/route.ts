import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { verifyToken } from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { serviceCategorySchema} from "@/app/lib/validators";
import prisma from "@/app/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const categoryId = Number(id);
    if (isNaN(categoryId)) {
  return NextResponse.json(
    {
      error: "Invalid category ID",
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
const category = await prisma.serviceCategory.findUnique({
  where: {
    id: categoryId,
  },
});
if (!category) {
  return NextResponse.json(
    {
      error: "Service category not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "Service category retrieved successfully",
    data: category,
  },
  {
    status: 200,
  }
);
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const CategoryId = Number(id);
    if (isNaN(CategoryId)) {
  return NextResponse.json(
    { error: "Invalid service ID" },
    { status: 400 }
  );
}
const body = await request.json();
   console.log(body);
   console.log(typeof body);
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
const category = await prisma.serviceCategory.findUnique({
  where: {
    id: CategoryId,
  },
});
if (!category) {
  return NextResponse.json(
    { error: "service category not found" },
    { status: 404 }
  );
}

const updatedcategory= await prisma.serviceCategory.update({
    where :{
        id:CategoryId,
    },
data:{
    name:result.data.name,
    description:result.data.description,
}

});
 
return NextResponse.json(
  {
    success: true,
    message: "Service category updated successfully",
    data: updatedcategory,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const CategoryId = Number(id);
    if (isNaN(CategoryId)) {
  return NextResponse.json(
    { error: "Invalid service ID" },
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
const category = await prisma.serviceCategory.findUnique({
  where: {
    id: CategoryId,
  },
});
if (!category) {
  return NextResponse.json(
    { error: "service category not found" },
    { status: 404 }
  );
}
const deleteservicecategory= await prisma.serviceCategory.delete({
    where :{
        id:CategoryId,
    },


});

return NextResponse.json(
  { message: "Service deleted successfully", service: deleteservicecategory}
);
 
}





