// File: client/src/services/matchService.js
import api from "./api.js";
export const matchService = {
  getMatches: (params) => api.get("/matches", { params }),
};
