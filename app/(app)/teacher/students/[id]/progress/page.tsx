"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

interface ProgressNote {
  id: string;
  note: string;
  rating?: number;
  class: { name: string };
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
}

const progressSchema = z.object({
  classId: z.string().min(1, "Seleccioná una clase"),
  note: z
    .string()
    .min(10, "La nota debe tener al menos 10 caracteres")
    .max(1000, "La nota no puede superar los 1000 caracteres"),
  rating: z
    .number()
    .int()
    .min(1, "La evaluación mínima es 1")
    .max(5, "La evaluación máxima es 5")
    .optional(),
});

type FormErrors = Partial<Record<string, string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
}

export default function StudentProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const [notes, setNotes] = useState<ProgressNote[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    note: "",
    rating: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, classesRes] = await Promise.all([
          fetch(`/api/teacher/students/${params.id}/progress`),
          fetch("/api/teacher/classes"),
        ]);

        if (!notesRes.ok || !classesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const notesData = await notesRes.json();
        const classesData = await classesRes.json();

        setNotes(notesData || []);
        setClasses(classesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = progressSchema.safeParse({
      classId: formData.classId,
      note: formData.note,
      rating: formData.rating > 0 ? formData.rating : undefined,
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
      const res = await fetch(`/api/teacher/students/${params.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("Failed to create note");

      const data = await res.json();
      setNotes([data, ...notes]);
      setFormData({ classId: "", note: "", rating: 0 });
      setShowForm(false);
      alert("Nota de progreso agregada");
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Error al guardar la nota");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded input-field ${
      errors[field] ? "border-red-500 focus:border-red-500" : "border-gray-300"
    }`;

  const getRatingColor = (rating?: number) => {
    if (!rating) return "bg-gray-100";
    if (rating >= 4) return "bg-green-100";
    if (rating >= 3) return "bg-blue-100";
    if (rating >= 2) return "bg-amber-100";
    return "bg-red-100";
  };

  const getRatingText = (rating?: number) => {
    if (!rating) return "";
    const ratings: Record<number, string> = {
      1: "Necesita mejora",
      2: "En progreso",
      3: "Satisfactorio",
      4: "Muy bueno",
      5: "Excelente",
    };
    return ratings[rating] || "";
  };

  if (loading) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Notas de Progreso del Estudiante</h1>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="font-semibold mb-4">Nueva Nota de Progreso</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Clase</label>
              <select
                value={formData.classId}
                onChange={(e) => {
                  setFormData({ ...formData, classId: e.target.value });
                  setErrors((p) => ({ ...p, classId: undefined }));
                }}
                className={inputClass("classId")}
              >
                <option value="">Seleccionar clase...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <FieldError msg={errors.classId} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nota de Progreso
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => {
                  setFormData({ ...formData, note: e.target.value });
                  setErrors((p) => ({ ...p, note: undefined }));
                }}
                placeholder="Describe el progreso del estudiante..."
                className={`${inputClass("note")} h-24`}
              />
              <div className="flex justify-between items-start mt-1">
                <FieldError msg={errors.note} />
                <span className="text-gray-400 text-xs ml-auto">
                  {formData.note.length}/1000
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Evaluación{" "}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, rating: formData.rating === r ? 0 : r });
                      setErrors((p) => ({ ...p, rating: undefined }));
                    }}
                    className={`w-10 h-10 rounded border-2 transition font-medium text-sm ${
                      formData.rating === r
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400 text-gray-600"
                    }`}
                  >
                    {r}
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="self-center text-sm text-gray-600 ml-1">
                    {getRatingText(formData.rating)}
                  </span>
                )}
              </div>
              <FieldError msg={errors.rating} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Guardando..." : "Guardar Nota"}
            </button>
          </div>
        </form>
      )}

      <button
        onClick={() => {
          setShowForm(!showForm);
          setErrors({});
        }}
        className="btn-primary mb-8"
      >
        {showForm ? "Cancelar" : "Agregar Nota"}
      </button>

      {notes.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay notas de progreso registradas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`card ${getRatingColor(note.rating)}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{note.class.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(note.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
                {note.rating && (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{note.rating}/5</div>
                    <p className="text-xs font-medium">
                      {getRatingText(note.rating)}
                    </p>
                  </div>
                )}
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
