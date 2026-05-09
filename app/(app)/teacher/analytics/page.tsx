"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  totalRevenue: number;
  totalPayments: number;
  totalStudents: number;
  activeStudents: number;
  averageRevenuePerStudent: number;
  paymentsByStatus: {
    COMPLETED: number;
    PENDING: number;
    EXPIRED: number;
    CANCELLED: number;
  };
  topPlans: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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

        // Calculate analytics
        const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        const activeStudents = students.filter((s: any) =>
          payments.some(
            (p: any) =>
              p.studentId === s.id &&
              p.status === "COMPLETED" &&
              (!p.expiresAt || new Date(p.expiresAt) > new Date())
          )
        ).length;

        const paymentsByStatus = {
          COMPLETED: payments.filter((p: any) => p.status === "COMPLETED").length,
          PENDING: payments.filter((p: any) => p.status === "PENDING").length,
          EXPIRED: payments.filter((p: any) => p.status === "EXPIRED").length,
          CANCELLED: payments.filter((p: any) => p.status === "CANCELLED").length,
        };

        // Group by plan
        const planGroups: { [key: string]: { revenue: number; count: number } } = {};
        payments.forEach((p: any) => {
          const planName = p.plan.name;
          if (!planGroups[planName]) {
            planGroups[planName] = { revenue: 0, count: 0 };
          }
          planGroups[planName].revenue += p.amount;
          planGroups[planName].count += 1;
        });

        const topPlans = Object.entries(planGroups)
          .map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Monthly revenue
        const monthlyData: { [key: string]: number } = {};
        payments.forEach((p: any) => {
          const date = new Date(p.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + p.amount;
        });

        const monthlyRevenue = Object.entries(monthlyData)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12); // Last 12 months

        setAnalytics({
          totalRevenue,
          totalPayments: payments.length,
          totalStudents: students.length,
          activeStudents,
          averageRevenuePerStudent:
            students.length > 0 ? totalRevenue / students.length : 0,
          paymentsByStatus,
          topPlans,
          monthlyRevenue,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8">Cargando analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-8">Error al cargar datos</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics y Reportes</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-gray-500 text-sm">Ingresos Totales</div>
          <div className="text-3xl font-bold mt-2 text-green-600">
            ${analytics.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div className="card">
          <div className="text-gray-500 text-sm">Total de Estudiantes</div>
          <div className="text-3xl font-bold mt-2">{analytics.totalStudents}</div>
        </div>

        <div className="card">
          <div className="text-gray-500 text-sm">Estudiantes Activos</div>
          <div className="text-3xl font-bold mt-2 text-blue-600">
            {analytics.activeStudents}
          </div>
        </div>

        <div className="card">
          <div className="text-gray-500 text-sm">Promedio por Estudiante</div>
          <div className="text-3xl font-bold mt-2">
            ${analytics.averageRevenuePerStudent.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Estado de Pagos</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded">
              <span className="font-medium">Completados</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics.paymentsByStatus.COMPLETED}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-amber-50 rounded">
              <span className="font-medium">Pendientes</span>
              <span className="text-2xl font-bold text-amber-600">
                {analytics.paymentsByStatus.PENDING}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded">
              <span className="font-medium">Expirados</span>
              <span className="text-2xl font-bold text-red-600">
                {analytics.paymentsByStatus.EXPIRED}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
              <span className="font-medium">Cancelados</span>
              <span className="text-2xl font-bold text-gray-600">
                {analytics.paymentsByStatus.CANCELLED}
              </span>
            </div>
          </div>
        </div>

        {/* Top Plans */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Planes Más Vendidos</h2>
          <div className="space-y-2">
            {analytics.topPlans.length === 0 ? (
              <p className="text-gray-600">No hay datos disponibles</p>
            ) : (
              analytics.topPlans.map((plan, idx) => (
                <div key={idx} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{plan.name}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {plan.count} ventas
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    ${plan.revenue.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Ingresos Mensuales</h2>
        <div className="space-y-2">
          {analytics.monthlyRevenue.length === 0 ? (
            <p className="text-gray-600">No hay datos disponibles</p>
          ) : (
            analytics.monthlyRevenue.map((item) => {
              const maxRevenue = Math.max(
                ...analytics.monthlyRevenue.map((r) => r.revenue)
              );
              const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

              return (
                <div key={item.month}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.month}</span>
                    <span className="text-sm font-bold">${item.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
