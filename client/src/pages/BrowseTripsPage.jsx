// File: client/src/pages/BrowseTripsPage.jsx
import { useState } from "react";
import { useTrips } from "../hooks/useTrips.js";
import { tripService } from "../services/tripService.js";
import { useAuth } from "../context/AuthContext.jsx";
import TripCard from "../components/trips/TripCard.jsx";
import { PageLoader, EmptyState } from "../components/ui/index.jsx";
import { Link } from "react-router-dom";

export default function BrowseTripsPage() {
  const { user } = useAuth();
  const [params,      setParams]      = useState({ page: 1 });
  const [searchInput, setSearchInput] = useState("");
  const [joinMsg,     setJoinMsg]     = useState("");

  const { trips, loading, error, pagination } = useTrips(params);

  const applySearch = (e) => {
    e.preventDefault();
    setParams((p) => ({ ...p, destination: searchInput.trim() || undefined, page: 1 }));
  };

  const clearSearch = () => {
    setSearchInput("");
    setParams({ page: 1 });
  };

  const handleJoin = async (tripId) => {
    if (!user) return;
    try {
      await tripService.joinTrip(tripId);
      setJoinMsg("✅ Join request sent!");
      setTimeout(() => setJoinMsg(""), 3000);
    } catch (err) {
      setJoinMsg(`❌ ${err.message || "Failed to send request."}`);
      setTimeout(() => setJoinMsg(""), 3000);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-ink">Browse Trips</h1>
        <p className="text-ink/50 mt-1">Discover adventures and find companions who match your vibe</p>
      </div>

      {/* Search bar */}
      <form onSubmit={applySearch} className="flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 text-lg">🔍</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by destination (Tokyo, Paris, Bali…)"
            className="input-field pl-11 pr-4"
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
        {params.destination && (
          <button type="button" onClick={clearSearch} className="btn-secondary px-4">
            Clear
          </button>
        )}
      </form>

      {/* Toast notification */}
      {joinMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-float animate-slide-up">
          {joinMsg}
        </div>
      )}

      {/* Active filter badge */}
      {params.destination && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink/50">Showing results for:</span>
          <span className="tag-coral">📍 {params.destination}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="card border-coral/20 bg-coral/5 text-coral text-sm p-5">
          ⚠️ {error}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No trips found"
          subtitle={params.destination ? `No trips to "${params.destination}". Try a different destination.` : "No public trips available yet."}
          action={
            user ? (
              <Link to="/trips/new" className="btn-primary">Create the First Trip</Link>
            ) : (
              <Link to="/signup" className="btn-primary">Join to Create Trips</Link>
            )
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink/50">
              <span className="font-semibold text-ink">{pagination.total}</span> trip{pagination.total !== 1 ? "s" : ""} found
            </p>
            {!user && (
              <Link to="/signup" className="text-coral text-sm font-semibold hover:underline">
                Sign up to join trips →
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onJoin={user ? handleJoin : undefined}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                disabled={pagination.page === 1}
                onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}
                className="btn-secondary px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagination.page) <= 2)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setParams((prev) => ({ ...prev, page: p }))}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                        p === pagination.page
                          ? "bg-coral text-white shadow-glow-coral"
                          : "bg-white border border-mist-dark text-ink/60 hover:border-ink/30"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
              </div>
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}
                className="btn-secondary px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
