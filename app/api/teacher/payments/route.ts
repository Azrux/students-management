import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";
import { sendPaymentConfirmationEmail, sendTeacherPaymentReceivedEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { tenant } = result;

  const payments = await db.payment.findMany({
    where: { tenantId: tenant.id },
    include: {
      student: true,
      plan: { include: { class: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(payments);
}

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { user, tenant } = result;
  const { studentId, planId, amount, notes } = await request.json();

  if (!studentId || !planId || !amount) {
    return errorResponse("studentId, planId, amount are required", 400);
  }

  // Verify student belongs to tenant
  const student = await db.student.findFirst({
    where: { id: studentId, tenantId: tenant.id },
  });

  if (!student) {
    return errorResponse("Student not found", 404);
  }

  // Verify plan belongs to tenant
  const plan = await db.paymentPlan.findFirst({
    where: { id: planId, tenantId: tenant.id },
  });

  if (!plan) {
    return errorResponse("Plan not found", 404);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

  const payment = await db.payment.create({
    data: {
      tenantId: tenant.id,
      studentId,
      planId,
      amount: parseFloat(amount.toString()),
      totalClasses: plan.numClasses,
      classesUsed: 0,
      status: "COMPLETED",
      paidAt: new Date(),
      expiresAt,
      notes: notes || "",
    },
    include: {
      student: true,
      plan: { include: { class: true } },
    },
  });

  // Send confirmation emails
  await sendPaymentConfirmationEmail(
    student.name,
    student.email,
    plan.name,
    parseFloat(amount.toString()),
    plan.numClasses,
    expiresAt
  );

  await sendTeacherPaymentReceivedEmail(
    user.name,
    user.email,
    student.name,
    plan.name,
    parseFloat(amount.toString())
  );

  return successResponse(payment, 201);
}
