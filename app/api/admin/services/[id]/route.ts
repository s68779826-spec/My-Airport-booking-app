import {NextResponse} from "next/server";
import {verifyToken} from "@/app/lib/jwt";
import { findUserById } from "@/app/lib/auth";
import { requireAdmin } from "@/app/lib/permissions";
import prisma from "@/app/lib/prisma";
import { serviceSchema } from "@/app/lib/validators";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(typeof id);
  const serviceId = Number(id);
  if (isNaN(serviceId)) {
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

const service = await prisma.service.findUnique({
  where: { id: serviceId },
});
if (!service) {
  return NextResponse.json(
    { error: "Service not found" },
    { status: 404 }
  );
}
}
export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const serviceId = Number(id);
    if (isNaN(serviceId)) {
  return NextResponse.json(
    { error: "Invalid service ID" },
    { status: 400 }
  );
}
    const body = await request.json();
   console.log(body);
   console.log(typeof body);
    const result = serviceSchema.safeParse(body);
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
const existingService = await prisma.service.findUnique({
  where: {
    id: serviceId,
  },
});
if (!existingService) {
  return NextResponse.json(
    { error: "Service not found" },
    { status: 404 }
  );
}
const updatedService = await prisma.service.update({
  where: {
    id: serviceId,
    },
    data: {
        title: result.data.title,
        description: result.data.description,
        price: result.data.price,
        duration: result.data.duration,
        isActive: result.data.isActive ?? false,
        terminalId: result.data.terminalId, 
        categoryId: result.data.categoryId,
        airportId: result.data.airportId,
    },
  });

return NextResponse.json(
  {
    message: "Service updated successfully",
    service: updatedService,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number(id);
    if (isNaN(serviceId)) {
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
const existingService = await prisma.service.findUnique({
  where: {
    id: serviceId,  
    },
});
if (!existingService) {
  return NextResponse.json(
    { error: "Service not found" }, 
    { status: 404 }
  );
}
const deletedService = await prisma.service.delete({
  where: {
    id: serviceId,
  },
  
});

return NextResponse.json(
  { message: "Service deleted successfully", service: deletedService }
);
 


}





