// File: client/src/services/userService.js
import api from "./api.js";
export const userService = {
  getProfile:   (id)     => api.get(`/users/${id}`),
  updateProfile:(data)   => api.put("/users/profile", data),
  getReviews:   (id)     => api.get(`/users/${id}/reviews`),
  createReview: (id, d)  => api.post(`/users/${id}/reviews`, d),
  blockUser:    (id)     => api.post(`/users/${id}/block`),
  reportUser:   (id)     => api.post(`/users/${id}/report`),
};
