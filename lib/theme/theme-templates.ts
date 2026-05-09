export type ThemeTemplate = "default" | "modern" | "warm";

export interface TenantTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  logoUrl: string | null;
  fontFamily: string;
  tagline: string | null;
  template: ThemeTemplate;
}

export const themeTemplates: Record<ThemeTemplate, Omit<TenantTheme, "logoUrl" | "tagline">> = {
  default: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#f59e0b",
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#666666",
    fontFamily: "Inter",
    template: "default",
  },
  modern: {
    primary: "#8b5cf6",
    secondary: "#6d28d9",
    accent: "#ec4899",
    background: "#fafafa",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    fontFamily: "Poppins",
    template: "modern",
  },
  warm: {
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#f1d700",
    background: "#fff7f0",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    fontFamily: "Inter",
    template: "warm",
  },
};

export function getDefaultTheme(): TenantTheme {
  return {
    ...themeTemplates.default,
    logoUrl: null,
    tagline: null,
  };
}
