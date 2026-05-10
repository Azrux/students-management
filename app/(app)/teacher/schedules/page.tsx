"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

interface Schedule {
  id: string;
  isRecurring: boolean;
  daysOfWeek: number[];
  timeStart: string;
  timeEnd: string;
  specificDate?: string;
  isCancelled: boolean;
  class: { name: string };
}

interface Class {
  id: string;
  name: string;
}

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const scheduleSchema = z
  .object({
    classId: z.string().min(1, "Seleccioná una clase"),
    isRecurring: z.boolean(),
    daysOfWeek: z.array(z.number()),
    timeStart: z.string().regex(timeRegex, "Formato inválido — usá HH:MM (ej: 14:30)"),
    timeEnd: z.string().regex(timeRegex, "Formato inválido — usá HH:MM (ej: 20:00)"),
    specificDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && data.daysOfWeek.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccioná al menos un día",
        path: ["daysOfWeek"],
      });
    }
    if (!data.isRecurring && !data.specificDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Seleccioná una fecha",
        path: ["specificDate"],
      });
    }
    if (data.timeStart && data.timeEnd && timeRegex.test(data.timeStart) && timeRegex.test(data.timeEnd)) {
      if (data.timeStart >= data.timeEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de fin debe ser mayor a la hora de inicio",
          path: ["timeEnd"],
        });
      }
    }
  });

type FormErrors = Partial<Record<string, string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
}

function formatSchedule(s: Schedule): string {
  if (s.isRecurring) {
    const days = [...s.daysOfWeek].sort().map((d) => DAY_FULL[d]).join(", ");
    return `${days} · ${s.timeStart} - ${s.timeEnd}`;
  }
  const date = s.specificDate
    ? new Date(s.specificDate).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";
  return `${date} · ${s.timeStart} - ${s.timeEnd}`;
}

export default function SchedulesList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [formData, setFormData] = useState({
    classId: "",
    daysOfWeek: [] as number[],
    timeStart: "",
    timeEnd: "",
    specificDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
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

        setSchedules(schedulesData || []);
        setClasses(classesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error al cargar horarios");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
    setErrors((prev) => ({ ...prev, daysOfWeek: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = scheduleSchema.safeParse({ ...formData, isRecurring });

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
      const res = await fetch("/api/teacher/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: formData.classId,
          isRecurring,
          daysOfWeek: isRecurring ? formData.daysOfWeek : [],
          timeStart: formData.timeStart,
          timeEnd: formData.timeEnd,
          specificDate: !isRecurring ? formData.specificDate : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create schedule");
      }

      const data = await res.json();
      setSchedules([...schedules, data]);
      setFormData({ classId: "", daysOfWeek: [], timeStart: "", timeEnd: "", specificDate: "" });
      setShowForm(false);
      alert("Horario creado exitosamente");
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(err instanceof Error ? err.message : "Error al crear el horario");
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
        <h1 className="text-3xl font-bold">Horarios de Clases</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrors({});
          }}
          className="btn-primary"
        >
          {showForm ? "Cancelar" : "Crear Horario"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="font-semibold mb-4">Nuevo Horario</h2>

          <div className="space-y-5">
            {/* Class selector */}
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

            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de horario</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecurring(true);
                    setErrors({});
                  }}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                    isRecurring
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Recurrente (semanal)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecurring(false);
                    setErrors({});
                  }}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                    !isRecurring
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Fecha específica
                </button>
              </div>
            </div>

            {/* Days of week (recurring only) */}
            {isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-2">Días de la semana</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-12 h-12 rounded-full border-2 text-sm font-semibold transition ${
                        formData.daysOfWeek.includes(day)
                          ? "border-blue-500 bg-blue-500 text-white"
                          : errors.daysOfWeek
                          ? "border-red-400 text-gray-600 hover:border-red-500"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.daysOfWeek} />
              </div>
            )}

            {/* Specific date (one-off only) */}
            {!isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  value={formData.specificDate}
                  onChange={(e) => {
                    setFormData({ ...formData, specificDate: e.target.value });
                    setErrors((p) => ({ ...p, specificDate: undefined }));
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputClass("specificDate")}
                />
                <FieldError msg={errors.specificDate} />
              </div>
            )}

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hora de inicio</label>
                <input
                  type="time"
                  value={formData.timeStart}
                  onChange={(e) => {
                    setFormData({ ...formData, timeStart: e.target.value });
                    setErrors((p) => ({ ...p, timeStart: undefined, timeEnd: undefined }));
                  }}
                  className={inputClass("timeStart")}
                />
                <p className="text-gray-400 text-xs mt-1">Formato 24 horas (ej: 14:00)</p>
                <FieldError msg={errors.timeStart} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hora de fin</label>
                <input
                  type="time"
                  value={formData.timeEnd}
                  onChange={(e) => {
                    setFormData({ ...formData, timeEnd: e.target.value });
                    setErrors((p) => ({ ...p, timeEnd: undefined }));
                  }}
                  className={inputClass("timeEnd")}
                />
                <p className="text-gray-400 text-xs mt-1">Formato 24 horas (ej: 20:00)</p>
                <FieldError msg={errors.timeEnd} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
          {schedules.map((schedule) => (
            <div key={schedule.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{schedule.class.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        schedule.isRecurring
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {schedule.isRecurring ? "Recurrente" : "Fecha específica"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{formatSchedule(schedule)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
