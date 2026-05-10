"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  numClasses: number;
  validityDays: number;
  class: { name: string };
}

interface Class {
  id: string;
  name: string;
}

const planSchema = z.object({
  classId: z.string().min(1, "Seleccioná una clase"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  numClasses: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "El plan debe incluir al menos 1 clase")
    .max(200, "El máximo es 200 clases por plan"),
  price: z
    .number()
    .positive("El precio debe ser mayor a 0")
    .max(999999, "El precio ingresado es demasiado alto"),
  validityDays: z
    .number()
    .int("Debe ser un número entero")
    .min(1, "La validez mínima es 1 día")
    .max(365, "La validez máxima es 365 días"),
});

type FormErrors = Partial<Record<string, string>>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
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
  const [errors, setErrors] = useState<FormErrors>({});
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

        setPlans(plansData || []);
        setClasses(classesData || []);
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

    const parsed = planSchema.safeParse({
      classId: formData.classId,
      name: formData.name,
      numClasses: parseInt(formData.numClasses),
      price: parseFloat(formData.price),
      validityDays: parseInt(formData.validityDays),
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
      const res = await fetch("/api/teacher/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("Failed to create plan");

      const data = await res.json();
      setPlans([...plans, data]);
      setFormData({ classId: "", name: "", numClasses: "", price: "", validityDays: "90" });
      setShowForm(false);
      alert("Plan de pago creado exitosamente");
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Error al crear el plan");
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
        <h1 className="text-3xl font-bold">Planes de Pago</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setErrors({});
          }}
          className="btn-primary"
        >
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
                Nombre del Plan
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Ej: 5 clases"
                className={inputClass("name")}
              />
              <FieldError msg={errors.name} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cantidad de Clases
                </label>
                <input
                  type="number"
                  value={formData.numClasses}
                  onChange={(e) => {
                    setFormData({ ...formData, numClasses: e.target.value });
                    setErrors((p) => ({ ...p, numClasses: undefined }));
                  }}
                  min={1}
                  max={200}
                  placeholder="Ej: 5"
                  className={inputClass("numClasses")}
                />
                <FieldError msg={errors.numClasses} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    setErrors((p) => ({ ...p, price: undefined }));
                  }}
                  min={0.01}
                  placeholder="Ej: 5000"
                  className={inputClass("price")}
                />
                <FieldError msg={errors.price} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Validez (días)
                </label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) => {
                    setFormData({ ...formData, validityDays: e.target.value });
                    setErrors((p) => ({ ...p, validityDays: undefined }));
                  }}
                  min={1}
                  max={365}
                  className={inputClass("validityDays")}
                />
                <p className="text-gray-400 text-xs mt-1">Máximo 365 días</p>
                <FieldError msg={errors.validityDays} />
              </div>
            </div>

            {/* Live preview */}
            {formData.numClasses && formData.price && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
                Precio por clase:{" "}
                <span className="font-semibold text-gray-900">
                  ${(parseFloat(formData.price) / parseInt(formData.numClasses) || 0).toFixed(2)}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
