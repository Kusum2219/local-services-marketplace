import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getServiceById,
  type Service,
} from "../services/services";

const ServiceDetails = () => {
  const { serviceId } = useParams<{ serviceId: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setError("Service not found.");
        setLoading(false);
        return;
      }

      try {
        const data = await getServiceById(serviceId);
        setService(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load service details.");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-slate-500">Loading service...</p>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Service unavailable
          </h1>

          <p className="mt-2 text-slate-500">
            {error || "This service could not be found."}
          </p>

          <Link
            to="/services"
            className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-slate-500">
          <Link to="/services" className="hover:text-slate-900">
            Services
          </Link>

          <span className="mx-2">/</span>

          <span>{service.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          {/* Main service information */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

            <div className="h-72 overflow-hidden bg-slate-200 sm:h-96">
              <img
                src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=85"
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8">

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {service.category.name}
                </span>

                {service.vendor.isVerified && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    Verified Professional
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {service.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                {service.description}
              </p>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-lg font-semibold text-slate-900">
                  About the provider
                </h2>

                <div className="mt-4 rounded-xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">
                    {service.vendor.businessName}
                  </p>

                  {service.vendor.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {service.vendor.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                    {service.vendor.location && (
                      <span>
                        Location: {service.vendor.location}
                      </span>
                    )}

                    {service.vendor.phone && (
                      <span>
                        Contact: {service.vendor.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Booking card */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

            <p className="text-sm text-slate-500">
              Starting from
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-950">
              ₹{service.price}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Select an available time slot to book this service.
            </p>

            <Link
  to={`/services/${service.id}/book`}
  className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold !text-white transition hover:bg-blue-600"
>
  View available slots
</Link>
            <Link
  to="/services"
  className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold !text-slate-700 transition hover:bg-slate-50"
>
  Back to services
</Link>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-xs leading-5 text-slate-500">
                Your booking is secured at the database level so the same
                appointment slot cannot be booked by two customers.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ServiceDetails;