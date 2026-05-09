"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Payment {
  id: string;
  student: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
  };
  amount: number;
  status: string;
  totalClasses: number;
  classesUsed: number;
  expiresAt?: string;
  createdAt: string;
}

export default function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");

      const data = await res.json();
      setPayments(data.data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      alert("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      void fetchPayments();
    }
  }, [fetchPayments]);

  const markAttendance = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/teacher/payments/${paymentId}/mark-attendance`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to mark attendance");

      alert("Clase marcada exitosamente");
      fetchPayments();
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Error al marcar la clase");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Pagos de Estudiantes</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay pagos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {payments.map((payment) => {
            const remaining = payment.totalClasses - payment.classesUsed;
            const isExpired =
              payment.expiresAt && new Date(payment.expiresAt) < new Date();

            return (
              <div key={payment.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{payment.student.name}</h3>
                    <p className="text-gray-600 text-sm">{payment.student.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      payment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 py-4 border-t border-b">
                  <div>
                    <p className="text-gray-600 text-sm">Plan</p>
                    <p className="font-semibold">{payment.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Monto</p>
                    <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Clases Usadas</p>
                    <p className="font-semibold">
                      {payment.classesUsed} / {payment.totalClasses}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Clases Restantes</p>
                    <p
                      className={`font-semibold ${
                        remaining === 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {remaining}
                    </p>
                  </div>
                </div>

                {isExpired && (
                  <p className="text-red-600 text-sm py-2">
                    Vencido el {new Date(payment.expiresAt!).toLocaleDateString()}
                  </p>
                )}

                {!isExpired && remaining > 0 && (
                  <button
                    onClick={() => markAttendance(payment.id)}
                    className="btn-primary mt-4"
                  >
                    Marcar Clase Asistida
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
