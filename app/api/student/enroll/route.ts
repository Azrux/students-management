import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
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

  const student = await db.student.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return errorResponse("Student profile not found", 404);
  }

  const { classId, scheduleId } = await request.json();

  if (!classId) {
    return errorResponse("classId is required", 400);
  }

  // Verify class exists
  const classData = await db.class.findUnique({
    where: { id: classId },
  });

  if (!classData) {
    return errorResponse("Class not found", 404);
  }

  // Check if already enrolled in this class
  const existingEnrollment = await db.enrollment.findFirst({
    where: {
      studentId: student.id,
      classId,
    },
  });

  if (existingEnrollment) {
    return errorResponse("Already enrolled in this class", 400);
  }

  // If scheduleId provided, verify it
  if (scheduleId) {
    const schedule = await db.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.classId !== classId) {
      return errorResponse("Invalid schedule", 400);
    }

    // Check if schedule has available spots
    const enrollmentCount = await db.enrollment.count({
      where: { scheduleId },
    });

    if (enrollmentCount >= classData.maxStudents) {
      return errorResponse("No available spots in this schedule", 400);
    }
  }

  const enrollment = await db.enrollment.create({
    data: {
      tenantId: classData.tenantId,
      studentId: student.id,
      classId,
      scheduleId: scheduleId || null,
      status: "ACTIVE",
    },
    include: {
      class: true,
      schedule: true,
    },
  });

  return successResponse(enrollment, 201);
}
