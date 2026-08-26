import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Activates the teacher and/or student profile on an ALREADY existing
// account — unlike /api/auth/complete-signup (first-time onboarding), this
// is for a user who already has one profile and wants to add the other.
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

    const existing = await db.user.findUnique({ where: { clerkId: userId } });
    if (!existing) {
      return NextResponse.json({ error: "Complete onboarding first" }, { status: 404 });
    }

    if (role === "TEACHER" && existing.isTeacher) {
      return NextResponse.json({ message: "Already a teacher" }, { status: 200 });
    }
    if (role === "STUDENT" && existing.isStudent) {
      return NextResponse.json({ message: "Already a student" }, { status: 200 });
    }

    let tenantId = existing.tenantId;

    if (role === "TEACHER") {
      if (!tenantName?.trim()) {
        return NextResponse.json({ error: "Tenant name is required for teachers" }, { status: 400 });
      }

      const tenant = await db.tenant.create({
        data: {
          name: tenantName.trim(),
          email: existing.email,
          slug: tenantName.trim().toLowerCase().replace(/\s+/g, "-"),
          timezone: "America/Argentina/Buenos_Aires",
        },
      });
      tenantId = tenant.id;
    }

    const user = await db.user.update({
      where: { id: existing.id },
      data: {
        isTeacher: role === "TEACHER" ? true : existing.isTeacher,
        isStudent: role === "STUDENT" ? true : existing.isStudent,
        tenantId,
      },
    });

    await (await clerkClient()).users.updateUser(userId, {
      publicMetadata: {
        isTeacher: user.isTeacher,
        isStudent: user.isStudent,
        isAdmin: user.isAdmin,
        tenantId: user.tenantId ?? null,
      },
    });

    return NextResponse.json({ message: "Profile added" }, { status: 200 });
  } catch (error) {
    console.error("add-profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
