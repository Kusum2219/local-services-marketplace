import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white">
            L
          </span>

          <span className="text-[21px] font-semibold tracking-[-0.035em] text-slate-950">
            LocalFix
          </span>
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-8 md:flex">

          <Link
            to="/services"
            className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Services
          </Link>

          <button
            type="button"
            onClick={() =>
              handleSectionClick("how-it-works")
            }
            className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            How it works
          </button>

          <button
            type="button"
            onClick={() =>
              handleSectionClick("why-localfix")
            }
            className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Why LocalFix
          </button>

          <Link
            to="/register"
            className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            For professionals
          </Link>

        </nav>

        {/* Actions */}

        <div className="flex items-center gap-2.5">

          {checkingAuth ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-slate-100" />
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-md px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[14px] font-semibold !text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-md px-4 py-2.5 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
              >
                Log in
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-2.5 text-[14px] font-semibold !text-white shadow-sm transition hover:bg-slate-800"
              >
                List your service
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;