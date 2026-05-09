import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

interface UserSession {
  id: string;
  tenantId?: string;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const userId = (session.user as UserSession).id;
  if (!userId) return null;

  return await db.user.findUnique({
    where: { id: userId },
  });
}

export async function getCurrentTenant() {
  const session = await getCurrentSession();
  if (!session?.user) return null;

  const tenantId = (session.user as UserSession).tenantId;
  if (!tenantId) return null;

  return await db.tenant.findUnique({
    where: { id: tenantId },
  });
}
