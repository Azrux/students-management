"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  email: string;
  slug: string;
  createdAt: string;
}

export default function TenantsList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await fetch("/api/admin/tenants");
        if (!res.ok) throw new Error("Failed to fetch tenants");

        const data = await res.json();
        setTenants(data || []);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        alert("Error al cargar tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Tenants</h1>

      {loading ? (
        <div>Cargando...</div>
      ) : tenants.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-600">No hay tenants registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Slug</th>
                <th className="text-left py-3 px-4">Creado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{tenant.name}</td>
                  <td className="py-3 px-4 text-sm">{tenant.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{tenant.slug}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Link
                      href={`/admin/tenants/${tenant.id}/branding`}
                      className="text-blue-600 hover:underline mr-4"
                    >
                      Branding
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
