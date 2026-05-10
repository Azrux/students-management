import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, tenantName } = await request.json();

    if (!role || (role !== "TEACHER" && role !== "STUDENT")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (role === "TEACHER" && !tenantName?.trim()) {
      return NextResponse.json({ error: "Tenant name is required for teachers" }, { status: 400 });
    }

    // Guard: don't create duplicate DB records
    const existing = await db.user.findUnique({ where: { clerkId: userId } });
    if (existing) {
      return NextResponse.json({ message: "Already set up" }, { status: 200 });
    }

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || email;

    let tenantId: string | undefined;

    if (role === "TEACHER") {
      const tenant = await db.tenant.create({
        data: {
          name: tenantName.trim(),
          email,
          slug: tenantName.trim().toLowerCase().replace(/\s+/g, "-"),
          timezone: "America/Argentina/Buenos_Aires",
        },
      });
      tenantId = tenant.id;
    }

    const user = await db.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        passwordHash: null,
        role,
        tenantId: tenantId ?? null,
      },
    });

    if (role === "STUDENT") {
      await db.student.create({
        data: {
          userId: user.id,
          name,
          email,
          tenantId: "",
        },
      });
    }

    // Store role + tenantId in Clerk publicMetadata for fast middleware access
    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: { role, tenantId: tenantId ?? null },
    });

    return NextResponse.json({ message: "Setup complete" }, { status: 201 });
  } catch (error) {
    console.error("complete-signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
