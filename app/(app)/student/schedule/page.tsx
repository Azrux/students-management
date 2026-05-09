"use client";

import { useEffect, useState } from "react";

interface FreeSlot {
  id: string;
  startTime: string;
  endTime: string;
  spotsAvailable: number;
  totalSpots: number;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function StudentSchedule() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [slots, setSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/teacher/classes");
        if (!res.ok) throw new Error("Failed to fetch classes");

        const data = await res.json();
        const classList = data.data || [];
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClassId(classList[0].id);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/student/classes/${selectedClassId}/free-slots`);
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        setSlots(data.data || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
        alert("Error al cargar horarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedClassId]);

  const handleEnroll = async (scheduleId: string) => {
    setEnrolling(scheduleId);

    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          scheduleId,
        }),
      });

      if (!res.ok) throw new Error("Failed to enroll");

      alert("Inscripción exitosa");

      try {
        setLoading(true);
        const slotsRes = await fetch(
          `/api/student/classes/${selectedClassId}/free-slots`
        );
        if (slotsRes.ok) {
          const data = await slotsRes.json();
          setSlots(data.data || []);
        }
      } catch (err) {
        console.error("Error refetching slots:", err);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      alert("Error al inscribirse");
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Horarios Disponibles</h1>

      {classes.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay clases disponibles</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Seleccionar Clase</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded input-field"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div>Cargando horarios...</div>
          ) : slots.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600">No hay horarios disponibles para esta clase</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div key={slot.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Inicio</p>
                      <p className="font-semibold">
                        {new Date(slot.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">Fin</p>
                    <p className="font-semibold">
                      {new Date(slot.endTime).toLocaleString()}
                    </p>
                  </div>

                  <div className="mb-4 py-3 border-t border-b">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Espacios disponibles</span>
                      <span className="font-bold text-lg text-green-600">
                        {slot.spotsAvailable}/{slot.totalSpots}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnroll(slot.id)}
                    disabled={enrolling === slot.id || slot.spotsAvailable === 0}
                    className="btn-primary w-full"
                  >
                    {enrolling === slot.id
                      ? "Inscribiendo..."
                      : slot.spotsAvailable === 0
                      ? "Sin espacios"
                      : "Inscribirse"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
