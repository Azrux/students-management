import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, tenantName } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    if (role === "TEACHER") {
      if (!tenantName) {
        return NextResponse.json(
          { message: "Tenant name required for teachers" },
          { status: 400 }
        );
      }

      // Create tenant first
      const tenant = await db.tenant.create({
        data: {
          name: tenantName,
          email,
          slug: tenantName.toLowerCase().replace(/\s+/g, "-"),
          timezone: "America/Argentina/Buenos_Aires",
        },
      });

      // Create teacher user linked to tenant
      await db.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: "TEACHER",
          tenantId: tenant.id,
        },
      });

      return NextResponse.json(
        { message: "Teacher registered successfully" },
        { status: 201 }
      );
    } else if (role === "STUDENT") {
      // Create student user (no tenant)
      const user = await db.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: "STUDENT",
        },
      });

      // Create student profile
      await db.student.create({
        data: {
          userId: user.id,
          name,
          email,
          tenantId: "", // Placeholder, students don't have initial tenant
        },
      });

      return NextResponse.json(
        { message: "Student registered successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
