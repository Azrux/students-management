import { Resend } from "resend";

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Email notifications disabled.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export async function sendPaymentConfirmationEmail(
  studentName: string,
  studentEmail: string,
  planName: string,
  amount: number,
  totalClasses: number,
  expiresAt: Date
) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "noreply@estudiantesapp.com",
      to: studentEmail,
      subject: "✅ Pago confirmado - Tu plan está listo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${studentName}!</h2>
          <p>Tu pago ha sido confirmado exitosamente.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Detalles de tu compra</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Monto:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Clases:</strong> ${totalClasses}</p>
            <p><strong>Válido hasta:</strong> ${expiresAt.toLocaleDateString("es-AR")}</p>
          </div>

          <p>Ya puedes disfrutar de tus clases. Accede a tu dashboard para ver los horarios disponibles.</p>
          <p>Saludos,<br/>El equipo de EstudiantesApp</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
  }
}

export async function sendClassReminderEmail(
  studentName: string,
  studentEmail: string,
  className: string,
  startTime: Date,
  teacherName: string
) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "noreply@estudiantesapp.com",
      to: studentEmail,
      subject: `📅 Recordatorio: Tu clase de ${className} está por comenzar`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${studentName}!</h2>
          <p>Recordatorio de tu próxima clase:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Clase:</strong> ${className}</p>
            <p><strong>Profesor:</strong> ${teacherName}</p>
            <p><strong>Fecha y hora:</strong> ${startTime.toLocaleString("es-AR")}</p>
          </div>

          <p>¡No olvides llegar con 10 minutos de anticipación!</p>
          <p>Saludos,<br/>El equipo de EstudiantesApp</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending class reminder email:", error);
  }
}

export async function sendPaymentExpiryWarningEmail(
  studentName: string,
  studentEmail: string,
  planName: string,
  classesRemaining: number,
  expiresAt: Date
) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "noreply@estudiantesapp.com",
      to: studentEmail,
      subject: "⏰ Tu plan vence pronto - Compra ahora",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${studentName}!</h2>
          <p>Tu plan de clases vence pronto. No quiero que pierdas tu acceso.</p>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Clases restantes:</strong> ${classesRemaining}</p>
            <p><strong>Vence el:</strong> ${expiresAt.toLocaleDateString("es-AR")}</p>
          </div>

          <p>Compra un nuevo plan ahora para seguir disfrutando de tus clases sin interrupciones.</p>
          <p>Saludos,<br/>El equipo de EstudiantesApp</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending expiry warning email:", error);
  }
}

export async function sendTeacherPaymentReceivedEmail(
  teacherName: string,
  teacherEmail: string,
  studentName: string,
  planName: string,
  amount: number
) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "noreply@estudiantesapp.com",
      to: teacherEmail,
      subject: `💰 Nuevo pago recibido de ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${teacherName}!</h2>
          <p>Un estudiante ha realizado un pago.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Estudiante:</strong> ${studentName}</p>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Monto:</strong> $${amount.toFixed(2)}</p>
          </div>

          <p>Accede a tu dashboard para ver más detalles y gestionar las clases del estudiante.</p>
          <p>Saludos,<br/>El equipo de EstudiantesApp</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending teacher payment email:", error);
  }
}
