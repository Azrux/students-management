"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/es";

export default function AddProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const isTeacher = Boolean(user?.publicMetadata?.isTeacher);
  const isStudent = Boolean(user?.publicMetadata?.isStudent);
  const roleToAdd: "TEACHER" | "STUDENT" | null = !isTeacher ? "TEACHER" : !isStudent ? "STUDENT" : null;

  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!roleToAdd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Ya tenés los dos perfiles activados.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/add-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToAdd, tenantName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al activar el perfil");
        return;
      }

      await user?.reload();
      router.push(roleToAdd === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
    } catch {
      setError("Error al activar el perfil");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {roleToAdd === "TEACHER" ? "Activar perfil de profesor" : "Activar perfil de alumno"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {roleToAdd === "TEACHER"
              ? "Creá tu espacio de clases para empezar a gestionar alumnos"
              : "Ya casi está — podés comprar clases y ver tus horarios"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {roleToAdd === "TEACHER" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre de tu negocio o disciplina
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="input-field"
                placeholder="Ej: Padel Pro, Piano Lessons..."
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t.messages.loading : "Activar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
