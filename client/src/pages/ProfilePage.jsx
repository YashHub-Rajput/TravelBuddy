// File: client/src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../services/userService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { chatService } from "../services/chatService.js";
import { PageLoader, Alert, StatusBadge } from "../components/ui/index.jsx";
import { getInitials, fmtDate } from "../utils/helpers.js";

const INTERESTS = [
  "hiking","beaches","culture","food","adventure",
  "photography","backpacking","luxury","history","wildlife",
];
const INTEREST_ICONS = {
  hiking:"🥾", beaches:"🏖️", culture:"🏛️", food:"🍜",
  adventure:"🧗", photography:"📸", backpacking:"🎒",
  luxury:"💎", history:"🏺", wildlife:"🦁",
};
const STYLES = ["budget","backpacker","mid-range","luxury"];

export default function ProfilePage() {
  const { id }       = useParams();
  const { user, updateUser } = useAuth();
  const navigate     = useNavigate();

  const isOwn = !id || id === user?._id;

  const [profile,  setProfile]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ type: "", text: "" });

  // Editable form state
  const [form, setForm] = useState({
    name: "", bio: "", interests: [],
    travelPreferences: { budgetRange: { min: 0, max: 5000 }, travelStyle: "mid-range" },
  });

  useEffect(() => {
    const targetId = isOwn ? user?._id : id;
    if (!targetId) return;

    Promise.all([
      userService.getProfile(targetId),
      userService.getReviews(targetId),
    ])
      .then(([profileData, reviewsData]) => {
        setProfile(profileData.user);
        setReviews(reviewsData.reviews);
        // Pre-populate form if own profile
        if (isOwn) {
          setForm({
            name: profileData.user.name || "",
            bio:  profileData.user.bio  || "",
            interests: profileData.user.interests || [],
            travelPreferences: profileData.user.travelPreferences || {
              budgetRange: { min: 0, max: 5000 },
              travelStyle: "mid-range",
            },
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user?._id]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await userService.updateProfile(form);
      setProfile(data.user);
      updateUser(data.user);
      setEditing(false);
      showMsg("success", "Profile updated!");
    } catch (err) {
      showMsg("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMessage = async () => {
    try {
      const data = await chatService.getOrCreateDirect(profile._id);
      navigate(`/chat/${data.chat._id}`);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleReport = async () => {
    if (!window.confirm("Report this user for inappropriate behaviour?")) return;
    try {
      await userService.reportUser(profile._id);
      showMsg("success", "User reported. Thank you for helping keep TravelBuddy safe.");
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const toggleInterest = (interest) =>
    setForm((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));

  if (loading) return <PageLoader />;
  if (!profile) return <div className="card text-center py-16 text-ink/40">Profile not found.</div>;

  const displayProfile = isOwn ? { ...profile, ...form } : profile;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {msg.text && <Alert type={msg.type || "success"} message={msg.text} />}

      {/* ── Profile hero ──────────────────────────────────────── */}
      <div className="card relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-teal/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="avatar w-20 h-20 text-2xl text-coral border-4 border-white shadow-card flex-shrink-0">
            {profile.avatar
              ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              : <span>{getInitials(profile.name)}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-display font-bold text-2xl text-ink flex items-center gap-2">
                  {profile.name}
                  {profile.isVerified && (
                    <span className="bg-teal/15 text-teal text-xs font-bold px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </h1>
                {profile.rating > 0 && (
                  <p className="text-ink/50 text-sm mt-0.5">
                    ⭐ {profile.rating} rating · {profile.reviewCount} review{profile.reviewCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {isOwn ? (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-secondary text-sm"
                  >
                    {editing ? "✕ Cancel" : "✏️ Edit Profile"}
                  </button>
                ) : (
                  <>
                    <button onClick={handleMessage} className="btn-primary text-sm">
                      💬 Message
                    </button>
                    <button
                      onClick={handleReport}
                      className="btn-ghost text-sm text-ink/40 hover:text-coral"
                    >
                      ⚑ Report
                    </button>
                  </>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-ink/60 text-sm leading-relaxed mt-3 max-w-lg">{profile.bio}</p>
            )}

            {/* Travel style & budget */}
            <div className="flex flex-wrap gap-3 mt-3">
              {profile.travelPreferences?.travelStyle && (
                <span className="tag-coral capitalize">
                  🎒 {profile.travelPreferences.travelStyle}
                </span>
              )}
              {profile.travelPreferences?.budgetRange && (
                <span className="tag-teal">
                  💰 ${profile.travelPreferences.budgetRange.min?.toLocaleString()}
                  –${profile.travelPreferences.budgetRange.max?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-mist">
            <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider mb-3">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="tag-coral capitalize">
                  {INTEREST_ICONS[i] || "✦"} {i}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit form ─────────────────────────────────────────── */}
      {editing && isOwn && (
        <form onSubmit={handleSave} className="card space-y-5 animate-slide-up">
          <h2 className="font-display font-bold text-xl text-ink">Edit Profile</h2>

          <div>
            <label className="input-label">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="input-label">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Tell other travelers about yourself…"
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="input-label">Travel Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({
                    ...p,
                    travelPreferences: { ...p.travelPreferences, travelStyle: s },
                  }))}
                  className={`p-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    form.travelPreferences.travelStyle === s
                      ? "bg-coral/10 border-coral text-coral"
                      : "bg-white border-mist-dark text-ink/60 hover:border-ink/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Interests</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-semibold capitalize transition-all ${
                    form.interests.includes(interest)
                      ? "bg-coral text-white border-coral"
                      : "bg-white text-ink/60 border-mist-dark hover:border-coral/40"
                  }`}
                >
                  {INTEREST_ICONS[interest]} {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Min Budget (USD)</label>
              <input
                type="number"
                value={form.travelPreferences.budgetRange.min}
                onChange={(e) => setForm((p) => ({
                  ...p,
                  travelPreferences: {
                    ...p.travelPreferences,
                    budgetRange: { ...p.travelPreferences.budgetRange, min: Number(e.target.value) },
                  },
                }))}
                className="input-field"
                min={0}
              />
            </div>
            <div>
              <label className="input-label">Max Budget (USD)</label>
              <input
                type="number"
                value={form.travelPreferences.budgetRange.max}
                onChange={(e) => setForm((p) => ({
                  ...p,
                  travelPreferences: {
                    ...p.travelPreferences,
                    budgetRange: { ...p.travelPreferences.budgetRange, max: Number(e.target.value) },
                  },
                }))}
                className="input-field"
                min={0}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-teal w-full py-3">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      )}

      {/* ── Reviews ───────────────────────────────────────────── */}
      <section className="card">
        <h2 className="font-display font-bold text-xl text-ink mb-4">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-ink/40">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 bg-mist/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="avatar w-8 h-8 text-xs text-coral">
                      <span>{getInitials(review.reviewer?.name)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-ink">{review.reviewer?.name}</p>
                      {review.trip?.destination && (
                        <p className="text-xs text-ink/40">Trip to {review.trip.destination}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? "text-gold" : "text-ink/20"}`}>★</span>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-ink/60 leading-relaxed">{review.comment}</p>
                )}
                <p className="text-xs text-ink/30">{fmtDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
