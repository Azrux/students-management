"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/es";

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const isTeacher = Boolean(user?.publicMetadata?.isTeacher);
  const dashboardUrl = isTeacher ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{t.app.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.landing.footer.features}
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.landing.footer.pricing}
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Testimonios
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoaded ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                      {(user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{user.firstName ?? "Mi cuenta"}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
                      <Link
                        href={dashboardUrl}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        Mi Panel
                      </Link>
                      <button
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors border-t border-border"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.nav.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">{t.nav.login}</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">{t.nav.signup}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.landing.footer.features}
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                {t.landing.footer.pricing}
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>
                Testimonios
              </Link>
              <hr className="border-border" />
              {user ? (
                <>
                  <Link href={dashboardUrl} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Mi Panel
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => signOut({ redirectUrl: "/" })}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.nav.logout}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full justify-start">{t.nav.login}</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="w-full">{t.nav.signup}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
