import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import { getToken } from "next-auth/jwt";

async function verifyAdminAccess(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "ADMIN") {
    return null;
  }

  return token;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const token = await verifyAdminAccess(request);
  if (!token) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  const { tenantId } = await params;

  try {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return errorResponse("Tenant not found", 404);
    }

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
  const token = await verifyAdminAccess(request);
  if (!token) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  const { tenantId } = await params;
  const { theme, name, slug } = await request.json();

  try {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return errorResponse("Tenant not found", 404);
    }

    const updateData: any = {};
    if (theme) updateData.theme = theme;
    if (name) updateData.name = name;
    if (slug) {
      const existingSlug = await db.tenant.findFirst({
        where: { slug, id: { not: tenantId } },
      });
      if (existingSlug) {
        return errorResponse("Slug already in use", 400);
      }
      updateData.slug = slug;
    }

    const updated = await db.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return successResponse(updated);
  } catch (err) {
    console.error("Error updating tenant:", err);
    return errorResponse("Failed to update tenant", 500);
  }
}
