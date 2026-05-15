// File: client/src/components/common/Layout.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getInitials } from "../../utils/helpers.js";

const NAV = [
  { path: "/dashboard", label: "Dashboard",    icon: "🏠" },
  { path: "/browse",    label: "Browse Trips", icon: "🗺️" },
  { path: "/matches",   label: "Matches",      icon: "✨" },
  { path: "/chat",      label: "Messages",     icon: "💬" },
  { path: "/profile",   label: "My Profile",   icon: "👤" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── Sidebar (desktop) ──────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink min-h-screen sticky top-0 p-5 gap-4 flex-shrink-0">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-3 mb-2">
          <div className="w-9 h-9 bg-coral rounded-2xl flex items-center justify-center text-xl shadow-glow-coral">
            ✈️
          </div>
          <span className="font-display font-bold text-xl text-white">TravelBuddy</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive(path)
                  ? "bg-coral text-white shadow-glow-coral"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Create Trip CTA */}
        <Link
          to="/trips/new"
          className="flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold text-sm py-3 rounded-2xl transition-all shadow-glow-teal"
        >
          <span className="text-lg">+</span> New Trip
        </Link>

        {/* User card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mt-1">
          <div className="avatar w-9 h-9 text-sm text-coral flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span>{getInitials(user?.name)}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            {user?.isVerified && (
              <p className="text-teal text-xs font-medium flex items-center gap-1">
                <span>✓</span> Verified
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="text-white/30 hover:text-white/70 text-lg transition-colors"
          >
            →
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur-sm h-14 flex items-center justify-between px-4 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">✈️</span>
          <span className="font-display font-bold text-white text-lg">TravelBuddy</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/70 text-2xl w-9 h-9 flex items-center justify-center"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 bg-ink h-full p-5 flex flex-col gap-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14" />
            {NAV.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold ${
                  isActive(path) ? "bg-coral text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
            <Link to="/trips/new" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 bg-teal text-white font-semibold py-3 rounded-2xl mt-2">
              + New Trip
            </Link>
            <button onClick={handleLogout} className="text-white/40 text-sm text-left px-3 py-2 mt-auto">
              Logout →
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 lg:pt-0 pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
