"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: "PENDING" | "ACTIVE";
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
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");

    try {
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, phone: invitePhone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setInviteError(data.error || "Error al invitar al alumno");
        return;
      }

      setInviteName("");
      setInviteEmail("");
      setInvitePhone("");
      setShowInviteForm(false);
      setLoading(true);
      setRefreshKey((k) => k + 1);
    } catch {
      setInviteError("Error al invitar al alumno");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mis Estudiantes</h1>
        <Button onClick={() => setShowInviteForm((v) => !v)}>
          {showInviteForm ? "Cancelar" : "Invitar alumno"}
        </Button>
      </div>

      {showInviteForm && (
        <form onSubmit={handleInvite} className="card mb-8 space-y-4 max-w-md">
          {inviteError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              {inviteError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono (opcional)</label>
            <input
              type="text"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              className="input-field"
            />
          </div>
          <Button type="submit" disabled={inviting}>
            {inviting ? "Enviando..." : "Enviar invitación"}
          </Button>
        </form>
      )}

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
                <th className="text-left py-3 px-4">Estado</th>
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
                      {student.status === "PENDING" ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                          Invitación pendiente
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Activo
                        </span>
                      )}
                    </td>
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
