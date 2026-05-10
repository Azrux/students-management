"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

interface Class {
  id: string;
  name: string;
  description?: string;
  durationMins: number;
  maxStudents: number;
}

const classSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  description: z.string().max(200, "La descripción no puede superar los 200 caracteres").optional(),
  durationMins: z
    .number()
    .int("Debe ser un número entero")
    .min(15, "La duración mínima es 15 minutos")
    .max(480, "La duración máxima es 480 minutos (8 horas)"),
  maxStudents: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe haber al menos 1 estudiante")
    .max(100, "El máximo es 100 estudiantes"),
});

type FormErrors = Partial<Record<string, string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
}

export default function ClassesList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMins: "60",
    maxStudents: "10",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/teacher/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");

        const data = await res.json();
        setClasses(data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        alert("Error al cargar clases");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = classSchema.safeParse({
      name: formData.name,
      description: formData.description || undefined,
      durationMins: parseInt(formData.durationMins),
      maxStudents: parseInt(formData.maxStudents),
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("Failed to create class");

      const data = await res.json();
      setClasses([...classes, data]);
      setFormData({ name: "", description: "", durationMins: "60", maxStudents: "10" });
      setShowForm(false);
      alert("Clase creada exitosamente");
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Error al crear la clase");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded input-field ${
      errors[field] ? "border-red-500 focus:border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Clases</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrors({});
          }}
          className="btn-primary"
        >
          {showForm ? "Cancelar" : "Crear Clase"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="font-semibold mb-4">Nueva Clase</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de la Clase
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Ej: Padel Principiantes"
                className={inputClass("name")}
              />
              <FieldError msg={errors.name} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Descripción de la clase"
                className={`${inputClass("description")} h-24`}
              />
              <div className="flex justify-between items-start mt-1">
                <FieldError msg={errors.description} />
                <span className="text-gray-400 text-xs ml-auto">
                  {formData.description.length}/200
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.durationMins}
                  onChange={(e) => {
                    setFormData({ ...formData, durationMins: e.target.value });
                    setErrors((p) => ({ ...p, durationMins: undefined }));
                  }}
                  min={15}
                  max={480}
                  className={inputClass("durationMins")}
                />
                <p className="text-gray-400 text-xs mt-1">Entre 15 y 480 minutos</p>
                <FieldError msg={errors.durationMins} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estudiantes Máximos
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => {
                    setFormData({ ...formData, maxStudents: e.target.value });
                    setErrors((p) => ({ ...p, maxStudents: undefined }));
                  }}
                  min={1}
                  max={100}
                  className={inputClass("maxStudents")}
                />
                <p className="text-gray-400 text-xs mt-1">Máximo 100 estudiantes</p>
                <FieldError msg={errors.maxStudents} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creando..." : "Crear Clase"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Cargando...</div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay clases creadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="card">
              <h3 className="font-semibold text-lg mb-2">{cls.name}</h3>
              {cls.description && (
                <p className="text-gray-600 text-sm mb-3">{cls.description}</p>
              )}
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  Duración:{" "}
                  <span className="font-semibold">{cls.durationMins} min</span>
                </p>
                <p className="text-gray-600">
                  Máximo:{" "}
                  <span className="font-semibold">{cls.maxStudents} estudiantes</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
