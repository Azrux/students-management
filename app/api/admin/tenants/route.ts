import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";

async function verifyAdminAccess() {
  const { userId, sessionClaims } = await auth();
  if (!userId || (sessionClaims?.publicMetadata as { isAdmin?: boolean })?.isAdmin !== true) {
    return null;
  }
  return userId;
}

export async function GET(_request: NextRequest) {
  const adminId = await verifyAdminAccess();
  if (!adminId) return errorResponse("Unauthorized - Admin access required", 403);

  try {
    const tenants = await db.tenant.findMany({
      select: { id: true, name: true, email: true, slug: true, theme: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    return successResponse(tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    return errorResponse("Failed to fetch tenants", 500);
  }
}

export async function POST(request: NextRequest) {
  const adminId = await verifyAdminAccess();
  if (!adminId) return errorResponse("Unauthorized - Admin access required", 403);

  const { name, email, slug } = await request.json();
  if (!name || !email || !slug) return errorResponse("name, email, slug are required", 400);

  try {
    const existingSlug = await db.tenant.findFirst({ where: { slug } });
    if (existingSlug) return errorResponse("Slug already in use", 400);

    const tenant = await db.tenant.create({
      data: {
        name,
        email,
        slug,
        theme: {
          primary: "#3b82f6",
          secondary: "#1e40af",
          accent: "#f59e0b",
          background: "#ffffff",
          textPrimary: "#000000",
          textSecondary: "#666666",
          fontFamily: "Inter",
          template: "default",
        },
      },
    });

    return successResponse(tenant, 201);
  } catch (err) {
    console.error("Error creating tenant:", err);
    return errorResponse("Failed to create tenant", 500);
  }
}
