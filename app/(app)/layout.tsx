"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { t } from "@/lib/i18n/es";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">{t.messages.loading}</div>;
  }

  if (!session) {
    return null;
  }

  const userRole = (session.user as any)?.role;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[var(--primary)]">StudentsApp</h1>
        </div>
        <ul className="space-y-2 px-4">
          {userRole === "TEACHER" && (
            <>
              <li>
                <Link
                  href="/teacher/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.dashboard}
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/classes"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  Mis Clases
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/students"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.students}
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/schedules"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/payment-plans"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  Planes de Pago
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/payments"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.payments}
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher/analytics"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  Analytics
                </Link>
              </li>
            </>
          )}
          {userRole === "STUDENT" && (
            <>
              <li>
                <Link
                  href="/student/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.dashboard}
                </Link>
              </li>
              <li>
                <Link
                  href="/student/schedule"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link
                  href="/student/shop"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  Comprar Clases
                </Link>
              </li>
            </>
          )}
          {userRole === "ADMIN" && (
            <>
              <li>
                <Link
                  href="/admin/tenants"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  Tenants
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            className="w-full btn-primary text-sm"
          >
            {t.buttons.logout}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
