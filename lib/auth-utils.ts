import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return await db.user.findUnique({
    where: { clerkId: userId },
  });
}

export async function getCurrentTenant() {
  const user = await getCurrentUser();
  if (!user?.tenantId) return null;

  return await db.tenant.findUnique({
    where: { id: user.tenantId },
  });
}

export async function getClerkUser() {
  return await currentUser();
}
