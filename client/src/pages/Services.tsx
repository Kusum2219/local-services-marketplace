import { useEffect, useState } from "react";
import { getServices, type Service } from "../services/services";
import { Link } from "react-router-dom";

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-slate-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          LocalFix Services
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Find the right service for you
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          Discover trusted local professionals for your everyday service needs.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            No services available
          </h2>

          <p className="mt-2 text-slate-500">
            Please check back later for available services.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80"
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {service.category.name}
                  </span>

                  {service.vendor.isVerified && (
                    <span className="text-xs font-medium text-green-600">
                      Verified
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  {service.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Starting from</p>

                    <p className="text-xl font-bold text-slate-900">
                      ₹{service.price}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">
                      {service.vendor.businessName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {service.vendor.location || "Location unavailable"}
                    </p>
                  </div>
                </div>

                <Link
  to={`/services/${service.id}`}
  className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold !text-white transition hover:bg-blue-600"
>
  View Service
</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Services;