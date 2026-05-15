// File: client/src/pages/CreateTripPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripService } from "../services/tripService.js";
import TripForm from "../components/trips/TripForm.jsx";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = await tripService.createTrip(formData);
      navigate(`/trips/${data.trip._id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl text-ink">Create a Trip ✈️</h1>
        <p className="text-ink/50 mt-1.5">Share your adventure and find companions who match your travel style</p>
      </div>

      {/* Tips card */}
      <div className="card bg-teal/8 border-teal/20 mb-6 flex gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div className="text-sm text-teal-dark">
          <p className="font-semibold mb-1">Tips for a great listing</p>
          <ul className="space-y-0.5 text-teal/80">
            <li>• Add a clear description to attract the right companions</li>
            <li>• Be specific about your budget and travel style</li>
            <li>• Add tags so your trip appears in the right searches</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <TripForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
