"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Circle, ShoppingBag, Calendar } from "lucide-react";

interface ActivePayment {
  id: string;
  plan: { name: string; class: { name: string } };
  totalClasses: number;
  classesUsed: number;
  expiresAt?: string;
  isExpired: boolean;
  classesRemaining: number;
}

interface Enrollment {
  id: string;
  class: { name: string };
}

export default function StudentDashboard() {
  const [payments, setPayments] = useState<ActivePayment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, enrollmentsRes] = await Promise.all([
          fetch("/api/student/payments"),
          fetch("/api/student/enrollments"),
        ]);

        const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
        const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : [];

        setPayments(paymentsData || []);
        setEnrollments(enrollmentsData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalClassesRemaining = payments.reduce(
    (sum, p) => sum + (p.isExpired ? 0 : p.classesRemaining),
    0
  );

  const activePayments = payments.filter((p) => !p.isExpired);

  const nextSteps = [
    {
      key: "buy",
      icon: ShoppingBag,
      title: "Comprar un plan de clases",
      description: "Adquirí clases para empezar a reservar",
      href: "/student/shop",
      done: activePayments.length > 0,
    },
    {
      key: "enroll",
      icon: Calendar,
      title: "Inscribirte en un horario",
      description: "Elegí el horario que mejor se adapte a vos",
      href: "/student/schedule",
      done: enrollments.length > 0,
    },
  ];

  const allStepsDone = nextSteps.every((s) => s.done);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Mi Panel de Estudiante</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card">
              <div className="text-gray-500 text-sm">Planes Activos</div>
              <div className="text-3xl font-bold mt-2">{activePayments.length}</div>
            </div>
            <div className="card">
              <div className="text-gray-500 text-sm">Clases Disponibles</div>
              <div className="text-3xl font-bold mt-2 text-green-600">
                {totalClassesRemaining}
              </div>
            </div>
          </div>

          {/* Next steps — hidden once all are done */}
          {!allStepsDone && (
            <div className="card mb-8">
              <h2 className="font-semibold text-base mb-4">Primeros pasos</h2>
              <div className="space-y-3">
                {nextSteps.map((step) => {
                  const Icon = step.icon;
                  return step.done ? (
                    <div
                      key={step.key}
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 line-through">
                          {step.title}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={step.key}
                      href={step.href}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
                    >
                      <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active plans */}
          {payments.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-4">Mis Planes Activos</h2>
              <div className="grid grid-cols-1 gap-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`card ${payment.isExpired ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.plan.name}</h3>
                        <p className="text-gray-600 text-sm">{payment.plan.class.name}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          payment.isExpired
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payment.isExpired ? "Vencido" : "Activo"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                      <div>
                        <p className="text-gray-600 text-sm">Clases Usadas</p>
                        <p className="font-semibold">
                          {payment.classesUsed} / {payment.totalClasses}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Clases Restantes</p>
                        <p className="font-semibold text-green-600">
                          {payment.classesRemaining}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Vencimiento</p>
                        <p className="font-semibold text-sm">
                          {payment.expiresAt
                            ? new Date(payment.expiresAt).toLocaleDateString("es-AR")
                            : "Sin vencimiento"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {payments.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No tenés planes de pago activos</p>
              <Link href="/student/shop" className="btn-primary inline-block">
                Comprar Clases
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
