import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPaymentConfirmationEmail, sendTeacherPaymentReceivedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { data, type, action } = await request.json();

    if (type !== "payment") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    if (action !== "payment.created") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const paymentId = data.id;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MercadoPago access token not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch payment details:", await response.text());
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 400 });
    }

    const payment = await response.json();

    if (payment.status !== "approved") {
      console.log(`Payment ${paymentId} not approved yet. Status: ${payment.status}`);
      return NextResponse.json({ status: "pending" }, { status: 200 });
    }

    const externalReference = payment.external_reference;
    if (!externalReference) {
      console.error("No external reference in payment");
      return NextResponse.json({ error: "No external reference" }, { status: 400 });
    }

    const [tenantId, studentId, planId] = externalReference.split("-");

    const plan = await db.paymentPlan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
    });

    if (!plan) {
      console.error("Plan not found:", { planId, tenantId });
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const student = await db.student.findFirst({
      where: {
        id: studentId,
        tenantId,
      },
    });

    if (!student) {
      console.error("Student not found:", { studentId, tenantId });
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.validityDays);

    const existingPayment = await db.payment.findFirst({
      where: {
        mercadoPagoId: paymentId.toString(),
      },
    });

    if (existingPayment) {
      console.log(`Payment ${paymentId} already processed`);
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    await db.payment.create({
      data: {
        tenantId,
        studentId,
        planId,
        amount: plan.price,
        totalClasses: plan.numClasses,
        classesUsed: 0,
        status: "COMPLETED",
        mercadoPagoId: paymentId.toString(),
        paidAt: new Date(),
        expiresAt,
      },
    });

    // Send confirmation emails
    await sendPaymentConfirmationEmail(
      student.name,
      student.email,
      plan.name,
      plan.price,
      plan.numClasses,
      expiresAt
    );

    // Get tenant to send teacher email
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: "TEACHER" },
          select: { email: true, name: true },
        },
      },
    });

    if (tenant && tenant.users.length > 0) {
      const teacher = tenant.users[0];
      await sendTeacherPaymentReceivedEmail(
        teacher.name,
        teacher.email,
        student.name,
        plan.name,
        plan.price
      );
    }

    console.log(`Payment ${paymentId} processed successfully`);
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
