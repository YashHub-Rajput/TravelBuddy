// File: client/src/hooks/useTrips.js
import { useState, useEffect } from "react";
import { tripService } from "../services/tripService.js";

/**
 * Fetches public trips with optional filter params.
 * Re-fetches whenever params change.
 */
export function useTrips(params = {}) {
  const [trips,      setTrips]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    tripService.getTrips(params)
      .then((data) => {
        if (cancelled) return;
        setTrips(data.trips);
        setPagination({ total: data.total, page: data.page, totalPages: data.totalPages });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load trips.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { trips, loading, error, pagination };
}
