import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

// Authenticated: links the signed-in user's account to the Student row
// created by their teacher's invite, and activates their student profile.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("Unauthorized", 401);

  const { token } = await request.json();
  if (!token) return errorResponse("token is required", 400);

  const student = await db.student.findUnique({ where: { inviteToken: token } });
  if (!student) return errorResponse("Invite not found", 404);
  if (student.status === "ACTIVE") {
    return errorResponse("This invite was already accepted", 410);
  }

  let user = await db.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    // First time we see this Clerk user — create their DB record straight
    // from the invite (name/email), same as complete-signup would.
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? student.email;
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || student.name;

    user = await db.user.create({
      data: { clerkId: userId, email, name, isStudent: true },
    });
  } else if (!user.isStudent) {
    user = await db.user.update({
      where: { id: user.id },
      data: { isStudent: true },
    });
  }

  const updatedStudent = await db.student.update({
    where: { id: student.id },
    data: { userId: user.id, status: "ACTIVE", joinedAt: new Date() },
  });

  await (await clerkClient()).users.updateUser(userId, {
    publicMetadata: {
      isTeacher: user.isTeacher,
      isStudent: true,
      isAdmin: user.isAdmin,
      tenantId: user.tenantId ?? null,
    },
  });

  return successResponse({ studentId: updatedStudent.id });
}
