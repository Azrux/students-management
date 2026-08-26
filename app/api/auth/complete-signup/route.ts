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

    // Note: for role === "STUDENT" we intentionally do NOT create a Student
    // row here. A Student row only exists once a teacher invites this person
    // (see /api/teacher/students/invite) — that's what links them to a
    // specific tenant. Self-signing-up as a student just activates the
    // profile; their dashboard stays empty until a teacher invites them.
    const user = await db.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        passwordHash: null,
        isTeacher: role === "TEACHER",
        isStudent: role === "STUDENT",
        tenantId: tenantId ?? null,
      },
    });

    // Store profile flags + tenantId in Clerk publicMetadata for fast
    // middleware/client access without a DB round-trip.
    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        isTeacher: user.isTeacher,
        isStudent: user.isStudent,
        isAdmin: user.isAdmin,
        tenantId: tenantId ?? null,
      },
    });

    return NextResponse.json({ message: "Setup complete" }, { status: 201 });
  } catch (error) {
    console.error("complete-signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
