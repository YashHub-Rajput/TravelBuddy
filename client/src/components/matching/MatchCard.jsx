// File: client/src/components/matching/MatchCard.jsx
import { useNavigate } from "react-router-dom";
import { chatService } from "../../services/chatService.js";
import { getInitials, scoreColor } from "../../utils/helpers.js";

const INTEREST_ICONS = {
  hiking: "🥾", beaches: "🏖️", culture: "🏛️", food: "🍜",
  adventure: "🧗", photography: "📸", backpacking: "🎒",
  luxury: "💎", history: "🏺", wildlife: "🦁",
};

function ScoreRing({ score }) {
  const { ring } = scoreColor(score);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#E8EEF4" strokeWidth="5" fill="none" />
        <circle
          cx="32" cy="32" r={r}
          stroke={ring}
          strokeWidth="5"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-sm text-ink leading-none">{score}</span>
        <span className="text-ink/40 text-[9px] font-medium">%</span>
      </div>
    </div>
  );
}

export default function MatchCard({ match }) {
  const navigate = useNavigate();
  const { user, score } = match;

  const handleMessage = async () => {
    try {
      const data = await chatService.getOrCreateDirect(user.id);
      navigate(`/chat/${data.chat._id}`);
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  const { text: scoreText } = scoreColor(score);

  return (
    <div className="card-hover group flex flex-col gap-4">
      {/* Header: avatar + score ring */}
      <div className="flex items-start gap-3">
        <div className="avatar w-14 h-14 text-base flex-shrink-0 text-coral border-2 border-coral/20">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            : <span>{getInitials(user.name)}</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display font-bold text-lg text-ink leading-tight">{user.name}</h3>
            {user.isVerified && (
              <span className="bg-teal/15 text-teal text-xs font-bold px-1.5 py-0.5 rounded-full">✓</span>
            )}
          </div>
          {user.rating > 0 && (
            <p className="text-xs text-ink/50 mt-0.5">
              ⭐ {user.rating} · {user.reviewCount} review{user.reviewCount !== 1 ? "s" : ""}
            </p>
          )}
          {user.travelPreferences?.travelStyle && (
            <p className="text-xs text-ink/40 mt-0.5 capitalize">
              🎒 {user.travelPreferences.travelStyle} traveler
            </p>
          )}
        </div>

        <ScoreRing score={score} />
      </div>

      {/* Match label */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-mist rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 70 ? "bg-teal" : score >= 40 ? "bg-gold" : "bg-coral"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${scoreText}`}>{score}% match</span>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-ink/60 leading-relaxed line-clamp-2">{user.bio}</p>
      )}

      {/* Interests */}
      {user.interests?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {user.interests.slice(0, 5).map((interest) => (
            <span key={interest} className="tag-coral capitalize text-[11px]">
              {INTEREST_ICONS[interest] || "✦"} {interest}
            </span>
          ))}
          {user.interests.length > 5 && (
            <span className="tag-mist text-[11px]">+{user.interests.length - 5}</span>
          )}
        </div>
      )}

      {/* Budget */}
      {user.travelPreferences?.budgetRange && (
        <p className="text-xs text-ink/40 flex items-center gap-1.5">
          <span>💰</span>
          <span>
            Budget: ${user.travelPreferences.budgetRange.min?.toLocaleString()}
            –${user.travelPreferences.budgetRange.max?.toLocaleString()}
          </span>
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-mist">
        <button
          onClick={handleMessage}
          className="btn-primary flex-1 text-sm py-2"
        >
          💬 Message
        </button>
        <button
          onClick={() => navigate(`/profile/${user.id}`)}
          className="btn-secondary flex-1 text-sm py-2"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}
