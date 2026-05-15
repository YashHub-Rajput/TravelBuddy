// File: client/src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert } from "../components/ui/index.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel – branding ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-coral/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-coral rounded-2xl flex items-center justify-center text-2xl shadow-glow-coral">✈️</div>
          <span className="font-display font-bold text-2xl text-white">TravelBuddy</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-bold text-5xl text-white leading-tight">
            Find your perfect<br />
            <span className="text-gradient-coral">travel companion.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Connect with like-minded travelers, plan trips together, and share unforgettable experiences.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { n: "10K+", l: "Travelers" },
              { n: "50K+", l: "Trips Planned" },
              { n: "120+", l: "Countries" },
              { n: "4.9★", l: "App Rating" },
            ].map(({ n, l }) => (
              <div key={l} className="bg-white/5 rounded-2xl p-4">
                <p className="font-display font-bold text-2xl text-white">{n}</p>
                <p className="text-white/40 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs relative z-10">© 2025 TravelBuddy. Travel smarter, together.</p>
      </div>

      {/* ── Right panel – form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-coral rounded-2xl flex items-center justify-center text-xl">✈️</div>
            <span className="font-display font-bold text-xl text-ink">TravelBuddy</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-ink">Welcome back 👋</h2>
            <p className="text-ink/50 mt-1.5">Sign in to continue your journey</p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="input-label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-ink/50 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-coral font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          <div className="mt-8 p-4 bg-mist/60 rounded-2xl">
            <p className="text-xs text-ink/40 font-medium text-center">
              🔒 Secure JWT authentication · Your data stays private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
