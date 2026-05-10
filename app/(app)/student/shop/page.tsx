"use client";

import { useEffect, useState, useCallback } from "react";

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

export default function StudentShop() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/teacher/payment-plans");
        if (!res.ok) throw new Error("Failed to fetch plans");

        const data = await res.json();
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
        alert("Error al cargar planes");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl]);

  const handleCheckout = useCallback(async (planId: string) => {
    setCheckingOut(planId);

    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const data = await res.json();

      if (data?.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
      alert("Error al procesar el pago");
      setCheckingOut(null);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Comprar Clases</h1>

      {loading ? (
        <div>Cargando planes disponibles...</div>
      ) : plans.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No hay planes disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card flex flex-col">
              <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.class.name}</p>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clases</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {plan.numClasses}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Validez</span>
                  <span className="font-semibold">{plan.validityDays} días</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-b">
                  <span className="text-gray-600">Por clase</span>
                  <span className="font-semibold">
                    ${(plan.price / plan.numClasses).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  ${plan.price.toFixed(2)}
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={checkingOut === plan.id}
                  className="btn-primary w-full"
                >
                  {checkingOut === plan.id
                    ? "Procesando..."
                    : "Comprar Ahora"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
