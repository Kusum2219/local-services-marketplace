import { Link } from "react-router-dom";

const services = [
  {
    title: "Home Cleaning",
    description: "Reliable cleaning professionals for your home.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Plumbing",
    description: "Get plumbing issues fixed by experienced professionals.",
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Electrical",
    description: "Find professionals for repairs and installations.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tutoring",
    description: "Learn from tutors for school, college and skills.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  },
];

function Home() {
  return (
    <main className="bg-[#f7f7f5] text-slate-950">
      {/* Hero */}
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Local services, made simple
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-6xl">
              Find reliable help for everyday needs.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Discover trusted professionals, compare services and book a
              convenient time — all in one place.
            </p>

            {/* Search */}
            <div className="mt-9 max-w-2xl">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm sm:flex-row">
                <div className="flex flex-1 items-center px-4">
                  <svg
                    className="mr-3 h-5 w-5 text-slate-400"
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
                    placeholder="What service do you need?"
                    className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span>Popular:</span>

                <button className="hover:text-slate-950">
                  Cleaning
                </button>

                <button className="hover:text-slate-950">
                  Plumbing
                </button>

                <button className="hover:text-slate-950">
                  Electrical
                </button>

                <button className="hover:text-slate-950">
                  Tutoring
                </button>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative min-h-[430px] overflow-hidden rounded-2xl bg-slate-200">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=85"
              alt="Professional providing a home service"
              className="h-full w-full object-cover"
            />

            <div className="absolute bottom-5 left-5 max-w-xs rounded-xl border border-white/40 bg-white/95 p-5 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Trusted professionals
              </p>

              <p className="mt-2 text-base font-semibold text-slate-900">
                Compare services and book a time that works for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Explore services
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                What can we help you with?
              </h2>
            </div>

            <Link
              to="/services"
              className="text-sm font-semibold text-slate-900 underline underline-offset-4"
            >
              View all services
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                to="/services"
                key={service.title}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-slate-900">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-white py-20 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              From search to booking in a few steps.
            </h2>
          </div>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <span className="text-sm font-semibold text-slate-400">
                01
              </span>

              <h3 className="mt-4 text-xl font-semibold">
                Search
              </h3>

              <p className="mt-3 max-w-sm leading-7 text-slate-600">
                Tell us what service you need and explore available
                professionals.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-slate-400">
                02
              </span>

              <h3 className="mt-4 text-xl font-semibold">
                Compare
              </h3>

              <p className="mt-3 max-w-sm leading-7 text-slate-600">
                Check provider profiles, services, reviews and available
                time slots.
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-slate-400">
                03
              </span>

              <h3 className="mt-4 text-xl font-semibold">
                Book
              </h3>

              <p className="mt-3 max-w-sm leading-7 text-slate-600">
                Select a convenient slot and confirm your appointment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why LocalFix */}
      <section
        id="why-localfix"
        className="bg-[#f7f7f5] py-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Why LocalFix
            </p>

            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              A simpler way to find local professionals.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              LocalFix brings discovery, availability and booking together so
              customers can make informed decisions before requesting a
              service.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-l-2 border-slate-900 pl-5">
              <h3 className="font-semibold">Verified profiles</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                View relevant provider information before booking.
              </p>
            </div>

            <div className="border-l-2 border-slate-900 pl-5">
              <h3 className="font-semibold">Clear availability</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose from actual available appointment slots.
              </p>
            </div>

            <div className="border-l-2 border-slate-900 pl-5">
              <h3 className="font-semibold">Reviews</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                See customer feedback before making a decision.
              </p>
            </div>

            <div className="border-l-2 border-slate-900 pl-5">
              <h3 className="font-semibold">Easy booking</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Reserve an available slot without unnecessary steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-950 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Need a service? Start with LocalFix.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Browse local professionals and find a time that works for you.
          </p>

          <Link
            to="/services"
            className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Explore services
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;