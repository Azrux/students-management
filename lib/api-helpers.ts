import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { User, Tenant } from "@prisma/client";

// request param kept for backward compatibility — not used internally
export async function getCurrentUserWithTenant(
  _request?: NextRequest
): Promise<NextResponse | { user: User; tenant: Tenant }> {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized", 401);
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return errorResponse("User not found — complete onboarding first", 404);
  }

  if (!user.tenantId) {
    return errorResponse("No tenant assigned", 403);
  }

  const tenant = await db.tenant.findUnique({
    where: { id: user.tenantId },
  });

  if (!tenant) {
    return errorResponse("Tenant not found", 404);
  }

  return { user, tenant };
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function isUserTenantResult(
  result: NextResponse | { user: User; tenant: Tenant }
): result is { user: User; tenant: Tenant } {
  return !(result instanceof NextResponse);
}
