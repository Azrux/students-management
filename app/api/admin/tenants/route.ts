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

export async function GET(request: NextRequest) {
  const token = await verifyAdminAccess(request);
  if (!token) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  try {
    const tenants = await db.tenant.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    return errorResponse("Failed to fetch tenants", 500);
  }
}

export async function POST(request: NextRequest) {
  const token = await verifyAdminAccess(request);
  if (!token) {
    return errorResponse("Unauthorized - Admin access required", 403);
  }

  const { name, email, slug } = await request.json();

  if (!name || !email || !slug) {
    return errorResponse("name, email, slug are required", 400);
  }

  try {
    const existingSlug = await db.tenant.findFirst({
      where: { slug },
    });

    if (existingSlug) {
      return errorResponse("Slug already in use", 400);
    }

    const theme = {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#f59e0b",
      background: "#ffffff",
      textPrimary: "#000000",
      textSecondary: "#666666",
      fontFamily: "Inter",
      template: "default",
    };

    const tenant = await db.tenant.create({
      data: {
        name,
        email,
        slug,
        theme,
      },
    });

    return successResponse(tenant, 201);
  } catch (err) {
    console.error("Error creating tenant:", err);
    return errorResponse("Failed to create tenant", 500);
  }
}
