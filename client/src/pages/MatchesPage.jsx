// File: client/src/pages/MatchesPage.jsx
import { useState, useEffect } from "react";
import { matchService } from "../services/matchService.js";
import MatchCard from "../components/matching/MatchCard.jsx";
import { PageLoader, EmptyState } from "../components/ui/index.jsx";
import { Link } from "react-router-dom";

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    matchService.getMatches()
      .then((d) => setMatches(d.matches))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = matches.filter((m) => {
    if (filter === "high")   return m.score >= 70;
    if (filter === "medium") return m.score >= 40 && m.score < 70;
    if (filter === "low")    return m.score < 40;
    return true;
  });

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-ink">Travel Matches ✨</h1>
        <p className="text-ink/50 mt-1">
          Ranked by compatibility — dates, interests, and budget
        </p>
      </div>

      {/* Algorithm explainer */}
      <div className="card bg-ink border-ink text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-coral/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <p className="font-display font-bold text-base mb-3">🧠 How matching works</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { pct: "40%", label: "Date Overlap",    icon: "📅", color: "text-coral" },
              { pct: "35%", label: "Shared Interests", icon: "🎯", color: "text-gold" },
              { pct: "25%", label: "Budget Fit",       icon: "💰", color: "text-teal" },
            ].map(({ pct, label, icon, color }) => (
              <div key={label} className="bg-white/8 rounded-2xl p-3">
                <div className="text-xl mb-1">{icon}</div>
                <p className={`font-display font-bold text-lg ${color}`}>{pct}</p>
                <p className="text-white/50 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all",    label: "All Matches" },
          { key: "high",   label: "🟢 High (70%+)" },
          { key: "medium", label: "🟡 Medium (40–70%)" },
          { key: "low",    label: "🔴 Low (<40%)" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm font-semibold px-4 py-2 rounded-2xl border transition-all ${
              filter === key
                ? "bg-coral text-white border-coral shadow-glow-coral"
                : "bg-white border-mist-dark text-ink/60 hover:border-ink/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="card border-coral/20 bg-coral/5 text-coral text-sm p-5">⚠️ {error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={matches.length === 0 ? "No matches yet" : "No matches in this range"}
          subtitle={
            matches.length === 0
              ? "Add trips and interests to your profile to start getting matched with travelers."
              : "Try a different filter to see more results."
          }
          action={
            matches.length === 0 && (
              <Link to="/trips/new" className="btn-primary">Create a Trip to Get Matched</Link>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink/50">
            Showing <span className="font-semibold text-ink">{filtered.length}</span> match
            {filtered.length !== 1 ? "es" : ""}
            {filter !== "all" && " in this range"}
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((match) => (
              <MatchCard key={match.user.id} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
