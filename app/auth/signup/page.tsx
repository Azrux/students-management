"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/es";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === "TEACHER" && { tenantName }),
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al registrarse");
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[var(--primary)]">
          {t.auth.signupTitle}
        </h1>

        <p className="text-center text-[var(--text-secondary)] mb-6">
          {t.auth.selectRole}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setRole("STUDENT")}
            className="w-full p-4 border-2 border-[var(--primary)] rounded-lg text-left hover:bg-blue-50 transition"
          >
            <div className="font-semibold text-[var(--primary)]">
              {t.auth.studentRole}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Ver horarios, comprar clases
            </div>
          </button>

          <button
            onClick={() => setRole("TEACHER")}
            className="w-full p-4 border-2 border-[var(--accent)] rounded-lg text-left hover:bg-orange-50 transition"
          >
            <div className="font-semibold text-[var(--accent)]">
              {t.auth.teacherRole}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">
              Gestionar estudiantes, pagos
            </div>
          </button>
        </div>

        <p className="text-center mt-6 text-[var(--text-secondary)]">
          {t.auth.haveAccount}{" "}
          <Link href="/auth/login" className="text-[var(--primary)] font-semibold">
            {t.auth.loginHere}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <button
        onClick={() => setRole(null)}
        className="text-[var(--primary)] mb-4 font-semibold"
      >
        ← Cambiar rol
      </button>

      <h1 className="text-3xl font-bold text-center mb-6 text-[var(--primary)]">
        {role === "STUDENT" ? "Registrarse como Estudiante" : "Crear Perfil de Profesor"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {t.forms.name}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {t.forms.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            {t.forms.password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {role === "TEACHER" && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Nombre de tu Negocio / Disciplina
            </label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="input-field"
              placeholder="Ej: Padel Pro, Piano Lessons"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? t.messages.loading : t.buttons.signup}
        </button>
      </form>

      <p className="text-center mt-6 text-[var(--text-secondary)]">
        {t.auth.haveAccount}{" "}
        <Link href="/auth/login" className="text-[var(--primary)] font-semibold">
          {t.auth.loginHere}
        </Link>
      </p>
    </div>
  );
}
