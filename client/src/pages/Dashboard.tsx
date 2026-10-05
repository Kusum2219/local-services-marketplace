import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;

  // Cancelled bookings can have slot = null
  slot: {
    id: string;
    startTime: string;
    endTime: string;

    service: {
      id: string;
      title: string;
      price: string;

      vendor: {
        id: string;
        businessName: string;
        location: string | null;
      };
    };
  } | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;

  category: {
    name: string;
  };

  vendor: {
    businessName: string;
    isVerified: boolean;
  };
}

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // First check logged-in user
        const userResponse = await axios.get(
          `${API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );

        const currentUser = userResponse.data.user;

        setUser(currentUser);

        // Vendor should never stay on customer dashboard
        if (currentUser.role === "VENDOR") {
          navigate("/vendor-dashboard", {
            replace: true,
          });
          return;
        }

        // Load customer data
        const [bookingsResponse, servicesResponse] =
          await Promise.all([
            axios.get(`${API_URL}/bookings/my`, {
              withCredentials: true,
            }),

            axios.get(`${API_URL}/services`),
          ]);

        setBookings(
          bookingsResponse.data.bookings || []
        );

        setServices(
          servicesResponse.data.services || []
        );
      } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyles = (
    status: Booking["status"]
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await axios.patch(
      `${API_URL}/bookings/${bookingId}/cancel`,
      {},
      {
        withCredentials: true,
      }
    );

    // Refresh bookings after successful cancellation
    const response = await axios.get(
      `${API_URL}/bookings/my`,
      {
        withCredentials: true,
      }
    );

    setBookings(response.data.bookings || []);
  } catch (error: any) {
    console.error("Cancel booking error:", error);

    window.alert(
      error.response?.data?.message ||
        "Unable to cancel this booking."
    );
  }
};

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "PENDING" ||
      booking.status === "CONFIRMED"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-5 w-96 animate-pulse rounded bg-slate-100" />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Customer dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage your bookings and discover services near you.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex w-fit items-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-600"
          >
            Browse services
          </Link>
        </div>

        {/* Stats */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Upcoming bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {upcomingBookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Pending or confirmed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed services
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {completedBookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Successfully completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {bookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Across LocalFix
            </p>
          </div>

        </div>

        {/* Bookings */}

        <section className="mt-10">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Your bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the status of your service requests.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-6 w-6 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No bookings yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Find a service and make your first booking.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white hover:bg-blue-600"
              >
                Explore services
              </Link>

            </div>
          ) : (
            <div className="mt-5 space-y-4">

              {bookings.map((booking) => {

                /*
                 * Cancelled bookings can have slot = null
                 * because the backend releases the slot
                 * when a booking is cancelled.
                 */
                if (!booking.slot) {
                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                            C
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-950">
                                Cancelled booking
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyles(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              This booking was cancelled and the service slot has been released.
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              Booking ID: {booking.id}
                            </p>
                          </div>
                        </div>

                      </div>

                      <div className="mt-4 rounded-lg bg-red-50 px-4 py-3">
                        <p className="text-xs font-medium text-red-700">
                          This booking was cancelled.
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                      {/* Service */}

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold !text-white">
                          {booking.slot.service.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-slate-950">
                              {booking.slot.service.title}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyles(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>

                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {booking.slot.service.vendor.businessName}
                          </p>

                          {booking.slot.service.vendor.location && (
                            <p className="mt-1 text-xs text-slate-400">
                              {booking.slot.service.vendor.location}
                            </p>
                          )}

                          <p className="mt-2 text-sm font-medium text-slate-700">
                            {formatDate(
                              booking.slot.startTime
                            )}
                            {" · "}
                            {formatTime(
                              booking.slot.startTime
                            )}
                            {" – "}
                            {formatTime(
                              booking.slot.endTime
                            )}
                          </p>

                        </div>
                      </div>

                      {/* Price */}

                      <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">

                        <div>
  <p className="text-xs text-slate-500">
    Service price
  </p>

  <p className="mt-1 text-lg font-bold text-slate-950">
    ₹
    {Number(
      booking.slot.service.price
    ).toLocaleString("en-IN")}
  </p>
</div>

<div className="flex items-center gap-2">
  <Link
    to={`/services/${booking.slot.service.id}`}
    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
  >
    View service
  </Link>

  {(booking.status === "PENDING" ||
    booking.status === "CONFIRMED") && (
    <button
      type="button"
      onClick={() =>
        handleCancelBooking(booking.id)
      }
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
    >
      Cancel
    </button>
  )}
</div>

                      </div>

                    </div>

                    {/* Status */}

                    {booking.status === "PENDING" && (
                      <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3">
                        <p className="text-xs font-medium text-amber-700">
                          Your booking request has been sent to the provider and is waiting for confirmation.
                        </p>
                      </div>
                    )}

                    {booking.status === "CONFIRMED" && (
                      <div className="mt-4 rounded-lg bg-green-50 px-4 py-3">
                        <p className="text-xs font-medium text-green-700">
                          Your booking has been confirmed by the service provider.
                        </p>
                      </div>
                    )}

                    {booking.status === "COMPLETED" && (
                      <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">
                        <p className="text-xs font-medium text-blue-700">
                          This service has been completed.
                        </p>
                      </div>
                    )}

                    {booking.status === "CANCELLED" && (
                      <div className="mt-4 rounded-lg bg-red-50 px-4 py-3">
                        <p className="text-xs font-medium text-red-700">
                          This booking was cancelled.
                        </p>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* Recommended services */}

        <section className="mt-12">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Discover more services
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find trusted professionals for your next task.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {services.slice(0, 3).map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between gap-4">

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {service.category.name}
                  </span>

                  {service.vendor.isVerified && (
                    <span className="text-xs font-semibold text-green-600">
                      Verified
                    </span>
                  )}

                </div>

                <h3 className="mt-4 font-semibold text-slate-950 group-hover:text-blue-600">
                  {service.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-sm text-slate-500">
                    {service.vendor.businessName}
                  </span>

                  <span className="font-bold text-slate-950">
                    ₹
                    {Number(
                      service.price
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

              </Link>
            ))}

          </div>
        </section>

      </div>
    </main>
  );
}

export default Dashboard;