import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const handleSectionClick = (sectionId: string) => {
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/auth/me`,
          {
            withCredentials: true,
          }
        );

        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setProfileOpen(false);
      navigate("/");
    }
  };

  const dashboardPath =
    user?.role === "VENDOR"
      ? "/vendor-dashboard"
      : "/dashboard";

  const dashboardLabel =
    user?.role === "VENDOR"
      ? "Vendor Dashboard"
      : "My Bookings";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold !text-white">
            L
          </span>

          <span className="text-[21px] font-bold tracking-[-0.04em] text-slate-950">
            LocalFix
          </span>
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/services"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Services
          </Link>

          <button
            type="button"
            onClick={() =>
              handleSectionClick("how-it-works")
            }
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            How it works
          </button>

          <button
            type="button"
            onClick={() =>
              handleSectionClick("why-localfix")
            }
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Why LocalFix
          </button>

          {!user && (
            <Link
              to="/register"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              For professionals
            </Link>
          )}

          {user && user.role === "CUSTOMER" && (
            <Link
              to="/services"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Book a service
            </Link>
          )}

          {user && user.role === "VENDOR" && (
            <Link
              to="/vendor-dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            >
              Manage bookings
            </Link>
          )}

        </nav>

        {/* Right side */}

        <div className="flex items-center gap-3">

          {checkingAuth ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <div
              ref={profileRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50"
              >

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold !text-white">
                  {user.name
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="hidden max-w-[120px] truncate text-sm font-semibold text-slate-800 sm:block">
                  {user.name}
                </span>

                <svg
                  className={`h-4 w-4 text-slate-500 transition ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>

              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 px-4 py-4">

                    <p className="truncate text-sm font-semibold text-slate-950">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {user.email}
                    </p>

                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                      {user.role}
                    </p>

                  </div>

                  <div className="p-2">

                    <Link
                      to={dashboardPath}
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      {dashboardLabel}
                    </Link>

                    {user.role === "CUSTOMER" && (
                      <Link
                        to="/services"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Browse Services
                      </Link>
                    )}

                    {user.role === "VENDOR" && (
                      <Link
                        to="/vendor-dashboard"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Manage Bookings
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Logout
                    </button>

                  </div>
                </div>
              )}

            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-600"
              >
                Get started
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;