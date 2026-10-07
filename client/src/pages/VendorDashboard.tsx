import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

interface VendorService {
  id: string;
  title: string;
  description: string;
  price: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  _count: {
    slots: number;
    reviews: number;
  };
}

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  slot: {
    startTime: string;
    endTime: string;
    service: {
      id: string;
      title: string;
      price: string;
      category: {
        id: string;
        name: string;
      };
    };
  } | null;
}

interface VendorSlot {
  id: string;
  startTime: string;
  endTime: string;
  booking: {
    id: string;
    status: string;
    user: {
      name: string;
    };
  } | null;
  serviceId: string;
}

interface SlotService {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
  };
  slots: VendorSlot[];
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function VendorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<VendorService[]>([]);
  const [slotServices, setSlotServices] = useState<SlotService[]>([]);

  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [slotMessage, setSlotMessage] = useState("");
  const [slotError, setSlotError] = useState("");

  const [serviceActionLoading, setServiceActionLoading] = useState<
    string | null
  >(null);

  // Edit service state
  const [editingService, setEditingService] =
    useState<VendorService | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");

  const fetchVendorServices = async () => {
    try {
      setServicesLoading(true);

      const response = await axios.get(
        `${API_URL}/services/vendor/mine`,
        {
          withCredentials: true,
        }
      );

      setServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to fetch vendor services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchVendorSlots = async () => {
    try {
      setSlotsLoading(true);

      const response = await axios.get(
        `${API_URL}/slots/vendor`,
        {
          withCredentials: true,
        }
      );

      setSlotServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to fetch vendor slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchVendorBookings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/bookings/vendor`,
        {
          withCredentials: true,
        }
      );

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch vendor bookings:", error);
    }
  };

  const checkVendor = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/me`,
        {
          withCredentials: true,
        }
      );

      const currentUser = response.data.user;

      if (currentUser.role !== "VENDOR") {
        navigate("/dashboard");
        return;
      }

      setUser(currentUser);

      await Promise.all([
        fetchVendorBookings(),
        fetchVendorServices(),
        fetchVendorSlots(),
      ]);
    } catch (error) {
      console.error("Vendor authentication failed:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVendor();
  }, []);

  const confirmBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);

      await axios.patch(
        `${API_URL}/bookings/${bookingId}/confirm`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchVendorBookings();
      await fetchVendorSlots();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to confirm booking"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const completeBooking = async (bookingId: string) => {
    try {
      setActionLoading(bookingId);

      await axios.patch(
        `${API_URL}/bookings/${bookingId}/complete`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchVendorBookings();
      await fetchVendorSlots();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to complete booking"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const createAvailability = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSlotMessage("");
    setSlotError("");

    if (!serviceId || !date || !startTime || !endTime) {
      setSlotError("Please fill all availability fields.");
      return;
    }

    const startDateTime = new Date(
      `${date}T${startTime}`
    );

    const endDateTime = new Date(
      `${date}T${endTime}`
    );

    if (endDateTime <= startDateTime) {
      setSlotError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setActionLoading("create-slot");

      await axios.post(
        `${API_URL}/slots`,
        {
          serviceId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        },
        {
          withCredentials: true,
        }
      );

      setSlotMessage(
        "Availability created successfully."
      );

      setDate("");
      setStartTime("");
      setEndTime("");

      await fetchVendorSlots();
      await fetchVendorServices();
    } catch (error: any) {
      setSlotError(
        error?.response?.data?.message ||
          "Unable to create availability."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const toggleServiceStatus = async (
    currentService: VendorService
  ) => {
    try {
      setServiceActionLoading(currentService.id);

      await axios.patch(
        `${API_URL}/services/${currentService.id}/status`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchVendorServices();
      await fetchVendorSlots();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Unable to update service status."
      );
    } finally {
      setServiceActionLoading(null);
    }
  };

  // Start editing a service
  const startEditingService = (service: VendorService) => {
    setEditingService(service);

    setEditTitle(service.title);
    setEditDescription(service.description);
    setEditPrice(String(service.price));

    setEditError("");
    setEditMessage("");
  };

  // Cancel editing
  const cancelEditingService = () => {
    setEditingService(null);

    setEditTitle("");
    setEditDescription("");
    setEditPrice("");

    setEditError("");
    setEditMessage("");
  };

  // Update service
  const updateService = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!editingService) {
      return;
    }

    setEditError("");
    setEditMessage("");

    if (editTitle.trim().length < 3) {
      setEditError(
        "Service title must be at least 3 characters."
      );
      return;
    }

    if (editDescription.trim().length < 10) {
      setEditError(
        "Description must be at least 10 characters."
      );
      return;
    }

    const price = Number(editPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setEditError(
        "Price must be a valid positive number."
      );
      return;
    }

    try {
      setEditLoading(true);

      await axios.patch(
        `${API_URL}/services/${editingService.id}`,
        {
          title: editTitle.trim(),
          description: editDescription.trim(),
          price,
          categoryId: editingService.category.id,
        },
        {
          withCredentials: true,
        }
      );

      setEditMessage(
        "Service updated successfully."
      );

      await fetchVendorServices();
      await fetchVendorSlots();

      setTimeout(() => {
        setEditingService(null);
        setEditMessage("");
      }, 1000);
    } catch (error: any) {
      setEditError(
        error?.response?.data?.message ||
          "Unable to update service."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
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
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <p className="text-sm text-slate-500">
            Loading vendor dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Vendor workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Welcome, {user?.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your services, availability and customer bookings.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold !text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Browse marketplace
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total services
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {services.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending requests
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Confirmed
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {confirmedBookings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedBookings.length}
            </p>
          </div>

        </div>

        {/* My Services */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                My Services
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage the services you offer to customers.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {services.length} services
            </span>
          </div>

          {servicesLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
              <h3 className="font-semibold text-slate-900">
                No services yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first service to start receiving bookings.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {service.category.name}
                      </span>

                      <h3 className="mt-1 text-lg font-bold text-slate-950">
                        {service.title}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        service.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {service.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                    <div>
                      <p className="text-xs text-slate-500">
                        Starting price
                      </p>

                      <p className="text-lg font-bold text-slate-950">
                        ₹
                        {Number(
                          service.price
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-500">
                      <p>
                        {service._count.slots} slots
                      </p>

                      <p>
                        {service._count.reviews} reviews
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        startEditingService(service)
                      }
                      className="mb-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold !text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit service
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleServiceStatus(service)
                      }
                      disabled={
                        serviceActionLoading === service.id
                      }
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        service.isActive
                          ? "border border-red-200 bg-white !text-red-600 hover:bg-red-50"
                          : "bg-slate-950 !text-white hover:bg-blue-600"
                      }`}
                    >
                      {serviceActionLoading === service.id
                        ? "Updating..."
                        : service.isActive
                        ? "Deactivate service"
                        : "Activate service"}
                    </button>

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* Edit Service Form */}
          {editingService && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-6">

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-950">
                  Edit Service
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update the details of your service.
                </p>
              </div>

              <form
                onSubmit={updateService}
                className="space-y-5"
              >

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Service title
                  </label>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    rows={4}
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={editPrice}
                    onChange={(event) =>
                      setEditPrice(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {editError && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {editError}
                  </div>
                )}

                {editMessage && (
                  <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {editMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={cancelEditingService}
                    disabled={editLoading}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold !text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={editLoading}
                    className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {editLoading
                      ? "Saving..."
                      : "Save changes"}
                  </button>

                </div>

              </form>
            </div>
          )}

        </section>

        {/* Availability Management */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Availability Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add future time slots when customers can book your services.
            </p>
          </div>

          <form
            onSubmit={createAvailability}
            className="grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-2 lg:grid-cols-4"
          >

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Service
              </label>

              <select
                value={serviceId}
                onChange={(event) =>
                  setServiceId(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select service
                </option>

                {services
                  .filter((service) => service.isActive)
                  .map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                    >
                      {service.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start time
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End time
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">

              <button
                type="submit"
                disabled={actionLoading === "create-slot"}
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {actionLoading === "create-slot"
                  ? "Creating..."
                  : "Add availability"}
              </button>

            </div>

          </form>

          {slotMessage && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {slotMessage}
            </p>
          )}

          {slotError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {slotError}
            </p>
          )}

        </section>

        {/* Upcoming Availability */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Upcoming Availability
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See which slots are available and which are already booked.
            </p>
          </div>

          {slotsLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading availability...
            </div>
          ) : slotServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              No upcoming availability.
            </div>
          ) : (
            <div className="space-y-6">

              {slotServices.map((service) => (
                <div key={service.id}>

                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-950">
                      {service.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {service.category.name}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                    {service.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {formatDateTime(
                                slot.startTime
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              to{" "}
                              {new Date(
                                slot.endTime
                              ).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              slot.booking
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {slot.booking
                              ? slot.booking.status
                              : "AVAILABLE"}
                          </span>

                        </div>

                        {slot.booking && (
                          <p className="mt-3 text-xs text-slate-500">
                            Customer:{" "}
                            <span className="font-medium text-slate-700">
                              {slot.booking.user.name}
                            </span>
                          </p>
                        )}

                      </div>
                    ))}

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Pending Bookings */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Booking Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and confirm new customer booking requests.
            </p>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              No pending booking requests.
            </div>
          ) : (
            <div className="space-y-4">

              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                        Pending request
                      </span>

                      <h3 className="mt-1 text-lg font-bold text-slate-950">
                        {booking.slot?.service.title ||
                          "Service"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {booking.slot?.service.category.name}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      PENDING
                    </span>

                  </div>

                  <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

                    <div>
                      <p className="text-xs text-slate-500">
                        Customer
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {booking.user.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-700">
                        {booking.user.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Appointment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {booking.slot
                          ? formatDateTime(
                              booking.slot.startTime
                            )
                          : "Unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        ₹
                        {Number(
                          booking.slot?.service.price || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                  </div>

                  <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">

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

        {/* Confirmed Bookings */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Confirmed Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage upcoming confirmed appointments.
            </p>
          </div>

          {confirmedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              No confirmed bookings.
            </div>
          ) : (
            <div className="space-y-4">

              {confirmedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-slate-200 p-5"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Confirmed appointment
                      </span>

                      <h3 className="mt-1 text-lg font-bold text-slate-950">
                        {booking.slot?.service.title ||
                          "Service"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Customer: {booking.user.name}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      CONFIRMED
                    </span>

                  </div>

                  <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">

                    <div>
                      <p className="text-xs text-slate-500">
                        Appointment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {booking.slot
                          ? formatDateTime(
                              booking.slot.startTime
                            )
                          : "Unavailable"}
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
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {actionLoading === booking.id
                        ? "Completing..."
                        : "Mark as completed"}
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* Completed */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950">
              Completed Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your completed service history.
            </p>
          </div>

          {completedBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              No completed bookings yet.
            </div>
          ) : (
            <div className="space-y-3">

              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >

                  <div>
                    <p className="font-semibold text-slate-950">
                      {booking.slot?.service.title ||
                        "Service"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Customer: {booking.user.name}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    COMPLETED
                  </span>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default VendorDashboard;