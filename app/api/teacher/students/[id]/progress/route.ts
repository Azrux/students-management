import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { id: studentId } = await params;

  try {
    const progressNotes = await db.progressNote.findMany({
      where: {
        tenantId: tenant.id,
        studentId,
      },
      include: {
        class: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(progressNotes);
  } catch (err) {
    console.error("Error fetching progress notes:", err);
    return errorResponse("Failed to fetch progress notes", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;
  const { id: studentId } = await params;
  const { classId, note, rating } = await request.json();

  if (!classId || !note) {
    return errorResponse("classId and note are required", 400);
  }

  try {
    const student = await db.student.findFirst({
      where: {
        id: studentId,
        tenantId: tenant.id,
      },
    });

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const classData = await db.class.findFirst({
      where: {
        id: classId,
        tenantId: tenant.id,
      },
    });

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    const progressNote = await db.progressNote.create({
      data: {
        tenantId: tenant.id,
        studentId,
        classId,
        note,
        rating: rating ? Math.min(Math.max(rating, 1), 5) : null,
      },
      include: {
        class: true,
      },
    });

    return successResponse(progressNote, 201);
  } catch (err) {
    console.error("Error creating progress note:", err);
    return errorResponse("Failed to create progress note", 500);
  }
}
