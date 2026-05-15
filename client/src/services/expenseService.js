// File: client/src/services/expenseService.js
import api from "./api.js";
export const expenseService = {
  createExpense:   (data)        => api.post("/expenses", data),
  getTripExpenses: (tripId)      => api.get(`/expenses/trip/${tripId}`),
  settleExpense:   (id, userId)  => api.patch(`/expenses/${id}/settle/${userId}`),
};
