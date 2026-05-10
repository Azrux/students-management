import { Star } from "lucide-react";
import { t } from "@/lib/i18n/es";

const testimonials = [
  {
    name: "Carlos Rodríguez",
    role: "Profesor de Pádel",
    avatar: "CR",
    content:
      "Desde que uso ClasesApp, gestionar mis 30 alumnos es mucho más fácil. El sistema de pagos con Mercado Pago es genial.",
    rating: 5,
  },
  {
    name: "María García",
    role: "Profesora de Piano",
    avatar: "MG",
    content:
      "Mis alumnos pueden reservar sus clases y pagar online. Ya no tengo que perseguir pagos ni coordinar horarios por WhatsApp.",
    rating: 5,
  },
  {
    name: "Juan Martínez",
    role: "Profesor de Inglés",
    avatar: "JM",
    content:
      "La personalización de marca me permite tener mi propio portal profesional. Mis alumnos quedan impresionados.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.landing.testimonials.title}
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-chart-4 text-chart-4" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-medium text-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">500+</div>
            <div className="text-muted-foreground">{t.landing.stats.teachers}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">5.000+</div>
            <div className="text-muted-foreground">{t.landing.stats.students}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">50K+</div>
            <div className="text-muted-foreground">{t.landing.stats.classes}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">98%</div>
            <div className="text-muted-foreground">{t.landing.stats.satisfaction}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
