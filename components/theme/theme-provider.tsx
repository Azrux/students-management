"use client";

import { TenantTheme } from "@/lib/theme/theme-templates";
import { ReactNode } from "react";

interface ThemeProviderProps {
  theme: TenantTheme;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVariables = `
    --primary: ${theme.primary};
    --secondary: ${theme.secondary};
    --accent: ${theme.accent};
    --background: ${theme.background};
    --text-primary: ${theme.textPrimary};
    --text-secondary: ${theme.textSecondary};
    --font-family: ${theme.fontFamily};
  `;

  return (
    <>
      <style>{`:root { ${cssVariables} }`}</style>
      {children}
    </>
  );
}
