import { Calendar, CreditCard, Users, Palette } from "lucide-react";
import { t } from "@/lib/i18n/es";

const features = [
  {
    icon: Calendar,
    title: t.landing.features.scheduling.title,
    description: t.landing.features.scheduling.description,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: CreditCard,
    title: t.landing.features.payments.title,
    description: t.landing.features.payments.description,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: t.landing.features.students.title,
    description: t.landing.features.students.description,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Palette,
    title: t.landing.features.branding.title,
    description: t.landing.features.branding.description,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
];

// Deterministic calendar grid pattern — avoids SSR/hydration mismatch
const calendarPattern = [
  [true, false, true],
  [false, true, false],
  [true, true, false],
  [false, false, true],
  [true, false, true],
  [false, true, true],
  [true, false, false],
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.landing.features.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.landing.features.subtitle}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Large calendar feature */}
          <div className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-border">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Vista de Agenda</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Visualiza todas tus clases en un solo lugar
              </h3>
              <p className="text-muted-foreground mb-6">
                Vista semanal y mensual con código de colores por tipo de clase.
                Tus estudiantes pueden ver los horarios disponibles y reservar directamente.
              </p>
              <div className="mt-auto grid grid-cols-7 gap-1">
                {t.time.daysShort.map((day, i) => (
                  <div key={day} className="space-y-1">
                    <div className="text-xs text-center text-muted-foreground">{day}</div>
                    {calendarPattern[i].map((filled, j) => (
                      <div
                        key={j}
                        className={`h-8 rounded ${
                          filled
                            ? i % 2 === 0
                              ? "bg-primary/20"
                              : "bg-accent/20"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Small feature cards */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Pagos Automáticos</h4>
                  <p className="text-sm text-muted-foreground">
                    Integración directa con Mercado Pago
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-chart-4/10 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-chart-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Multi-Tenant</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada profesor tiene su propio espacio
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-chart-5/10 rounded-xl flex items-center justify-center shrink-0">
                  <Palette className="w-6 h-6 text-chart-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">100% Personalizable</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu marca, tus colores, tu logo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
