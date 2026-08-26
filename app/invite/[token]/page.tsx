"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, SignIn, SignUp } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteInfo {
  studentName: string;
  studentEmail: string;
  tenantName: string;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  useEffect(() => {
    fetch(`/api/public/invite/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invitación no encontrada");
          return;
        }
        setInfo(data);
      })
      .catch(() => setError("No pudimos cargar la invitación"));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    setError("");

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se pudo aceptar la invitación");
        return;
      }

      router.push("/student/dashboard");
    } catch {
      setError("No se pudo aceptar la invitación");
    } finally {
      setAccepting(false);
    }
  }

  const redirectUrl = `/invite/${token}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          {info ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                {info.tenantName} te invitó
              </h1>
              <p className="text-muted-foreground mt-2">
                Aceptá la invitación con {info.studentEmail} para empezar.
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-foreground">Invitación</h1>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {!info && !error && (
          <p className="text-center text-muted-foreground">Cargando invitación...</p>
        )}

        {info && isLoaded && isSignedIn && (
          <Button className="w-full" size="lg" onClick={handleAccept} disabled={accepting}>
            {accepting ? "Aceptando..." : "Aceptar invitación"}
          </Button>
        )}

        {info && isLoaded && !isSignedIn && (
          <div className="space-y-4">
            {authMode === "signup" ? (
              <SignUp
                forceRedirectUrl={redirectUrl}
                initialValues={{ emailAddress: info.studentEmail }}
              />
            ) : (
              <SignIn forceRedirectUrl={redirectUrl} />
            )}

            <button
              type="button"
              onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {authMode === "signup" ? "Ya tengo una cuenta" : "Quiero crear una cuenta"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
