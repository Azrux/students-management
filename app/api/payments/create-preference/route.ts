import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserWithTenant, errorResponse, successResponse, isUserTenantResult } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const result = await getCurrentUserWithTenant(request);
  if (!isUserTenantResult(result)) return result;

  const { user, tenant } = result;
  const { planId } = await request.json();

  if (!planId) {
    return errorResponse("planId is required", 400);
  }

  const student = await db.student.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return errorResponse("Student profile not found", 404);
  }

  const plan = await db.paymentPlan.findFirst({
    where: {
      id: planId,
      tenantId: tenant.id,
    },
    include: { class: true },
  });

  if (!plan) {
    return errorResponse("Plan not found", 404);
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return errorResponse("Payment service not configured", 500);
  }

  const preference = {
    items: [
      {
        id: plan.id,
        title: `${plan.name} - ${plan.class.name}`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: "ARS",
      },
    ],
    payer: {
      email: student.email,
      name: student.name,
    },
    notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${process.env.NEXTAUTH_URL}/student/payments?status=success`,
      failure: `${process.env.NEXTAUTH_URL}/student/payments?status=failure`,
      pending: `${process.env.NEXTAUTH_URL}/student/payments?status=pending`,
    },
    auto_return: "approved",
    external_reference: `${tenant.id}-${student.id}-${plan.id}`,
    metadata: {
      tenantId: tenant.id,
      studentId: student.id,
      planId: plan.id,
    },
  };

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.json();
      return errorResponse(`MercadoPago error: ${error.message}`, 400);
    }

    const mpPreference = await response.json();

    return successResponse({
      checkoutUrl: mpPreference.init_point,
      preferenceId: mpPreference.id,
    });
  } catch (err) {
    console.error("MercadoPago preference error:", err);
    return errorResponse("Failed to create payment preference", 500);
  }
}
