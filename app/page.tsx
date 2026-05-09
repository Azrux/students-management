import Link from "next/link";
import { t } from "@/lib/i18n/es";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="container-max flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-[var(--primary)]">
            StudentsApp
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-[var(--primary)]"
            >
              {t.buttons.login}
            </Link>
            <Link
              href="/auth/signup"
              className="btn-primary"
            >
              {t.buttons.signup}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container-max py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-[var(--primary)]">
              Gestiona tus clases fácilmente
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              La plataforma todo-en-uno para profesores que quieren organizar
              sus estudiantes, horarios y pagos en un solo lugar.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[var(--accent)]">✓</span>
                <p className="text-lg">Gestiona estudiantes y horarios</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[var(--accent)]">✓</span>
                <p className="text-lg">Crea planes de pago personalizados</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[var(--accent)]">✓</span>
                <p className="text-lg">Integración con MercadoPago</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl text-[var(--accent)]">✓</span>
                <p className="text-lg">Tema personalizable para tu marca</p>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Link
                href="/auth/signup"
                className="btn-primary text-lg"
              >
                Comenzar ahora
              </Link>
              <Link
                href="#features"
                className="px-6 py-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-lg font-semibold hover:bg-blue-50"
              >
                Conoce más
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <div className="h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20 py-8">
        <div className="container-max text-center text-[var(--text-secondary)]">
          <p>&copy; 2026 StudentsApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
