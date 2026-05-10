"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/es";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, tenantName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al completar el registro");
        return;
      }

      // Reload Clerk session so publicMetadata updates are visible
      await user?.reload();
      const updatedRole = user?.publicMetadata?.role as string | undefined;
      router.push(updatedRole === "STUDENT" ? "/student/dashboard" : "/teacher/dashboard");
    } catch {
      setError("Error al completar el registro");
    } finally {
      setLoading(false);
    }
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t.app.name}</h1>
            <p className="text-muted-foreground mt-2">¿Cómo vas a usar la plataforma?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setRole("TEACHER")}
              className="w-full p-5 rounded-2xl border-2 border-border hover:border-primary bg-card text-left transition-all group"
            >
              <div className="font-semibold text-foreground group-hover:text-primary text-lg">
                {t.auth.signup.asTeacher}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Gestioná estudiantes, horarios y pagos
              </div>
            </button>

            <button
              onClick={() => setRole("STUDENT")}
              className="w-full p-5 rounded-2xl border-2 border-border hover:border-accent bg-card text-left transition-all group"
            >
              <div className="font-semibold text-foreground group-hover:text-primary text-lg">
                {t.auth.signup.asStudent}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Reservá clases y gestioná tus pagos
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {role === "TEACHER" ? "Crear tu espacio de clases" : "Configurar tu perfil"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {role === "TEACHER"
              ? "Ingresá el nombre de tu negocio o disciplina"
              : "Ya casi está todo listo"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "TEACHER" && (
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
            {loading ? t.messages.loading : "Comenzar"}
          </Button>

          <button
            type="button"
            onClick={() => setRole(null)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Cambiar rol
          </button>
        </form>
      </div>
    </div>
  );
}
