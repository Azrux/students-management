import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { t } from "@/lib/i18n/es";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-xl font-bold">{t.app.name}</span>
            </Link>
            <p className="text-sidebar-foreground/70 text-sm">
              {t.landing.footer.description}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">{t.landing.footer.product}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.features}
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.pricing}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">{t.landing.footer.company}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t.landing.footer.legal}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-sm transition-colors"
                >
                  {t.landing.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-sidebar-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sidebar-foreground/70 text-sm">
            &copy; {new Date().getFullYear()} {t.app.name}. {t.landing.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
