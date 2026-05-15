// File: client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

import LoginPage      from "./pages/LoginPage.jsx";
import SignupPage     from "./pages/SignupPage.jsx";
import DashboardPage  from "./pages/DashboardPage.jsx";
import BrowseTripsPage from "./pages/BrowseTripsPage.jsx";
import CreateTripPage from "./pages/CreateTripPage.jsx";
import TripDetailPage from "./pages/TripDetailPage.jsx";
import ChatPage       from "./pages/ChatPage.jsx";
import ProfilePage    from "./pages/ProfilePage.jsx";
import MatchesPage    from "./pages/MatchesPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/browse" element={<BrowseTripsPage />} />

            {/* Protected routes – wrapped in Layout via ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"    element={<DashboardPage />} />
              <Route path="/trips/new"    element={<CreateTripPage />} />
              <Route path="/trips/:id"    element={<TripDetailPage />} />
              <Route path="/chat"         element={<ChatPage />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/profile"      element={<ProfilePage />} />
              <Route path="/profile/:id"  element={<ProfilePage />} />
              <Route path="/matches"      element={<MatchesPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
