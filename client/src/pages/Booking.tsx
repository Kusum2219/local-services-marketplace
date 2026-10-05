import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createBooking,
  getServiceById,
  getServiceSlots,
  type AvailabilitySlot,
  type Service,
} from "../services/services";

function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<AvailabilitySlot | null>(null);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!serviceId) {
      setError("Service not found.");
      setLoading(false);
      return;
    }

    const loadBookingData = async () => {
      try {
        setLoading(true);
        setError("");

        const [serviceData, slotData] = await Promise.all([
          getServiceById(serviceId),
          getServiceSlots(serviceId),
        ]);

        setService(serviceData);
        setSlots(slotData);
      } catch (error) {
        console.error("Booking data error:", error);
        setError("Unable to load booking information.");
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [serviceId]);

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

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      await createBooking(selectedSlot.id);

      setSuccess("Booking created successfully.");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error: any) {
      console.error("Booking error:", error);

      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }

      if (error.response?.status === 409) {
        setError(
          "This slot has just been booked by someone else. Please choose another slot."
        );

        if (serviceId) {
          const updatedSlots = await getServiceSlots(serviceId);
          setSlots(updatedSlots);
        }

        setSelectedSlot(null);
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to create booking. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-5 w-96 animate-pulse rounded bg-slate-100" />

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            </div>

            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            Service unavailable
          </h1>

          <p className="mt-3 text-slate-600">
            We couldn't load this service.
          </p>

          <button
            type="button"
            onClick={() => navigate("/services")}
            className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white hover:bg-blue-600"
          >
            Browse Services
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Breadcrumb */}

        <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="hover:text-slate-900"
          >
            Services
          </button>

          <span>/</span>

          <button
            type="button"
            onClick={() =>
              navigate(`/services/${service.id}`)
            }
            className="max-w-[220px] truncate hover:text-slate-900"
          >
            {service.title}
          </button>

          <span>/</span>

          <span className="text-slate-900">
            Book
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* LEFT */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Choose a time
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Book {service.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Select an available time slot that works for you.
                Your booking will be sent to the service provider
                for confirmation.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm font-medium text-green-700">
                  {success}
                </p>
              </div>
            )}

            {/* Slots */}

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">
                  Available slots
                </h2>

                <span className="text-sm text-slate-500">
                  {slots.length}{" "}
                  {slots.length === 1 ? "slot" : "slots"}
                </span>
              </div>

              {slots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    No slots available
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    This service currently has no available
                    booking slots.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.id === slot.id;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() =>
                          setSelectedSlot(slot)
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isSelected
                                  ? "text-blue-700"
                                  : "text-slate-900"
                              }`}
                            >
                              {formatDate(slot.startTime)}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {formatTime(slot.startTime)}
                              {" – "}
                              {formatTime(slot.endTime)}
                            </p>
                          </div>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-blue-600 bg-blue-600"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3 !text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Booking protection */}

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3l7 4v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V7l7-4z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Secure booking
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The selected slot is checked again when you
                    book. If another customer books it first,
                    your booking will not be created.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT — SUMMARY */}

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Booking summary
                </p>

                <h2 className="mt-2 text-lg font-bold text-slate-950">
                  {service.title}
                </h2>
              </div>

              <div className="space-y-5 p-6">

                {/* Provider */}

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Service provider
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold !text-white">
                      {service.vendor.businessName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {service.vendor.businessName}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        {service.vendor.isVerified && (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                            <span className="text-xs text-slate-500">
                              Verified provider
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected slot */}

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-medium text-slate-500">
                    Selected time
                  </p>

                  {selectedSlot ? (
                    <div className="mt-2 rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDate(selectedSlot.startTime)}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatTime(selectedSlot.startTime)}
                        {" – "}
                        {formatTime(selectedSlot.endTime)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      No time slot selected
                    </p>
                  )}
                </div>

                {/* Price */}

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      Service price
                    </span>

                    <span className="text-lg font-bold text-slate-950">
                      ₹{Number(service.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* CTA */}

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={!selectedSlot || booking}
                  className="w-full rounded-lg bg-slate-950 px-5 py-3.5 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {booking
                    ? "Confirming booking..."
                    : "Confirm booking"}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  Your booking will initially be marked as
                  pending until the provider confirms it.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Booking;