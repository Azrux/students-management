"use client";

import { useSession } from "next-auth/react";
import { t } from "@/lib/i18n/es";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const userName = session?.user?.name;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">
        {t.dashboard.welcome}, {userName}
      </h1>

      {userRole === "TEACHER" && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-3xl font-bold text-[var(--primary)]">-</div>
            <p className="text-gray-600">{t.teacher.totalStudents}</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--accent)]">-</div>
            <p className="text-gray-600">{t.teacher.activeClasses}</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-[var(--secondary)]">-</div>
            <p className="text-gray-600">{t.teacher.totalEarnings}</p>
          </div>
          <div className="card">
            <div className="text-3xl font-bold text-orange-500">-</div>
            <p className="text-gray-600">{t.teacher.pendingPayments}</p>
          </div>
        </div>
      )}

      {userRole === "STUDENT" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{t.student.activePayments}</h2>
            <p className="text-gray-600">{t.student.noActivePayments}</p>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">{t.student.myClasses}</h2>
            <p className="text-gray-600">{t.messages.noData}</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Próximos Pasos</h2>
        <ul className="space-y-2 text-gray-600">
          <li>✓ Cuenta creada</li>
          {userRole === "TEACHER" && (
            <>
              <li>→ Crear tu primera clase</li>
              <li>→ Agregar estudiantes</li>
              <li>→ Crear planes de pago</li>
            </>
          )}
          {userRole === "STUDENT" && (
            <>
              <li>→ Buscar un profesor</li>
              <li>→ Comprar clases</li>
              <li>→ Comenzar a aprender</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
