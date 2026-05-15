// File: client/src/pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Alert } from "../components/ui/index.jsx";

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

const STEPS = ["Account", "About You", "Preferences"];

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [step,    setStep]    = useState(0);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    bio: "",
    interests: [],
    travelPreferences: {
      budgetRange: { min: 500, max: 3000 },
      travelStyle: "mid-range",
    },
  });

  const setField = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setPref  = (field, value) =>
    setForm((p) => ({ ...p, travelPreferences: { ...p.travelPreferences, [field]: value } }));

  const toggleInterest = (i) =>
    setField("interests",
      form.interests.includes(i)
        ? form.interests.filter((x) => x !== i)
        : [...form.interests, i]
    );

  const next = (e) => {
    e.preventDefault();
    setError("");
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed.");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding (same as login) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-coral rounded-2xl flex items-center justify-center text-2xl shadow-glow-coral">✈️</div>
          <span className="font-display font-bold text-2xl text-white">TravelBuddy</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="font-display font-bold text-5xl text-white leading-tight">
            Your adventure<br />
            <span className="text-gradient-coral">starts here.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Join thousands of travelers who have found their ideal companions for exploring the world.
          </p>
          <div className="space-y-3 max-w-sm">
            {[
              "✦ Smart matching based on travel style",
              "✦ Real-time group chat for trip planning",
              "✦ Split expenses effortlessly",
              "✦ Verified profiles for safe travel",
            ].map((f) => (
              <p key={f} className="text-white/60 text-sm">{f}</p>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs relative z-10">© 2025 TravelBuddy.</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream overflow-y-auto">
        <div className="w-full max-w-md py-6">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-coral rounded-2xl flex items-center justify-center text-xl">✈️</div>
            <span className="font-display font-bold text-xl text-ink">TravelBuddy</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i < step ? "bg-teal text-white"
                  : i === step ? "bg-coral text-white shadow-glow-coral"
                  : "bg-mist text-ink/40"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-ink" : "text-ink/40"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 w-8 rounded ${i < step ? "bg-teal" : "bg-mist-dark"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="font-display font-bold text-3xl text-ink">
              {step === 0 && "Create account"}
              {step === 1 && "Tell us about you"}
              {step === 2 && "Travel preferences"}
            </h2>
            <p className="text-ink/50 mt-1.5 text-sm">
              {step === 0 && "Set up your login credentials"}
              {step === 1 && "Help others know who they'd be traveling with"}
              {step === 2 && "We'll use this to find your best matches"}
            </p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={next} className="space-y-4 mt-5">
            {/* Step 0 – Credentials */}
            {step === 0 && (
              <>
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Alex Johnson"
                    className="input-field"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
              </>
            )}

            {/* Step 1 – About */}
            {step === 1 && (
              <>
                <div>
                  <label className="input-label">Short Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setField("bio", e.target.value)}
                    placeholder="Tell fellow travelers a bit about yourself…"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="input-label">Interests</label>
                  <p className="text-xs text-ink/40 mb-2">Pick everything that excites you</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-2xl border font-semibold capitalize transition-all ${
                          form.interests.includes(interest)
                            ? "bg-coral text-white border-coral shadow-glow-coral"
                            : "bg-white text-ink/60 border-mist-dark hover:border-coral/40 hover:text-coral"
                        }`}
                      >
                        <span>{INTEREST_ICONS[interest]}</span>
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2 – Preferences */}
            {step === 2 && (
              <>
                <div>
                  <label className="input-label">Travel Style</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {STYLES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPref("travelStyle", s)}
                        className={`p-3 rounded-2xl border text-sm font-semibold capitalize text-left transition-all ${
                          form.travelPreferences.travelStyle === s
                            ? "bg-coral/10 border-coral text-coral"
                            : "bg-white border-mist-dark text-ink/60 hover:border-ink/20"
                        }`}
                      >
                        {s === "budget" && "💵 "}
                        {s === "backpacker" && "🎒 "}
                        {s === "mid-range" && "✈️ "}
                        {s === "luxury" && "💎 "}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Budget Range (USD)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-ink/40 mb-1">Minimum</p>
                      <input
                        type="number"
                        value={form.travelPreferences.budgetRange.min}
                        onChange={(e) => setPref("budgetRange", {
                          ...form.travelPreferences.budgetRange,
                          min: Number(e.target.value),
                        })}
                        min={0}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-ink/40 mb-1">Maximum</p>
                      <input
                        type="number"
                        value={form.travelPreferences.budgetRange.max}
                        onChange={(e) => setPref("budgetRange", {
                          ...form.travelPreferences.budgetRange,
                          max: Number(e.target.value),
                        })}
                        min={0}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : step < STEPS.length - 1 ? "Continue →" : "🚀 Create Account"}
            </button>
          </form>

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full text-center text-sm text-ink/40 hover:text-ink/70 mt-3 transition-colors"
            >
              ← Back
            </button>
          )}

          <p className="text-center text-sm text-ink/50 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-coral font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
