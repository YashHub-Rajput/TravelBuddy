// File: client/src/services/chatService.js
import api from "./api.js";
export const chatService = {
  getMyChats:       ()          => api.get("/chats"),
  getOrCreateDirect:(userId)    => api.post(`/chats/direct/${userId}`),
  createGroupChat:  (data)      => api.post("/chats/group", data),
  getMessages:      (chatId, p) => api.get(`/chats/${chatId}/messages`, { params: p }),
};
