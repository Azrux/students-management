import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// Public: lets the invite page show who's inviting whom before the student
// signs in — no auth required, doesn't expose anything sensitive.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const student = await db.student.findUnique({
    where: { inviteToken: token },
    include: { tenant: { select: { name: true } } },
  });

  if (!student) {
    return errorResponse("Invite not found", 404);
  }

  if (student.status === "ACTIVE") {
    return errorResponse("This invite was already accepted", 410);
  }

  return successResponse({
    studentName: student.name,
    studentEmail: student.email,
    tenantName: student.tenant.name,
  });
}
