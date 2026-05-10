"use client";

import { useEffect, useState } from "react";

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollments: Array<{
    id: string;
    class: { name: string };
    status: string;
  }>;
  payments: Array<{
    id: string;
    plan: { name: string };
    amount: number;
    totalClasses: number;
    classesUsed: number;
    status: string;
    expiresAt?: string;
  }>;
}

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("/api/teacher/students");
        if (!res.ok) throw new Error("Failed to fetch students");

        const data = await res.json();
        const students = data || [];
        const found = students.find((s: StudentDetail) => s.id === params.id);

        if (found) {
          setStudent(found);
        } else {
          alert("Estudiante no encontrado");
        }
      } catch (err) {
        console.error("Error fetching student:", err);
        alert("Error al cargar los datos del estudiante");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params.id]);

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!student) {
    return <div className="p-8">Estudiante no encontrado</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Detalles del Estudiante</h1>
        <a
          href={`/teacher/students/${params.id}/progress`}
          className="btn-primary"
        >
          Ver Notas de Progreso
        </a>
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-semibold mb-4">{student.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold">{student.email}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Teléfono</p>
            <p className="font-semibold">{student.phone || "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollments */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Clases Inscritas</h3>
          {student.enrollments.length === 0 ? (
            <div className="card text-center py-8 text-gray-600">
              Sin inscripciones
            </div>
          ) : (
            <div className="space-y-2">
              {student.enrollments.map((e) => (
                <div key={e.id} className="card">
                  <p className="font-semibold">{e.class.name}</p>
                  <p className="text-sm text-gray-600">{e.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Pagos Activos</h3>
          {student.payments.length === 0 ? (
            <div className="card text-center py-8 text-gray-600">
              Sin pagos registrados
            </div>
          ) : (
            <div className="space-y-2">
              {student.payments.map((p) => {
                const isExpired =
                  p.expiresAt && new Date(p.expiresAt) < new Date();

                return (
                  <div
                    key={p.id}
                    className={`card ${isExpired ? "opacity-50" : ""}`}
                  >
                    <p className="font-semibold">{p.plan.name}</p>
                    <p className="text-sm text-gray-600 mb-2">${p.amount.toFixed(2)}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Usadas:</span>
                        <span className="ml-1 font-semibold">{p.classesUsed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <span className="ml-1 font-semibold">{p.totalClasses}</span>
                      </div>
                    </div>
                    {p.expiresAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Vencimiento:{" "}
                        {new Date(p.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
