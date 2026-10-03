import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getServiceById,
  getServiceSlots,
  createBooking,
  type AvailabilitySlot,
  type Service,
} from "../services/services";

function Booking() {
  const { serviceId } = useParams<{
    serviceId: string;
  }>();

  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<AvailabilitySlot | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!serviceId) {
        setError("Service not found.");
        setLoading(false);
        return;
      }

      try {
        const [serviceData, slotsData] = await Promise.all([
          getServiceById(serviceId),
          getServiceSlots(serviceId),
        ]);

        setService(serviceData);
        setSlots(slotsData);
      } catch (err) {
        console.error(err);

        setError("Unable to load booking information.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
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
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");

      await createBooking(selectedSlot.id);

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Booking error:", error);

      if (error.response?.status === 401) {
        setBookingError(
          "Please login before booking a service."
        );
        return;
      }

      if (error.response?.status === 403) {
        setBookingError(
          "Only customer accounts can create bookings."
        );
        return;
      }

      if (error.response?.status === 409) {
        setBookingError(
          "This slot has already been booked. Please select another slot."
        );

        setSlots((currentSlots) =>
          currentSlots.filter(
            (slot) => slot.id !== selectedSlot.id
          )
        );

        setSelectedSlot(null);

        return;
      }

      setBookingError(
        error.response?.data?.message ||
          "Unable to create booking. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <p className="text-slate-500">
          Loading available slots...
        </p>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Unable to book this service
          </h1>

          <p className="mt-2 text-slate-500">
            {error}
          </p>

          <Link
            to="/services"
            className="mt-6 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white"
          >
            Back to services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">

        {/* Breadcrumb */}

        <div className="mb-8 text-sm text-slate-500">
          <Link
            to={`/services/${service.id}`}
            className="hover:text-slate-900"
          >
            {service.title}
          </Link>

          <span className="mx-2">
            /
          </span>

          <span>
            Book
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Available Slots */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Choose a time
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Select an available slot
              </h1>

              <p className="mt-3 text-slate-600">
                Choose a convenient appointment time for{" "}
                <span className="font-medium text-slate-900">
                  {service.title}
                </span>
                .
              </p>
            </div>

            {slots.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <h2 className="font-semibold text-slate-900">
                  No available slots
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  This service currently has no upcoming availability.
                </p>

              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">

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
                      className={`rounded-xl border p-5 text-left transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm"
                      }`}
                    >

                      <p className="text-sm font-semibold text-slate-900">
                        {formatDate(slot.startTime)}
                      </p>

                      <p className="mt-2 text-lg font-bold text-slate-950">
                        {formatTime(slot.startTime)}
                        {" – "}
                        {formatTime(slot.endTime)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {isSelected
                          ? "Selected"
                          : "Available"}
                      </p>

                    </button>
                  );
                })}

              </div>
            )}
          </section>

          {/* Booking Summary */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">

            <p className="text-sm text-slate-500">
              Booking summary
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {service.title}
            </h2>

            <div className="mt-5 border-t border-slate-200 pt-5">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Service price
                </span>

                <span className="font-semibold text-slate-900">
                  ₹{service.price}
                </span>

              </div>

              {selectedSlot && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Selected time
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(
                      selectedSlot.startTime
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {formatTime(
                      selectedSlot.startTime
                    )}
                    {" – "}
                    {formatTime(
                      selectedSlot.endTime
                    )}
                  </p>

                </div>
              )}

              <button
                type="button"
                disabled={
                  !selectedSlot || bookingLoading
                }
                onClick={handleBooking}
                className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:!text-slate-500"
              >
                {bookingLoading
                  ? "Confirming..."
                  : "Confirm Booking"}
              </button>

              {bookingError && (
                <p className="mt-3 text-center text-sm text-red-600">
                  {bookingError}
                </p>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                Your selected slot will be reserved once the
                booking is successfully confirmed.
              </p>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}

export default Booking;