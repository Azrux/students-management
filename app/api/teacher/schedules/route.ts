import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (result instanceof NextResponse) return result;

  const { tenant } = result;

  const schedules = await db.schedule.findMany({
    where: { tenantId: tenant.id },
    include: { class: true },
    orderBy: { startTime: "asc" },
  });

  return successResponse(schedules);
}

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (result instanceof NextResponse) return result;

  const { tenant } = result;
  const { classId, startTime, endTime } = await request.json();

  if (!classId || !startTime || !endTime) {
    return errorResponse("classId, startTime, endTime are required", 400);
  }

  // Verify class belongs to tenant
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
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
    include: { class: true },
  });

  return successResponse(schedule, 201);
}
