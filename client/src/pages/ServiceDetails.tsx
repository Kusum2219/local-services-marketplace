import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getServiceById,
  type Service,
} from "../services/services";

const serviceImages: Record<string, string> = {
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85",

  plumbing:
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1400&q=85",

  electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=85",

  tutoring:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85",

  repair:
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1400&q=85",

  default:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85",
};

const getServiceImage = (category: string) => {
  const categoryName = category.toLowerCase();

  const matchedKey = Object.keys(serviceImages).find((key) =>
    categoryName.includes(key)
  );

  return serviceImages[matchedKey || "default"];
};

function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) {
        setError("Service not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getServiceById(serviceId);

        setService(data);
      } catch (error) {
        console.error("Failed to load service:", error);
        setError(
          "We couldn't find this service. It may have been removed or is no longer available."
        );
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-[16/9] animate-pulse bg-slate-200" />

              <div className="space-y-4 p-7">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-8 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-8 h-12 w-full animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="M9.172 16.172 12 13.343l2.828 2.829M12 13.343l2.828-2.828M12 13.343 9.172 10.515M12 13.343l2.828 2.828"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-slate-950">
            Service unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            {error || "This service could not be found."}
          </p>

          <Link
            to="/services"
            className="mt-7 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
          >
            Browse services
          </Link>
        </div>
      </main>
    );
  }

  const image = getServiceImage(service.category.name);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">

      {/* Breadcrumb */}

      <div className="mx-auto max-w-7xl px-6 pt-7 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-slate-500">

          <Link
            to="/services"
            className="transition hover:text-slate-950"
          >
            Services
          </Link>

          <span>/</span>

          <span className="truncate text-slate-700">
            {service.title}
          </span>

        </div>
      </div>

      {/* Main Content */}

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_0.75fr]">

          {/* Left */}

          <div>

            {/* Image */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="relative aspect-[16/9] overflow-hidden">

                <img
                  src={image}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-5 top-5">

                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    {service.category.name}
                  </span>

                </div>

              </div>

              {/* Description */}

              <div className="p-7 lg:p-8">

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Professional service
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                      {service.title}
                    </h1>

                  </div>

                  {service.vendor.isVerified && (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">

                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[9px] !text-white">
                        ✓
                      </span>

                      Verified provider

                    </span>
                  )}

                </div>

                <div className="mt-7 border-t border-slate-100 pt-7">

                  <h2 className="text-lg font-semibold text-slate-950">
                    About this service
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>

                </div>

              </div>
            </div>

            {/* Provider */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7">

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Service provider
              </p>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold !text-white">
                    {service.vendor.businessName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-lg font-semibold text-slate-950">
                        {service.vendor.businessName}
                      </h2>

                      {service.vendor.isVerified && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Verified
                        </span>
                      )}

                    </div>

                    {service.vendor.location && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">

                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.7"
                            d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"
                          />

                          <circle
                            cx="12"
                            cy="9"
                            r="2.2"
                            strokeWidth="1.7"
                          />
                        </svg>

                        {service.vendor.location}

                      </div>
                    )}

                  </div>

                </div>

                <Link
                  to={`/vendor/${service.vendor.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View provider
                </Link>

              </div>

              {service.vendor.description && (
                <p className="mt-6 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">
                  {service.vendor.description}
                </p>
              )}

            </div>

            {/* Service Highlights */}

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                  <svg
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>

                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-950">
                  Flexible slots
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Choose from available appointment times.
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                  <svg
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M9 12.75 11 15l4-5m5 2a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                    />
                  </svg>

                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-950">
                  Verified provider
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {service.vendor.isVerified
                    ? "Provider verification is complete."
                    : "Provider information is available."}
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                  <svg
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3S7 5.8 7 7.5s2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"
                    />
                  </svg>

                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-950">
                  Transparent pricing
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Starting price shown before booking.
                </p>

              </div>

            </div>

          </div>

          {/* Right Booking Card */}

          <aside className="lg:sticky lg:top-24">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Service price
              </p>

              <div className="mt-2 flex items-end gap-2">

                <span className="text-3xl font-bold tracking-[-0.03em] text-slate-950">
                  ₹
                  {Number(service.price).toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="pb-1 text-sm text-slate-500">
                  starting price
                </span>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Select an available time slot before confirming your booking.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(`/services/${service.id}/book`)
                }
                className="mt-7 flex w-full items-center justify-center rounded-lg bg-slate-950 px-5 py-3.5 text-sm font-semibold !text-white transition hover:bg-blue-600"
              >
                Check availability
              </button>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Category
                  </span>

                  <span className="font-medium text-slate-800">
                    {service.category.name}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Provider
                  </span>

                  <span className="max-w-[170px] truncate font-medium text-slate-800">
                    {service.vendor.businessName}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Status
                  </span>

                  <span className="font-medium text-emerald-600">
                    Available
                  </span>

                </div>

              </div>

            </div>

            {/* Safety note */}

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                  <svg
                    className="h-4 w-4 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M12 3 5 6v5c0 4.5 2.9 8.2 7 10 4.1-1.8 7-5.5 7-10V6l-7-3Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="m9.5 12 1.7 1.7 3.5-3.7"
                    />
                  </svg>

                </div>

                <div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    Book with confidence
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your selected slot is checked by the booking system before
                    confirmation to prevent double bookings.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default ServiceDetails;