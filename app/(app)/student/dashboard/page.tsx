"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ActivePayment {
  id: string;
  plan: {
    name: string;
    class: { name: string };
  };
  totalClasses: number;
  classesUsed: number;
  expiresAt?: string;
  isExpired: boolean;
  classesRemaining: number;
}

export default function StudentDashboard() {
  const [payments, setPayments] = useState<ActivePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("/api/student/payments");
        if (!res.ok) throw new Error("Failed to fetch payments");

        const data = await res.json();
        setPayments(data || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalClassesRemaining = payments.reduce(
    (sum, p) => sum + (p.isExpired ? 0 : p.classesRemaining),
    0
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Mi Panel de Estudiante</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="card">
              <div className="text-gray-500 text-sm">Planes Activos</div>
              <div className="text-3xl font-bold mt-2">{payments.length}</div>
            </div>

            <div className="card">
              <div className="text-gray-500 text-sm">Clases Disponibles</div>
              <div className="text-3xl font-bold mt-2 text-green-600">
                {totalClassesRemaining}
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No tienes planes de pago activos</p>
              <Link href="/student/shop" className="btn-primary inline-block">
                Comprar Clases
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Mis Planes Activos</h2>
              <div className="grid grid-cols-1 gap-4 mb-8">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`card ${payment.isExpired ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.plan.name}</h3>
                        <p className="text-gray-600 text-sm">
                          {payment.plan.class.name}
                        </p>
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
                            ? new Date(payment.expiresAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-semibold mb-4">Próximas Acciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/student/schedule"
                  className="card hover:shadow-lg transition cursor-pointer"
                >
                  <div className="text-lg font-semibold">Ver Horarios</div>
                  <p className="text-gray-600 text-sm mt-2">
                    Consulta los horarios disponibles
                  </p>
                </Link>

                <Link
                  href="/student/shop"
                  className="card hover:shadow-lg transition cursor-pointer"
                >
                  <div className="text-lg font-semibold">Comprar Más Clases</div>
                  <p className="text-gray-600 text-sm mt-2">
                    Adquiere nuevos planes de pago
                  </p>
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
