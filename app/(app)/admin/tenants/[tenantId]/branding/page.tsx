"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n/es";
import { useRouter } from "next/navigation";

interface TenantTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  textPrimary: string;
  textSecondary: string;
  fontFamily: string;
  logoUrl?: string;
  tagline?: string;
  template: string;
}

const TEMPLATES = {
  default: {
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#f59e0b",
    background: "#ffffff",
    textPrimary: "#000000",
    textSecondary: "#666666",
  },
  modern: {
    primary: "#ec4899",
    secondary: "#7c3aed",
    accent: "#06b6d4",
    background: "#1f2937",
    textPrimary: "#ffffff",
    textSecondary: "#d1d5db",
  },
  warm: {
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#f59e0b",
    background: "#fef5f0",
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
  },
};

export default function BrandingPage({ params }: { params: { tenantId: string } }) {
  const router = useRouter();
  const [theme, setTheme] = useState<TenantTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const res = await fetch(`/api/admin/tenants/${params.tenantId}`);
        if (!res.ok) throw new Error("Failed to fetch tenant");

        const data = await res.json();
        setTheme(data.theme || TEMPLATES.default);
      } catch (err) {
        console.error("Error fetching tenant:", err);
        alert("Error loading tenant data");
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [params.tenantId]);

  const handleThemeChange = (field: keyof TenantTheme, value: string) => {
    if (theme) {
      setTheme({ ...theme, [field]: value });
    }
  };

  const handleTemplateSelect = (templateName: keyof typeof TEMPLATES) => {
    if (theme) {
      setTheme({
        ...theme,
        ...TEMPLATES[templateName],
        template: templateName,
      });
    }
  };

  const handleSave = async () => {
    if (!theme) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/tenants/${params.tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) throw new Error("Failed to save theme");

      alert("Cambios guardados exitosamente");
    } catch (err) {
      console.error("Error saving theme:", err);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!theme) {
    return <div className="p-8">Error al cargar el tema</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Personalización de Marca</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Plantillas Predefinidas</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATES).map(([name, colors]) => (
                <button
                  key={name}
                  onClick={() => handleTemplateSelect(name as keyof typeof TEMPLATES)}
                  className={`p-4 rounded-lg border-2 transition ${
                    theme.template === name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colors.secondary }}
                    />
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colors.accent }}
                    />
                  </div>
                  <p className="text-sm font-medium capitalize">{name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Colores</h2>
            <div className="space-y-4">
              {["primary", "secondary", "accent", "background", "textPrimary", "textSecondary"].map(
                (field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-2 capitalize">
                      {field}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme[field as keyof TenantTheme]}
                        onChange={(e) =>
                          handleThemeChange(field as keyof TenantTheme, e.target.value)
                        }
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme[field as keyof TenantTheme]}
                        onChange={(e) =>
                          handleThemeChange(field as keyof TenantTheme, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded input-field"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Tipografía</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Familia de Fuente</label>
              <select
                value={theme.fontFamily}
                onChange={(e) => handleThemeChange("fontFamily", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded input-field"
              >
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Playfair">Playfair Display</option>
              </select>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Información</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL del Logo</label>
                <input
                  type="url"
                  value={theme.logoUrl || ""}
                  onChange={(e) => handleThemeChange("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eslogan</label>
                <input
                  type="text"
                  value={theme.tagline || ""}
                  onChange={(e) => handleThemeChange("tagline", e.target.value)}
                  placeholder="Tu eslogan aquí"
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {/* Preview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          <div
            className="rounded-lg p-8 space-y-4"
            style={{
              backgroundColor: theme.background,
              color: theme.textPrimary,
              fontFamily: theme.fontFamily,
            }}
          >
            {theme.logoUrl && (
              <img
                src={theme.logoUrl}
                alt="Logo"
                className="h-12 mb-4"
              />
            )}

            <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>
              Mi Plataforma
            </h1>

            {theme.tagline && (
              <p style={{ color: theme.textSecondary }}>{theme.tagline}</p>
            )}

            <div className="space-y-3 pt-4">
              <button
                className="w-full py-2 px-4 rounded font-medium text-white transition"
                style={{
                  backgroundColor: theme.primary,
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.secondary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                }}
              >
                Botón Principal
              </button>

              <button
                className="w-full py-2 px-4 rounded font-medium text-white transition"
                style={{
                  backgroundColor: theme.secondary,
                  cursor: "pointer",
                }}
              >
                Botón Secundario
              </button>

              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.background,
                }}
              >
                <p className="font-semibold">Elemento Acentuado</p>
                <p className="text-sm">Este es un componente con color de acento</p>
              </div>

              <div
                className="p-4 rounded border"
                style={{
                  borderColor: theme.secondary,
                }}
              >
                <p className="font-semibold" style={{ color: theme.textPrimary }}>
                  Tarjeta de Contenido
                </p>
                <p style={{ color: theme.textSecondary }} className="text-sm">
                  Texto secundario en una tarjeta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
