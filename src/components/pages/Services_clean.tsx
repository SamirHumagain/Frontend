import { useEffect, useState } from "react";
import { getServiceList } from "../Api/getapi";

export function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getServiceList()
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load services");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading services...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Services</h1>
        <ul className="space-y-6">
          {services.map((service) => (
            <li key={service.id} className="bg-gray-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p className="text-gray-700 mb-2">{service.description}</p>
              <div className="text-primary-700 font-bold mb-1">
                ${service.price}
              </div>
              {service.venue && (
                <div className="text-sm text-gray-500">
                  Venue: {service.venue}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
