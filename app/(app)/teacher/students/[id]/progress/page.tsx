"use client";

import { useEffect, useState } from "react";

interface ProgressNote {
  id: string;
  note: string;
  rating?: number;
  class: {
    name: string;
  };
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
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

        setNotes(notesData.data || []);
        setClasses(classesData.data || []);
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
    setSubmitting(true);

    try {
      const res = await fetch(`/api/teacher/students/${params.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating > 0 ? formData.rating : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create note");

      const data = await res.json();
      setNotes([data.data, ...notes]);
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

  const getRatingColor = (rating?: number) => {
    if (!rating) return "bg-gray-100";
    if (rating >= 4) return "bg-green-100";
    if (rating >= 3) return "bg-blue-100";
    if (rating >= 2) return "bg-amber-100";
    return "bg-red-100";
  };

  const getRatingText = (rating?: number) => {
    if (!rating) return "";
    const ratings = {
      1: "Necesita mejora",
      2: "En progreso",
      3: "Satisfactorio",
      4: "Muy bueno",
      5: "Excelente",
    };
    return ratings[rating as keyof typeof ratings] || "";
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
                onChange={(e) =>
                  setFormData({ ...formData, classId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded input-field"
              >
                <option value="">Seleccionar clase...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Nota de Progreso
              </label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Describe el progreso del estudiante..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded input-field h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Evaluación (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: r })}
                    className={`w-10 h-10 rounded border-2 transition ${
                      formData.rating === r
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? "Guardando..." : "Guardar Nota"}
            </button>
          </div>
        </form>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
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
