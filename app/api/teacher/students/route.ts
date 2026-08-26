import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  getCurrentUserWithTenant,
  errorResponse,
  successResponse,
  isUserTenantResult,
} from "@/lib/api-helpers";
import { sendStudentInviteEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;

  const students = await db.student.findMany({
    where: { tenantId: tenant.id },
    include: {
      enrollments: {
        include: { class: true },
      },
      payments: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(students);
}

// Invites a student to this teacher's tenant. This is the only way a
// Student row gets created while the marketplace is disabled (phase 1) —
// students don't self-register into a specific teacher's workspace.
export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { user, tenant } = result;
  const { name, email, phone } = await request.json();

  if (!name?.trim() || !email?.trim()) {
    return errorResponse("name and email are required", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db.student.findFirst({
    where: { tenantId: tenant.id, email: normalizedEmail },
  });
  if (existing) {
    return errorResponse("This student is already invited to your workspace", 409);
  }

  const inviteToken = crypto.randomBytes(24).toString("hex");

  const student = await db.student.create({
    data: {
      tenantId: tenant.id,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      status: "PENDING",
      inviteToken,
      invitedAt: new Date(),
    },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL ?? ""}/invite/${inviteToken}`;
  await sendStudentInviteEmail(student.name, student.email, user.name, tenant.name, inviteUrl);

  return successResponse(student, 201);
}
