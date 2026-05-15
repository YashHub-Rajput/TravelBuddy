// File: client/src/services/tripService.js
import api from "./api.js";
export const tripService = {
  getTrips:     (params) => api.get("/trips", { params }),
  getMyTrips:   ()       => api.get("/trips/my"),
  getTripById:  (id)     => api.get(`/trips/${id}`),
  createTrip:   (data)   => api.post("/trips", data),
  updateTrip:   (id, d)  => api.put(`/trips/${id}`, d),
  deleteTrip:   (id)     => api.delete(`/trips/${id}`),
  joinTrip:     (id)     => api.post(`/trips/${id}/join`),
  updateMember: (tripId, userId, status) =>
    api.patch(`/trips/${tripId}/members/${userId}`, { status }),
};
