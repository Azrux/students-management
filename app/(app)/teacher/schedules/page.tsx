"use client";

import { useEffect, useState } from "react";

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  isCancelled: boolean;
  class: {
    name: string;
  };
}

interface Class {
  id: string;
  name: string;
}

export default function SchedulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, classesRes] = await Promise.all([
          fetch("/api/teacher/schedules"),
          fetch("/api/teacher/classes"),
        ]);

        if (!schedulesRes.ok || !classesRes.ok) throw new Error("Failed to fetch");

        const schedulesData = await schedulesRes.json();
        const classesData = await classesRes.json();

        setSchedules(schedulesData.data || []);
        setClasses(classesData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error al cargar horarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/teacher/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create schedule");

      const data = await res.json();
      setSchedules([...schedules, data.data]);
      setFormData({ classId: "", startTime: "", endTime: "" });
      setShowForm(false);
      alert("Horario creado exitosamente");
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert("Error al crear el horario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Horarios de Clases</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancelar" : "Crear Horario"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="font-semibold mb-4">Nuevo Horario</h2>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha y Hora de Inicio
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha y Hora de Fin
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? "Creando..." : "Crear Horario"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Cargando...</div>
      ) : schedules.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay horarios programados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules
            .filter((s) => !s.isCancelled)
            .sort(
              (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
            )
            .map((schedule) => (
              <div key={schedule.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {schedule.class.name}
                    </h3>
                    <div className="text-gray-600 text-sm mt-2">
                      <p>
                        Inicio:{" "}
                        {new Date(schedule.startTime).toLocaleString()}
                      </p>
                      <p>
                        Fin: {new Date(schedule.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
