import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getServices,
  type Service,
} from "../services/services";

const serviceImages: Record<string, string> = {
  cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",

  plumbing:
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1000&q=80",

  electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1000&q=80",

  tutoring:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",

  repair:
    "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1000&q=80",

  default:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1000&q=80",
};

const getServiceImage = (category: string) => {
  const categoryName = category.toLowerCase();

  const matchedKey = Object.keys(serviceImages).find((key) =>
    categoryName.includes(key)
  );

  return serviceImages[matchedKey || "default"];
};

function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getServices();

        setServices(data);
      } catch (error) {
        console.error("Failed to load services:", error);
        setError("Unable to load services right now.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(services.map((service) => service.category.name))
    );

    return ["All", ...uniqueCategories];
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = services.filter((service) => {
      const matchesSearch =
        !normalizedSearch ||
        service.title.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        service.category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        service.vendor.businessName
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "All" ||
        service.category.name === category;

      const price = Number(service.price);

      const matchesPrice =
        maxPrice === "all" ||
        (maxPrice === "500" && price <= 500) ||
        (maxPrice === "1000" && price <= 1000) ||
        (maxPrice === "2000" && price <= 2000) ||
        (maxPrice === "5000" && price <= 5000);

      const matchesVerified =
        !verifiedOnly || service.vendor.isVerified;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesVerified
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });
  }, [
    services,
    search,
    category,
    maxPrice,
    verifiedOnly,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setMaxPrice("all");
    setVerifiedOnly(false);
    setSortBy("recommended");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    maxPrice !== "all" ||
    verifiedOnly;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">

      {/* Header */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            LocalFix marketplace
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Find the right professional for the job.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore local services, compare providers, check prices and
            choose a convenient time to book.
          </p>

          {/* Search */}

          <div className="mt-8 max-w-3xl">

            <div className="flex items-center rounded-xl border border-slate-300 bg-white p-2 shadow-sm">

              <svg
                className="ml-3 h-5 w-5 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search cleaning, plumbing, tutoring..."
                className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mr-2 rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  Clear
                </button>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Main Marketplace */}

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">

          {/* Filters */}

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">

            <div className="flex items-center justify-between">

              <h2 className="text-sm font-semibold text-slate-950">
                Filters
              </h2>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-500 underline underline-offset-4 transition hover:text-slate-950"
                >
                  Clear all
                </button>
              )}

            </div>

            {/* Category */}

            <div className="mt-7">

              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </label>

              <div className="mt-3 space-y-1.5">

                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      category === item
                        ? "bg-slate-950 font-semibold !text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span>{item}</span>

                    {category === item && (
                      <span className="text-xs !text-white">
                        Selected
                      </span>
                    )}
                  </button>
                ))}

              </div>

            </div>

            {/* Price */}

            <div className="mt-7 border-t border-slate-100 pt-6">

              <label
                htmlFor="price"
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Maximum price
              </label>

              <select
                id="price"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
              >
                <option value="all">
                  Any price
                </option>

                <option value="500">
                  Up to ₹500
                </option>

                <option value="1000">
                  Up to ₹1,000
                </option>

                <option value="2000">
                  Up to ₹2,000
                </option>

                <option value="5000">
                  Up to ₹5,000
                </option>
              </select>

            </div>

            {/* Verified */}

            <div className="mt-7 border-t border-slate-100 pt-6">

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(event) =>
                    setVerifiedOnly(event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-slate-950"
                />

                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    Verified providers
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Show only verified professionals.
                  </span>
                </span>

              </label>

            </div>

          </aside>

          {/* Results */}

          <div>

            {/* Result toolbar */}

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <p className="text-sm font-semibold text-slate-950">
                  {loading
                    ? "Loading services..."
                    : `${filteredServices.length} ${
                        filteredServices.length === 1
                          ? "service"
                          : "services"
                      } found`}
                </p>

                {!loading && hasActiveFilters && (
                  <p className="mt-1 text-xs text-slate-500">
                    Results updated based on your filters.
                  </p>
                )}

              </div>

              <div className="flex items-center gap-3">

                <label
                  htmlFor="sort"
                  className="text-sm text-slate-500"
                >
                  Sort by
                </label>

                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
                >
                  <option value="recommended">
                    Recommended
                  </option>

                  <option value="price-low">
                    Price: Low to high
                  </option>

                  <option value="price-high">
                    Price: High to low
                  </option>

                  <option value="name">
                    Name
                  </option>
                </select>

              </div>

            </div>

            {/* Loading */}

            {loading && (
              <div className="grid gap-5 sm:grid-cols-2">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-[16/10] animate-pulse bg-slate-200" />

                    <div className="space-y-3 p-5">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}

              </div>
            )}

            {/* Error */}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">

                <h2 className="font-semibold text-red-800">
                  Something went wrong
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>

              </div>
            )}

            {/* Empty */}

            {!loading &&
              !error &&
              filteredServices.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                    <svg
                      className="h-6 w-6 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                      />
                    </svg>

                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-950">
                    No services found
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try changing your search or removing one of the filters.
                  </p>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-800"
                    >
                      Clear filters
                    </button>
                  )}

                </div>
              )}

            {/* Service Cards */}

            {!loading &&
              !error &&
              filteredServices.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">

                  {filteredServices.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${service.id}`}
                      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
                    >

                      {/* Image */}

                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">

                        <img
                          src={getServiceImage(
                            service.category.name
                          )}
                          alt={service.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />

                        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">

                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                            {service.category.name}
                          </span>

                          {service.vendor.isVerified && (
                            <span className="flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold !text-white shadow-sm">

                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white text-[9px] !text-white">
                                ✓
                              </span>

                              Verified

                            </span>
                          )}

                        </div>

                      </div>

                      {/* Content */}

                      <div className="p-5">

                        <h2 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                          {service.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {service.description}
                        </p>

                        {/* Vendor */}

                        <div className="mt-5 flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                            {service.vendor.businessName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {service.vendor.businessName}
                            </p>

                            {service.vendor.location && (
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {service.vendor.location}
                              </p>
                            )}

                          </div>

                        </div>

                        {/* Footer */}

                        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">

                          <div>

                            <p className="text-xs text-slate-400">
                              Starting from
                            </p>

                            <p className="mt-0.5 text-xl font-bold text-slate-950">
                              ₹
                              {Number(
                                service.price
                              ).toLocaleString("en-IN")}
                            </p>

                          </div>

                          <span className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 transition group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:!text-white">
                            View service
                          </span>

                        </div>

                      </div>

                    </Link>
                  ))}

                </div>
              )}

          </div>

        </div>

      </section>

    </main>
  );
}

export default Services;