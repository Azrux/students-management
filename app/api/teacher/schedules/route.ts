import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;

  const schedules = await db.schedule.findMany({
    where: { tenantId: tenant.id, isCancelled: false },
    include: {
      class: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return successResponse(schedules);
}

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { classId, isRecurring, daysOfWeek, timeStart, timeEnd, specificDate } = await request.json();

  if (!classId || !timeStart || !timeEnd) {
    return errorResponse("classId, timeStart, timeEnd are required", 400);
  }

  if (isRecurring && (!daysOfWeek || daysOfWeek.length === 0)) {
    return errorResponse("daysOfWeek is required for recurring schedules", 400);
  }

  if (!isRecurring && !specificDate) {
    return errorResponse("specificDate is required for one-off schedules", 400);
  }

  const classExists = await db.class.findFirst({
    where: { id: classId, tenantId: tenant.id },
  });

  if (!classExists) {
    return errorResponse("Class not found", 404);
  }

  const schedule = await db.schedule.create({
    data: {
      tenantId: tenant.id,
      classId,
      isRecurring: isRecurring ?? true,
      daysOfWeek: isRecurring ? daysOfWeek : [],
      timeStart,
      timeEnd,
      specificDate: !isRecurring && specificDate ? new Date(specificDate) : null,
    },
    include: {
      class: true,
      _count: { select: { enrollments: true } },
    },
  });

  return successResponse(schedule, 201);
}
