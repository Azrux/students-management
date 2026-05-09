import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

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
  });

  return successResponse(students);
}
