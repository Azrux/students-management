import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
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

  const now = new Date();

  const payments = await db.payment.findMany({
    where: {
      studentId: student.id,
      status: "COMPLETED",
    },
    include: {
      plan: { include: { class: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  const activePayments = payments.map((p) => ({
    ...p,
    isExpired: p.expiresAt ? now > p.expiresAt : false,
    classesRemaining: p.totalClasses - p.classesUsed,
  }));

  return successResponse(activePayments);
}
