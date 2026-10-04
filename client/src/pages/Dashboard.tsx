import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  status: string;
  createdAt: string;
  slot: {
    startTime: string;
    endTime: string;
    service: {
      id: string;
      title: string;
      price: string;
      vendor: {
        businessName: string;
      };
    };
  } | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  vendor: {
    businessName: string;
    location: string | null;
    isVerified: boolean;
  };
  category: {
    name: string;
  };
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [userResponse, bookingsResponse, servicesResponse] =
          await Promise.all([
            axios.get(`${API_URL}/auth/me`, {
              withCredentials: true,
            }),

            axios.get(`${API_URL}/bookings/my`, {
              withCredentials: true,
            }),

            axios.get(`${API_URL}/services`),
          ]);

        setUser(userResponse.data.user);
        setBookings(bookingsResponse.data.bookings);
        setServices(servicesResponse.data.services);
      } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.response?.status === 401) {
          setError("Please login to access your dashboard.");
        } else {
          setError("Unable to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-50 text-green-700 border-green-200";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="h-32 rounded-2xl bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-xl font-semibold text-red-800">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <Link
              to="/login"
              className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "PENDING" ||
      booking.status === "CONFIRMED"
  );

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Header */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Welcome, {user?.name}
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your bookings and discover local services.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex w-fit rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-600"
          >
            Browse Services
          </Link>
        </div>

        {/* Stats */}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Total Bookings
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Upcoming
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {upcomingBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Available Services
            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {services.length}
            </p>
          </div>

        </div>

        {/* Upcoming Bookings */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Your bookings
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Upcoming appointments
              </h2>
            </div>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                No upcoming bookings
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Find a service and book a convenient time slot.
              </p>

              <Link
                to="/services"
                className="mt-5 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white"
              >
                Find a Service
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  {booking.slot && (
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-950">
                            {booking.slot.service.title}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {booking.slot.service.vendor.businessName}
                        </p>

                        <p className="mt-3 text-sm font-medium text-slate-700">
                          {formatDate(booking.slot.startTime)}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatTime(booking.slot.startTime)}
                          {" – "}
                          {formatTime(booking.slot.endTime)}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm text-slate-500">
                          Service price
                        </p>

                        <p className="mt-1 text-xl font-semibold text-slate-950">
                          ₹{booking.slot.service.price}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services */}

        <section className="mt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Discover
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Available services
              </h2>
            </div>

            <Link
              to="/services"
              className="text-sm font-semibold text-slate-900 underline underline-offset-4"
            >
              View all services
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
              <p className="text-slate-500">
                No services are currently available.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {service.category.name}
                      </p>

                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {service.title}
                      </h3>
                    </div>

                    {service.vendor.isVerified && (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <p className="mt-4 text-sm text-slate-500">
                    {service.vendor.businessName}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-950">
                      ₹{service.price}
                    </span>

                    <Link
                      to={`/services/${service.id}`}
                      className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-600"
                    >
                      View Service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

export default Dashboard;