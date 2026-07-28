import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/permissions";
import { findUserById } from "@/app/lib/auth";
import { verifyToken } from "@/app/lib/jwt";
import prisma from "@/app/lib/prisma";
import { terminalsSchema } from "@/app/lib/validators";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const terminalId = Number(id);
    if (isNaN(terminalId)) {
  return NextResponse.json(
    {
      error: "Invalid terminal ID",
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
const terminal = await prisma.terminal.findUnique({
  where: {
    id: terminalId,
  },
});
if (!terminal) {
  return NextResponse.json(
    {
      error: "Terminals category not found",
    },
    {
      status: 404,
    }
  );
}
return NextResponse.json(
  {
    success: true,
    message: "terminals Data retrieved successfully",
    data: terminal,
  },
  {
    status: 200,
  }
);
}

export async function PUT(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const terminalId = Number(id);
    if (isNaN(terminalId)) {
  return NextResponse.json(
    { error: "Invalid terminal ID" },
    { status: 400 }
  );
 }
 const body = await request.json();
    console.log(body);
    console.log(typeof body);
     const result = terminalsSchema.safeParse(body);
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
if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}
requireAdmin(user);
const existingterminal = await prisma.terminal.findUnique({
  where: {
    id: terminalId,
  },
});
if (!existingterminal) {
  return NextResponse.json(
    { error: " Terminal is not found" },
    { status: 404 }
  );
}

const updatedTerminal = await prisma.terminal.update({
  where: {
    id: terminalId,
  },
  data: {
    airportId: result.data.airportId,
    name: result.data.name,
    description: result.data.description,
  },
});


 
return NextResponse.json(
  {
    success: true,
    message: "terminal updated successfully",
    data: updatedTerminal,
  },
  {
    status: 200,
  }
);
}
export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const terminalId = Number(id);
    if (isNaN(terminalId)) {
  return NextResponse.json(
    { error: "Invalid terminal ID" },
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
const terminal = await prisma.terminal.findUnique({
  where: {
    id: terminalId,
  },
});
if (!terminal) {
  return NextResponse.json(
    { error: "Terminal category not found" },
    { status: 404 }
  );
}
const deleteterminal= await prisma.terminal.delete({
    where :{
        id:terminalId,
    },


});

return NextResponse.json(
  { message: "Service deleted successfully", service: deleteterminal}
);

}

