"use client";

import { useEffect, useState } from "react";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  numClasses: number;
  validityDays: number;
  class: {
    name: string;
  };
}

interface Class {
  id: string;
  name: string;
}

export default function PaymentPlansList() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: "",
    name: "",
    numClasses: "",
    price: "",
    validityDays: "90",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, classesRes] = await Promise.all([
          fetch("/api/teacher/payment-plans"),
          fetch("/api/teacher/classes"),
        ]);

        if (!plansRes.ok || !classesRes.ok) throw new Error("Failed to fetch");

        const plansData = await plansRes.json();
        const classesData = await classesRes.json();

        setPlans(plansData.data || []);
        setClasses(classesData.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Error al cargar planes");
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
      const res = await fetch("/api/teacher/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          numClasses: parseInt(formData.numClasses),
          price: parseFloat(formData.price),
          validityDays: parseInt(formData.validityDays),
        }),
      });

      if (!res.ok) throw new Error("Failed to create plan");

      const data = await res.json();
      setPlans([...plans, data.data]);
      setFormData({
        classId: "",
        name: "",
        numClasses: "",
        price: "",
        validityDays: "90",
      });
      setShowForm(false);
      alert("Plan de pago creado exitosamente");
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Error al crear el plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Planes de Pago</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Cancelar" : "Crear Plan"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8">
          <h2 className="font-semibold mb-4">Nuevo Plan de Pago</h2>

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
                Nombre del Plan
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: 5 clases"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded input-field"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cantidad de Clases
                </label>
                <input
                  type="number"
                  value={formData.numClasses}
                  onChange={(e) =>
                    setFormData({ ...formData, numClasses: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Validez (días)
                </label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData({ ...formData, validityDays: e.target.value })
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
              {submitting ? "Creando..." : "Crear Plan"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Cargando...</div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay planes creados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="card">
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className="text-gray-600 text-sm">{plan.class.name}</p>

              <div className="space-y-2 my-4 border-y py-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clases</span>
                  <span className="font-semibold">{plan.numClasses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio</span>
                  <span className="font-semibold">${plan.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Validez</span>
                  <span className="font-semibold">{plan.validityDays} días</span>
                </div>
              </div>

              <p className="text-sm text-green-600 font-medium">
                ${(plan.price / plan.numClasses).toFixed(2)} por clase
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
