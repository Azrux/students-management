"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalStudents: number;
  totalPayments: number;
  totalRevenue: number;
  pendingPayments: number;
}

interface Payment {
  amount: number;
  status: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, paymentsRes] = await Promise.all([
          fetch("/api/teacher/students"),
          fetch("/api/teacher/payments"),
        ]);

        if (!studentsRes.ok || !paymentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const studentsData = await studentsRes.json();
        const paymentsData = await paymentsRes.json();

        const students = studentsData.data || [];
        const payments = paymentsData.data || [];

        const totalRevenue = payments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const pending = payments.filter((p: Payment) => p.status === "PENDING").length;

        setStats({
          totalStudents: students.length,
          totalPayments: payments.length,
          totalRevenue,
          pendingPayments: pending,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel del Profesor</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-gray-500 text-sm">Estudiantes Totales</div>
              <div className="text-3xl font-bold mt-2">{stats.totalStudents}</div>
            </div>

            <div className="card">
              <div className="text-gray-500 text-sm">Pagos Recibidos</div>
              <div className="text-3xl font-bold mt-2">{stats.totalPayments}</div>
            </div>

            <div className="card">
              <div className="text-gray-500 text-sm">Ingresos Totales</div>
              <div className="text-3xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</div>
            </div>

            <div className="card">
              <div className="text-gray-500 text-sm">Pagos Pendientes</div>
              <div className="text-3xl font-bold mt-2 text-amber-600">{stats.pendingPayments}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Link href="/teacher/students" className="card hover:shadow-lg transition cursor-pointer">
              <div className="text-lg font-semibold">Gestionar Estudiantes</div>
              <p className="text-gray-600 text-sm mt-2">Ver lista de estudiantes y sus detalles</p>
            </Link>

            <Link href="/teacher/schedules" className="card hover:shadow-lg transition cursor-pointer">
              <div className="text-lg font-semibold">Agendar Clases</div>
              <p className="text-gray-600 text-sm mt-2">Crear y gestionar horarios de clases</p>
            </Link>

            <Link href="/teacher/payment-plans" className="card hover:shadow-lg transition cursor-pointer">
              <div className="text-lg font-semibold">Planes de Pago</div>
              <p className="text-gray-600 text-sm mt-2">Crear y actualizar planes de pago</p>
            </Link>

            <Link href="/teacher/payments" className="card hover:shadow-lg transition cursor-pointer">
              <div className="text-lg font-semibold">Pagos</div>
              <p className="text-gray-600 text-sm mt-2">Ver historial de pagos de estudiantes</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
