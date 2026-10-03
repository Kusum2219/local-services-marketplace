import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Login successful
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f5] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your LocalFix bookings.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:!text-slate-500"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="mt-2 inline-block text-sm font-semibold text-slate-900 hover:text-blue-600"
            >
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Login;