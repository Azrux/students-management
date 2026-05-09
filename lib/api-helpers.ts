import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "./db";
import { User, Tenant } from "@prisma/client";

export async function getCurrentUserWithTenant(
  request: NextRequest
): Promise<{ user: User; tenant: Tenant } | NextResponse> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.sub) {
    return errorResponse("Unauthorized", 401);
  }

  const user = await db.user.findUnique({
    where: { id: token.sub },
  });

  if (!user) {
    return errorResponse("User not found", 404);
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

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
