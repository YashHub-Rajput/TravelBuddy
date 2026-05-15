// File: client/src/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { tripService } from "../services/tripService.js";
import { matchService } from "../services/matchService.js";
import TripCard from "../components/trips/TripCard.jsx";
import MatchCard from "../components/matching/MatchCard.jsx";
import { PageLoader } from "../components/ui/index.jsx";
import { fmtCurrency } from "../utils/helpers.js";

function StatCard({ icon, value, label, color = "coral" }) {
  const colors = {
    coral: "from-coral/15 to-coral/5 border-coral/20",
    teal:  "from-teal/15 to-teal/5 border-teal/20",
    gold:  "from-gold/20 to-gold/5 border-gold/20",
    ink:   "from-ink/10 to-ink/5 border-ink/10",
  };
  return (
    <div className={`card bg-gradient-to-br ${colors[color]} p-5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-display font-bold text-2xl text-ink">{value}</p>
      <p className="text-xs text-ink/50 font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [myTrips,    setMyTrips]    = useState([]);
  const [topMatches, setTopMatches] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      tripService.getMyTrips(),
      matchService.getMatches(),
    ])
      .then(([tripsData, matchData]) => {
        setMyTrips(tripsData.trips.slice(0, 3));
        setTopMatches(matchData.matches.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const planningTrips = myTrips.filter((t) => t.status === "planning").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome banner ──────────────────────────────────────── */}
      <div className="relative bg-ink rounded-4xl overflow-hidden p-7 lg:p-10">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal/15 rounded-full blur-2xl translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-white/40 text-sm font-medium mb-1">Good to see you back 👋</p>
            <h1 className="font-display font-bold text-3xl lg:text-4xl text-white">
              {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-white/50 mt-2 max-w-sm text-sm leading-relaxed">
              {myTrips.length === 0
                ? "Ready to plan your first adventure? Create a trip to get matched."
                : `You have ${planningTrips} trip${planningTrips !== 1 ? "s" : ""} in planning mode.`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/trips/new" className="btn-primary text-sm">
              + New Trip
            </Link>
            <Link to="/matches" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition-all">
              ✨ Find Matches
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="✈️" value={myTrips.length}             label="My Trips"    color="coral" />
        <StatCard icon="✨" value={topMatches.length}          label="Top Matches" color="teal"  />
        <StatCard icon="⭐" value={user?.rating || "New"}      label="My Rating"   color="gold"  />
        <StatCard icon="✓"  value={user?.isVerified ? "Yes" : "No"} label="Verified" color="ink" />
      </div>

      {/* ── My Trips ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">My Trips</h2>
            <p className="section-subtitle">Your upcoming adventures</p>
          </div>
          <Link to="/trips/new" className="btn-secondary text-sm">+ Create Trip</Link>
        </div>

        {myTrips.length === 0 ? (
          <div className="card border-dashed border-2 border-mist-dark text-center py-14">
            <div className="text-5xl mb-3 animate-float">🗺️</div>
            <h3 className="font-display font-bold text-xl text-ink mb-1">No trips yet</h3>
            <p className="text-ink/40 text-sm mb-5">Create your first trip to start finding travel companions</p>
            <Link to="/trips/new" className="btn-primary">Create a Trip</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* ── Top Matches ────────────────────────────────────────── */}
      {topMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Top Matches ✨</h2>
              <p className="section-subtitle">People you'd love to travel with</p>
            </div>
            <Link to="/matches" className="btn-ghost text-sm text-coral font-semibold">View All →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {topMatches.map((match) => (
              <MatchCard key={match.user.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* ── Quick links ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: "/browse",   icon: "🗺️",  label: "Browse Trips",  sub: "Explore public trips" },
          { to: "/matches",  icon: "✨",  label: "Find Matches",  sub: "Smart compatibility" },
          { to: "/chat",     icon: "💬",  label: "Messages",      sub: "Chat with companions" },
          { to: "/profile",  icon: "👤",  label: "My Profile",    sub: "Edit your details" },
        ].map(({ to, icon, label, sub }) => (
          <Link
            key={to}
            to={to}
            className="card-hover text-center py-6 group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
            <p className="font-semibold text-ink text-sm">{label}</p>
            <p className="text-ink/40 text-xs mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
