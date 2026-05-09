import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { id } = await params;

  const payment = await db.payment.findFirst({
    where: { id, tenantId: tenant.id },
  });

  if (!payment) {
    return errorResponse("Payment not found", 404);
  }

  if (payment.classesUsed >= payment.totalClasses) {
    return errorResponse("All classes have been used", 400);
  }

  if (payment.status !== "COMPLETED") {
    return errorResponse("Payment is not active", 400);
  }

  const now = new Date();
  if (payment.expiresAt && now > payment.expiresAt) {
    return errorResponse("Payment plan has expired", 400);
  }

  const updatedPayment = await db.payment.update({
    where: { id },
    data: {
      classesUsed: payment.classesUsed + 1,
    },
    include: {
      student: true,
      plan: { include: { class: true } },
    },
  });

  return successResponse(updatedPayment);
}
