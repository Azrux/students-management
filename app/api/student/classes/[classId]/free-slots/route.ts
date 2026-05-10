import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;

  const classData = await db.class.findUnique({
    where: { id: classId },
  });

  if (!classData) {
    return errorResponse("Class not found", 404);
  }

  const now = new Date();

  const schedules = await db.schedule.findMany({
    where: {
      classId,
      isCancelled: false,
      OR: [
        { isRecurring: true },
        { isRecurring: false, specificDate: { gt: now } },
      ],
    },
    include: { enrollments: true },
    orderBy: { createdAt: "asc" },
  });

  const freeSlots = schedules
    .filter((s) => s.enrollments.length < classData.maxStudents)
    .map((s) => ({
      id: s.id,
      isRecurring: s.isRecurring,
      daysOfWeek: s.daysOfWeek,
      timeStart: s.timeStart,
      timeEnd: s.timeEnd,
      specificDate: s.specificDate,
      spotsAvailable: classData.maxStudents - s.enrollments.length,
      totalSpots: classData.maxStudents,
    }));

  return successResponse(freeSlots);
}
