import { useEffect, useState, useCallback, type FormEvent } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getServiceById,
  type Service,
} from "../services/services";

const API_URL = "http://localhost:5000/api";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewBooking {
  id: string;
  status: string;
  slot: {
    service: {
      id: string;
      title: string;
    };
  } | null;
}

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

  // Customer reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [eligibleBookings, setEligibleBookings] = useState<ReviewBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

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

    void loadService();
  }, [serviceId]);

  // Load public reviews for this service
  const loadReviews = useCallback(async () => {
    if (!serviceId) return;

    try {
      const response = await axios.get(
        `${API_URL}/reviews/service/${serviceId}`
      );

      setReviews(response.data.reviews ?? []);
      setAverageRating(response.data.averageRating ?? 0);
      setTotalReviews(response.data.totalReviews ?? 0);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  }, [serviceId]);

  // Load completed bookings belonging to the logged-in customer
  useEffect(() => {
    if (!serviceId) return;

    void loadReviews();

    let cancelled = false;

    const loadEligibleBookings = async () => {
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        if (cancelled) return;

        const role = meResponse.data.user?.role ?? "";
        setCurrentUserRole(role);

        if (role !== "CUSTOMER") return;

        const bookingsResponse = await axios.get(
          `${API_URL}/bookings/my`,
          { withCredentials: true }
        );

        if (cancelled) return;

        const bookings: ReviewBooking[] =
          bookingsResponse.data.bookings ?? [];

        const completed = bookings.filter(
          (booking) =>
            booking.status === "COMPLETED" &&
            booking.slot?.service.id === serviceId
        );

        setEligibleBookings(completed);

        if (completed.length > 0) {
          setSelectedBookingId(completed[0].id);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load review eligibility:", error);
        }
      }
    };

    void loadEligibleBookings();

    return () => {
      cancelled = true;
    };
  }, [serviceId, loadReviews]);

  const handleSubmitReview = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setReviewMessage("");

    if (!selectedBookingId) {
      setReviewMessage("Select a completed booking first.");
      return;
    }

    try {
      setReviewLoading(true);

      await axios.post(
        `${API_URL}/reviews`,
        {
          bookingId: selectedBookingId,
          rating,
          comment: comment.trim() || undefined,
        },
        { withCredentials: true }
      );

      setReviewMessage("Your review was submitted successfully.");
      setComment("");

      setEligibleBookings((current) =>
        current.filter((booking) => booking.id !== selectedBookingId)
      );

      setSelectedBookingId("");
      await loadReviews();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setReviewMessage(
          error.response?.data?.message ??
            "Unable to submit review. Please try again."
        );
      } else {
        setReviewMessage("Unable to submit review. Please try again.");
      }
    } finally {
      setReviewLoading(false);
    }
  };

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

            {/* Customer Reviews — Added */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Customer feedback
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    Customer reviews
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Feedback from customers who booked this service.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                  <p className="text-2xl font-bold text-slate-950">
                    {averageRating.toFixed(1)}
                    <span className="ml-1 text-amber-500">★</span>
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Review Form */}

              {currentUserRole === "CUSTOMER" &&
                eligibleBookings.length > 0 && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
                  >
                    <h3 className="text-lg font-semibold text-slate-950">
                      Write a review
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Share your experience with this service.
                    </p>

                    <div className="mt-5">
                      <label
                        htmlFor="review-booking"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Completed booking
                      </label>

                      <select
                        id="review-booking"
                        value={selectedBookingId}
                        onChange={(event) =>
                          setSelectedBookingId(event.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                      >
                        <option value="" disabled>
                          Select a booking
                        </option>

                        {eligibleBookings.map((booking) => (
                          <option key={booking.id} value={booking.id}>
                            {booking.slot?.service.title ?? "Completed booking"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor="review-rating"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Your rating
                      </label>

                      <select
                        id="review-rating"
                        value={rating}
                        onChange={(event) =>
                          setRating(Number(event.target.value))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>

                      <p className="mt-2 text-lg tracking-widest text-amber-500">
                        {"★".repeat(rating)}
                        {"☆".repeat(5 - rating)}
                      </p>
                    </div>

                    <div className="mt-5">
                      <label
                        htmlFor="review-comment"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Comment
                        <span className="ml-1 font-normal text-slate-400">
                          (optional)
                        </span>
                      </label>

                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        maxLength={1000}
                        rows={4}
                        placeholder="Tell others about your experience..."
                        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {comment.length}/1000 characters
                      </p>
                    </div>

                    {reviewMessage && (
                      <p
                        role="status"
                        className={`mt-4 text-sm ${
                          reviewMessage.includes("successfully")
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {reviewMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={reviewLoading || !selectedBookingId}
                      className="mt-5 flex w-full items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {reviewLoading ? "Submitting review..." : "Submit review"}
                    </button>
                  </form>
                )}

              {/* Review status messages */}

              {currentUserRole === "CUSTOMER" &&
                eligibleBookings.length === 0 && (
                  <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    You can submit a review after completing a booking for this
                    service. Each booking can be reviewed only once.
                  </p>
                )}

              {reviewMessage && eligibleBookings.length === 0 && (
                <p
                  role="status"
                  className={`mt-4 text-sm ${
                    reviewMessage.includes("successfully")
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {reviewMessage}
                </p>
              )}

              {/* Reviews List */}

              <div className="mt-7">
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
                    <div className="text-3xl text-amber-500">☆</div>

                    <h3 className="mt-3 text-base font-semibold text-slate-900">
                      No reviews yet
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Customer reviews will appear here after someone reviews
                      this service.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((review) => (
                      <article key={review.id} className="py-5 first:pt-0">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                              {(review.user?.name || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">
                                {review.user?.name || "Customer"}
                              </h3>

                              <p className="mt-1 text-xs text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                            {review.rating}/5
                          </span>
                        </div>

                        <p className="mt-3 text-lg tracking-widest text-amber-500">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>

                        {review.comment && (
                          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                            {review.comment}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Service Highlights — Original */}

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
                  {Number(service.price).toLocaleString("en-IN")}
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
                  <span className="text-slate-500">Category</span>

                  <span className="font-medium text-slate-800">
                    {service.category.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Provider</span>

                  <span className="max-w-[170px] truncate font-medium text-slate-800">
                    {service.vendor.businessName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status</span>

                  <span className="font-medium text-emerald-600">
                    Available
                  </span>
                </div>
              </div>
            </div>

            {/* Safety note — Original */}

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
