import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("Unauthorized", 401);

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return errorResponse("User not found", 404);

  const student = await db.student.findUnique({ where: { userId: user.id } });
  if (!student) return errorResponse("Student profile not found", 404);

  const enrollments = await db.enrollment.findMany({
    where: { studentId: student.id, status: "ACTIVE" },
    include: { class: true },
  });

  return successResponse(enrollments);
}
