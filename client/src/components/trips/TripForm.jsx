// File: client/src/components/trips/TripForm.jsx
import { useState } from "react";
import { Alert } from "../ui/index.jsx";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "SGD"];
const TAGS = ["hiking", "beaches", "culture", "food", "adventure", "photography", "backpacking", "luxury", "history", "wildlife"];

const DEFAULTS = {
  destination: "", description: "", startDate: "", endDate: "",
  budget: "", currency: "USD", maxGroupSize: 4, tags: [], isPublic: true,
};

export default function TripForm({ initialValues = {}, onSubmit, loading }) {
  const [form,  setForm]  = useState({ ...DEFAULTS, ...initialValues });
  const [error, setError] = useState("");

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const toggleTag = (tag) =>
    set("tags", form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return setError("End date must be after start date.");
    }
    try {
      await onSubmit({ ...form, budget: Number(form.budget), maxGroupSize: Number(form.maxGroupSize) });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert type="error" message={error} />

      {/* Destination */}
      <div>
        <label className="input-label">Destination *</label>
        <input
          value={form.destination}
          onChange={(e) => set("destination", e.target.value)}
          placeholder="e.g. Kyoto, Japan"
          className="input-field"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="input-label">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Tell potential companions what this trip is about…"
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Start Date *</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="input-label">End Date *</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      {/* Budget + Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Budget *</label>
          <input
            type="number"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            placeholder="2500"
            min="0"
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="input-label">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            className="input-field"
          >
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Group size */}
      <div>
        <label className="input-label">Max Group Size</label>
        <input
          type="number"
          value={form.maxGroupSize}
          onChange={(e) => set("maxGroupSize", e.target.value)}
          min={1} max={20}
          className="input-field"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="input-label">Trip Tags</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold capitalize transition-all ${
                form.tags.includes(tag)
                  ? "bg-coral text-white border-coral shadow-glow-coral"
                  : "bg-white text-ink/60 border-mist-dark hover:border-coral/50 hover:text-coral"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Public toggle */}
      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-mist/50 transition-colors">
        <div
          onClick={() => set("isPublic", !form.isPublic)}
          className={`w-10 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${
            form.isPublic ? "bg-teal" : "bg-ink/20"
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
            form.isPublic ? "left-5" : "left-1"
          }`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Public trip</p>
          <p className="text-xs text-ink/50">Visible to all TravelBuddy users</p>
        </div>
      </label>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
        {loading ? "Saving…" : initialValues._id ? "Update Trip" : "🚀 Create Trip"}
      </button>
    </form>
  );
}
