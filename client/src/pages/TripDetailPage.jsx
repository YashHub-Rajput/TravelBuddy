// File: client/src/pages/TripDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { tripService } from "../services/tripService.js";
import { chatService } from "../services/chatService.js";
import { useAuth } from "../context/AuthContext.jsx";
import TripForm from "../components/trips/TripForm.jsx";
import ExpensePanel from "../components/trips/ExpensePanel.jsx";
import { PageLoader, StatusBadge, Alert } from "../components/ui/index.jsx";
import { fmtDate, fmtCurrency, tripDuration, getInitials } from "../utils/helpers.js";

const TABS = ["Details", "Members", "Expenses"];

export default function TripDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [trip,          setTrip]          = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [editing,       setEditing]       = useState(false);
  const [activeTab,     setActiveTab]     = useState("Details");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [msg,           setMsg]           = useState({ type: "", text: "" });

  useEffect(() => {
    tripService.getTripById(id)
      .then((d) => setTrip(d.trip))
      .catch(() => navigate("/browse"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!trip)   return null;

  const isCreator = trip.creator?._id === user?._id;
  const isMember  = trip.members?.some(
    (m) => m.user?._id === user?._id && m.status === "accepted"
  );
  const hasPending = trip.members?.some(
    (m) => m.user?._id === user?._id && m.status === "pending"
  );
  const acceptedMembers = trip.members?.filter((m) => m.status === "accepted") || [];
  const spotsLeft = trip.maxGroupSize - acceptedMembers.length;
  const duration  = tripDuration(trip.startDate, trip.endDate);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const handleUpdate = async (formData) => {
    setUpdateLoading(true);
    try {
      const data = await tripService.updateTrip(id, formData);
      setTrip(data.trip);
      setEditing(false);
      showMsg("success", "Trip updated successfully!");
    } catch (err) {
      showMsg("error", err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this trip? This cannot be undone.")) return;
    try {
      await tripService.deleteTrip(id);
      navigate("/dashboard");
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleJoin = async () => {
    try {
      await tripService.joinTrip(id);
      showMsg("success", "Join request sent to the trip creator! 🎉");
      // Reload trip to show pending status
      const data = await tripService.getTripById(id);
      setTrip(data.trip);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleMemberStatus = async (memberId, status) => {
    try {
      await tripService.updateMember(id, memberId, status);
      const data = await tripService.getTripById(id);
      setTrip(data.trip);
      showMsg("success", `Member ${status}.`);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  const handleGroupChat = async () => {
    try {
      const memberIds = acceptedMembers.map((m) => m.user._id);
      const data = await chatService.createGroupChat({
        name: `${trip.destination} Trip`,
        tripId: trip._id,
        participantIds: memberIds,
      });
      navigate(`/chat/${data.chat._id}`);
    } catch (err) {
      showMsg("error", err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-sm text-ink/50 hover:text-ink -ml-2"
      >
        ← Back
      </button>

      {/* Alert banner */}
      {msg.text && <Alert type={msg.type || "success"} message={msg.text} />}

      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className="card-ink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl lg:text-4xl text-white">
                {trip.destination}
              </h1>
              <p className="text-white/50 mt-1.5 flex items-center gap-2 text-sm">
                <span>📅</span>
                {fmtDate(trip.startDate)} → {fmtDate(trip.endDate)}
                <span className="text-white/25">·</span>
                <span>{duration} days</span>
              </p>
            </div>
            <StatusBadge status={trip.status} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-2xl mb-6">
            <div>
              <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">Budget</p>
              <p className="font-display font-bold text-white">{fmtCurrency(trip.budget, trip.currency)}</p>
            </div>
            <div>
              <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">Group</p>
              <p className="font-display font-bold text-white">
                {acceptedMembers.length + 1}/{trip.maxGroupSize}
                {spotsLeft > 0 && <span className="text-teal text-sm ml-1.5">({spotsLeft} open)</span>}
              </p>
            </div>
            <div>
              <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-0.5">Duration</p>
              <p className="font-display font-bold text-white">{duration} days</p>
            </div>
          </div>

          {/* Tags */}
          {trip.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {trip.tags.map((tag) => (
                <span key={tag} className="bg-white/10 text-white/70 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {isCreator && (
              <>
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  {editing ? "✕ Cancel" : "✏️ Edit"}
                </button>
                {acceptedMembers.length > 0 && (
                  <button
                    onClick={handleGroupChat}
                    className="flex items-center gap-1.5 bg-teal/80 hover:bg-teal text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    💬 Group Chat
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 bg-coral/70 hover:bg-coral text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  🗑️ Delete
                </button>
              </>
            )}

            {!isCreator && !isMember && !hasPending && spotsLeft > 0 && (
              <button onClick={handleJoin} className="btn-primary text-sm">
                🙋 Request to Join
              </button>
            )}

            {hasPending && (
              <span className="bg-gold/20 text-gold-dark text-sm font-semibold px-4 py-2 rounded-xl">
                ⏳ Request Pending
              </span>
            )}

            {isMember && (
              <span className="bg-teal/20 text-teal text-sm font-semibold px-4 py-2 rounded-xl">
                ✓ You're a Member
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card animate-slide-up">
          <h2 className="font-display font-bold text-xl text-ink mb-5">Edit Trip</h2>
          <TripForm
            initialValues={{
              ...trip,
              startDate: trip.startDate?.split("T")[0],
              endDate:   trip.endDate?.split("T")[0],
            }}
            onSubmit={handleUpdate}
            loading={updateLoading}
          />
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-0.5 bg-mist p-1 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-white text-ink shadow-sm"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card animate-fade-in">
        {/* ── Details ──────────────────────────────────────────── */}
        {activeTab === "Details" && (
          <div className="space-y-5">
            <div>
              <h3 className="font-display font-bold text-lg text-ink mb-2">About this trip</h3>
              <p className="text-ink/60 leading-relaxed">
                {trip.description || "No description provided."}
              </p>
            </div>

            <div className="h-px bg-mist" />

            <div>
              <h3 className="font-display font-bold text-base text-ink mb-3">Trip Creator</h3>
              <Link to={`/profile/${trip.creator?._id}`} className="flex items-center gap-3 group w-fit">
                <div className="avatar w-11 h-11 text-sm text-coral">
                  {trip.creator?.avatar
                    ? <img src={trip.creator.avatar} alt="" className="w-full h-full object-cover" />
                    : <span>{getInitials(trip.creator?.name)}</span>
                  }
                </div>
                <div>
                  <p className="font-semibold text-ink group-hover:text-coral transition-colors flex items-center gap-1.5">
                    {trip.creator?.name}
                    {trip.creator?.isVerified && <span className="text-teal text-xs bg-teal/10 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                  </p>
                  {trip.creator?.rating > 0 && (
                    <p className="text-xs text-ink/50">⭐ {trip.creator.rating} rating</p>
                  )}
                </div>
              </Link>
            </div>

            <div className="h-px bg-mist" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-mist/50 rounded-2xl p-4">
                <p className="text-ink/40 text-xs font-medium uppercase tracking-wider mb-1">Visibility</p>
                <p className="font-semibold text-ink">{trip.isPublic ? "🌐 Public" : "🔒 Private"}</p>
              </div>
              <div className="bg-mist/50 rounded-2xl p-4">
                <p className="text-ink/40 text-xs font-medium uppercase tracking-wider mb-1">Currency</p>
                <p className="font-semibold text-ink">{trip.currency}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Members ──────────────────────────────────────────── */}
        {activeTab === "Members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-ink">
                Trip Members ({acceptedMembers.length + 1}/{trip.maxGroupSize})
              </h3>
            </div>

            {/* Creator */}
            <div className="flex items-center justify-between p-3 bg-teal/8 rounded-2xl border border-teal/20">
              <Link to={`/profile/${trip.creator?._id}`} className="flex items-center gap-3">
                <div className="avatar w-10 h-10 text-sm text-coral">
                  <span>{getInitials(trip.creator?.name)}</span>
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{trip.creator?.name}</p>
                  <p className="text-xs text-ink/40">Trip Creator</p>
                </div>
              </Link>
              <span className="tag-teal">Creator</span>
            </div>

            {/* Members */}
            {trip.members?.length === 0 ? (
              <div className="text-center py-8 text-ink/40">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm">No members yet</p>
              </div>
            ) : (
              trip.members.map((member) => (
                <div
                  key={member.user?._id}
                  className="flex items-center justify-between p-3 bg-white border border-mist rounded-2xl hover:border-mist-dark transition-colors"
                >
                  <Link to={`/profile/${member.user?._id}`} className="flex items-center gap-3">
                    <div className="avatar w-10 h-10 text-sm text-coral">
                      <span>{getInitials(member.user?.name)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">
                        {member.user?.name}
                        {member.user?.isVerified && <span className="text-teal ml-1 text-xs">✓</span>}
                      </p>
                      <p className="text-xs text-ink/40">
                        Joined {fmtDate(member.joinedAt)}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={member.status} />
                    {isCreator && member.status === "pending" && (
                      <div className="flex gap-1.5 ml-2">
                        <button
                          onClick={() => handleMemberStatus(member.user._id, "accepted")}
                          className="text-xs bg-teal/15 text-teal font-semibold px-2.5 py-1 rounded-xl hover:bg-teal/25 transition-colors"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleMemberStatus(member.user._id, "rejected")}
                          className="text-xs bg-coral/10 text-coral font-semibold px-2.5 py-1 rounded-xl hover:bg-coral/20 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Expenses ─────────────────────────────────────────── */}
        {activeTab === "Expenses" && (
          isCreator || isMember
            ? <ExpensePanel trip={trip} />
            : (
              <div className="text-center py-10 text-ink/40">
                <p className="text-3xl mb-2">💳</p>
                <p className="text-sm">Join this trip to view and add expenses</p>
              </div>
            )
        )}
      </div>
    </div>
  );
}
