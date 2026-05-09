import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;

  const classes = await db.class.findMany({
    where: { tenantId: tenant.id },
  });

  return successResponse(classes);
}

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { name, description, durationMins, maxStudents } = await request.json();

  if (!name) {
    return errorResponse("Class name is required", 400);
  }

  const newClass = await db.class.create({
    data: {
      tenantId: tenant.id,
      name,
      description: description || "",
      durationMins: durationMins || 60,
      maxStudents: maxStudents || 10,
    },
  });

  return successResponse(newClass, 201);
}
