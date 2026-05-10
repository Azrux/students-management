import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/es";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.landing.pricing.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.landing.pricing.subtitle}
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free plan */}
          <div className="relative bg-card rounded-2xl p-8 border border-border">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.landing.pricing.free.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {t.landing.pricing.free.price}
                </span>
                <span className="text-muted-foreground">{t.landing.pricing.free.period}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {t.landing.pricing.free.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full">
                {t.actions.getStarted}
              </Button>
            </Link>
          </div>

          {/* Pro plan */}
          <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border-2 border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t.landing.pricing.pro.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {t.landing.pricing.pro.price}
                </span>
                <span className="text-muted-foreground">{t.landing.pricing.pro.period}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {t.landing.pricing.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/auth/signup">
              <Button className="w-full">{t.actions.getStarted}</Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            ¿Tienes preguntas?{" "}
            <Link href="#contact" className="text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
