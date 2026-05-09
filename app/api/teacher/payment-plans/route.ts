import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;

  const plans = await db.paymentPlan.findMany({
    where: { tenantId: tenant.id },
    include: { class: true },
  });

  return successResponse(plans);
}

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { classId, name, numClasses, price, validityDays } = await request.json();

  if (!classId || !name || !numClasses || !price) {
    return errorResponse("classId, name, numClasses, price are required", 400);
  }

  // Verify class belongs to tenant
  const classExists = await db.class.findFirst({
    where: { id: classId, tenantId: tenant.id },
  });

  if (!classExists) {
    return errorResponse("Class not found", 404);
  }

  const plan = await db.paymentPlan.create({
    data: {
      tenantId: tenant.id,
      classId,
      name,
      numClasses: parseInt(numClasses),
      price: parseFloat(price),
      validityDays: validityDays ? parseInt(validityDays) : 90,
    },
    include: { class: true },
  });

  return successResponse(plan, 201);
}
