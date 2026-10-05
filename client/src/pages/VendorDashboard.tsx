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

interface VendorBooking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;

  user: {
    id: string;
    name: string;
    email: string;
  };

  slot: {
    id: string;
    startTime: string;
    endTime: string;

    service: {
      id: string;
      title: string;
      price: string;

      category: {
        name: string;
      };
    };
  };
}

function VendorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const userResponse = await axios.get(
          `${API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );

        const currentUser = userResponse.data.user;

        if (currentUser.role !== "VENDOR") {
          navigate("/dashboard", { replace: true });
          return;
        }

        setUser(currentUser);

        const bookingsResponse = await axios.get(
          `${API_URL}/bookings/vendor`,
          {
            withCredentials: true,
          }
        );

        setBookings(bookingsResponse.data.bookings || []);
      } catch (error: any) {
        console.error("Vendor dashboard error:", error);

        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load vendor dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

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

  const confirmBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      setError("");

      await axios.patch(
        `${API_URL}/bookings/${bookingId}/confirm`,
        {},
        {
          withCredentials: true,
        }
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CONFIRMED",
              }
            : booking
        )
      );
    } catch (error: any) {
      console.error("Confirm booking error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to confirm this booking."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);
      setError("");

      await axios.patch(
        `${API_URL}/bookings/${bookingId}/complete`,
        {},
        {
          withCredentials: true,
        }
      );

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "COMPLETED",
              }
            : booking
        )
      );
    } catch (error: any) {
      console.error("Complete booking error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to complete this booking."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING"
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />

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

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Vendor dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Welcome back, {user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Manage customer bookings and your service requests.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex w-fit rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse marketplace
          </Link>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Stats */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending requests
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {pendingBookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Need your attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Confirmed bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {confirmedBookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Upcoming services
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {completedBookings.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Successfully delivered
            </p>
          </div>

        </div>

        {/* Pending bookings */}

        <section className="mt-10">

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Booking requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and confirm customer service requests.
            </p>
          </div>

          {pendingBookings.length === 0 ? (
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
                No pending requests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                New customer bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">

              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row">

                    {/* Customer + service */}

                    <div className="flex min-w-0 gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold !text-white">
                        {booking.user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950">
                            {booking.slot.service.title}
                          </h3>

                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            PENDING
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          Customer:{" "}
                          <span className="font-medium text-slate-700">
                            {booking.user.name}
                          </span>
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {booking.user.email}
                        </p>

                      </div>
                    </div>

                    {/* Booking info */}

                    <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[500px]">

                      <div>
                        <p className="text-xs text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {booking.slot.service.category.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Appointment
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {formatDate(
                            booking.slot.startTime
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatTime(
                            booking.slot.startTime
                          )}
                          {" – "}
                          {formatTime(
                            booking.slot.endTime
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Service price
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-950">
                          ₹
                          {Number(
                            booking.slot.service.price
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Actions */}

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                    <Link
                      to={`/services/${booking.slot.service.id}`}
                      className="rounded-lg border border-slate-200 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View service
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        confirmBooking(booking.id)
                      }
                      disabled={
                        actionLoading === booking.id
                      }
                      className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading === booking.id
                        ? "Confirming..."
                        : "Confirm booking"}
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}
        </section>

        {/* Confirmed bookings */}

        {confirmedBookings.length > 0 && (
          <section className="mt-12">

            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Upcoming confirmed bookings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Services that are ready to be delivered.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {confirmedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {booking.slot.service.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Customer: {booking.user.name}
                      </p>
                    </div>

                    <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                      CONFIRMED
                    </span>

                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(
                        booking.slot.startTime
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatTime(
                        booking.slot.startTime
                      )}
                      {" – "}
                      {formatTime(
                        booking.slot.endTime
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      completeBooking(booking.id)
                    }
                    disabled={
                      actionLoading === booking.id
                    }
                    className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading === booking.id
                      ? "Updating..."
                      : "Mark as completed"}
                  </button>
                </div>
              ))}

            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default VendorDashboard;