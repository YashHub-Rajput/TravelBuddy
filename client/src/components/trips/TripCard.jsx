// File: client/src/components/trips/TripCard.jsx
import { Link } from "react-router-dom";
import { fmtDateShort, fmtCurrency, tripDuration, getInitials } from "../../utils/helpers.js";
import { StatusBadge } from "../ui/index.jsx";

const INTEREST_ICONS = {
  hiking: "🥾", beaches: "🏖️", culture: "🏛️", food: "🍜",
  adventure: "🧗", photography: "📸", backpacking: "🎒",
  luxury: "💎", history: "🏺", wildlife: "🦁",
};

export default function TripCard({ trip, onJoin, compact = false }) {
  const {
    _id, destination, description, startDate, endDate,
    budget, currency, creator, tags, members, maxGroupSize, status,
  } = trip;

  const acceptedCount = members?.filter((m) => m.status === "accepted").length || 0;
  const spotsLeft = maxGroupSize - acceptedCount;
  const duration = tripDuration(startDate, endDate);

  return (
    <div className="card-hover flex flex-col gap-4 animate-fade-in">
      {/* ── Destination header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-xl text-ink leading-tight">{destination}</h3>
          <p className="text-ink/50 text-sm mt-1 flex items-center gap-2">
            <span>📅</span>
            {fmtDateShort(startDate)} – {fmtDateShort(endDate)}
            <span className="text-ink/30">·</span>
            <span>{duration}d</span>
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* ── Description ─────────────────────────────────────────── */}
      {!compact && description && (
        <p className="text-ink/60 text-sm leading-relaxed line-clamp-2">{description}</p>
      )}

      {/* ── Tags ────────────────────────────────────────────────── */}
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-coral capitalize">
              {INTEREST_ICONS[tag] || "🏷️"} {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="tag-mist">+{tags.length - 3}</span>
          )}
        </div>
      )}

      {/* ── Stats row ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 py-3 border-t border-b border-mist text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-base">💰</span>
          <span className="font-semibold text-ink">{fmtCurrency(budget, currency)}</span>
        </div>
        <div className="w-px h-4 bg-mist-dark" />
        <div className="flex items-center gap-1.5">
          <span className="text-base">👥</span>
          <span className="font-medium text-ink/70">
            {spotsLeft > 0
              ? <><span className="text-teal font-semibold">{spotsLeft}</span> spots left</>
              : <span className="text-coral font-semibold">Full</span>
            }
          </span>
        </div>
        <div className="w-px h-4 bg-mist-dark" />
        <div className="flex items-center gap-1.5">
          <span className="text-base">🗓️</span>
          <span className="text-ink/60">{duration} days</span>
        </div>
      </div>

      {/* ── Creator + actions ───────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <Link to={`/profile/${creator?._id}`} className="flex items-center gap-2 group">
          <div className="avatar w-7 h-7 text-xs">
            {creator?.avatar
              ? <img src={creator.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-coral">{getInitials(creator?.name)}</span>
            }
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-ink/60 group-hover:text-ink transition-colors">{creator?.name}</span>
            {creator?.isVerified && <span className="text-teal text-xs">✓</span>}
          </div>
        </Link>

        <div className="flex gap-2">
          <Link
            to={`/trips/${_id}`}
            className="btn-ghost text-xs py-1.5 px-3 border border-mist-dark hover:border-ink/20"
          >
            View
          </Link>
          {onJoin && spotsLeft > 0 && (
            <button
              onClick={() => onJoin(_id)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Join Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
