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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  if (!(await verifyAdminAccess())) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  const { tenantId } = await params;

  try {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return errorResponse("Tenant not found", 404);
    return successResponse(tenant);
  } catch (err) {
    console.error("Error fetching tenant:", err);
    return errorResponse("Failed to fetch tenant", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  if (!(await verifyAdminAccess())) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  const { tenantId } = await params;
  const { theme, name, slug } = await request.json();

  try {
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return errorResponse("Tenant not found", 404);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (theme) updateData.theme = theme;
    if (name) updateData.name = name;
    if (slug) {
      const existingSlug = await db.tenant.findFirst({ where: { slug, id: { not: tenantId } } });
      if (existingSlug) return errorResponse("Slug already in use", 400);
      updateData.slug = slug;
    }

    const updated = await db.tenant.update({ where: { id: tenantId }, data: updateData });
    return successResponse(updated);
  } catch (err) {
    console.error("Error updating tenant:", err);
    return errorResponse("Failed to update tenant", 500);
  }
}
