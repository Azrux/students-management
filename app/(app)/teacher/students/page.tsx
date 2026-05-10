"use client";

import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollments: Array<{
    class: { name: string };
  }>;
  payments: Array<{
    totalClasses: number;
    classesUsed: number;
    status: string;
    expiresAt?: string;
  }>;
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("/api/teacher/students");
        if (!res.ok) throw new Error("Failed to fetch students");

        const data = await res.json();
        setStudents(data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        alert("Error al cargar estudiantes");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Mis Estudiantes</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : students.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay estudiantes registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Teléfono</th>
                <th className="text-left py-3 px-4">Clases Activas</th>
                <th className="text-left py-3 px-4">Pagos Activos</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const activePayments = student.payments.filter(
                  (p) => p.status === "COMPLETED"
                );
                const totalRemaining = activePayments.reduce(
                  (sum, p) => sum + (p.totalClasses - p.classesUsed),
                  0
                );

                return (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-sm">{student.email}</td>
                    <td className="py-3 px-4 text-sm">{student.phone || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      {student.enrollments.length}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <span className="font-semibold">{activePayments.length}</span>
                        <span className="text-gray-600 ml-1">
                          ({totalRemaining} clases)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <a
                        href={`/teacher/students/${student.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver detalles
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
