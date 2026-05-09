"use client";

import { useEffect, useState } from "react";

interface Class {
  id: string;
  name: string;
  description?: string;
  durationMins: number;
  maxStudents: number;
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/teacher/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");

      const data = await res.json();
      setClasses(data.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
      alert("Error al cargar clases");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          durationMins: parseInt(formData.durationMins),
          maxStudents: parseInt(formData.maxStudents),
        }),
      });

      if (!res.ok) throw new Error("Failed to create class");

      const data = await res.json();
      setClasses([...classes, data.data]);
      setFormData({
        name: "",
        description: "",
        durationMins: "60",
        maxStudents: "10",
      });
      setShowForm(false);
      alert("Clase creada exitosamente");
    } catch (err) {
      console.error("Error creating class:", err);
      alert("Error al crear la clase");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Clases</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Padel Principiantes"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción de la clase"
                className="w-full px-3 py-2 border border-gray-300 rounded input-field h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.durationMins}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMins: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estudiantes Máximos
                </label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxStudents: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
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
                  Duración: <span className="font-semibold">{cls.durationMins} min</span>
                </p>
                <p className="text-gray-600">
                  Máximo: <span className="font-semibold">{cls.maxStudents} estudiantes</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
