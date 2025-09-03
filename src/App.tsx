import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Routes, Route } from "react-router-dom";
import { Landing } from "./components/pages/Landing";
import { About } from "./components/pages/About";
import { Venues } from "./components/pages/Venues";
import { Services } from "./components/pages/Services";
import { EventPlanning } from "./components/pages/EventPlanning";
import { Auth } from "./components/pages/Auth";
import { UserDashboard } from "./components/pages/UserDashboard";
import { VenueOwnerDashboard } from "./components/pages/VenueOwnerDashboard";
import AdminDashboard from "./components/pages/AdminDashboard";
import VenueDetails from "./components/pages/VenueDetails";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-text">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/planning" element={<EventPlanning />} />
            <Route
              path="/login"
              element={<Auth mode="login" onPageChange={setCurrentPage} />}
            />
            <Route
              path="/signup"
              element={<Auth mode="signup" onPageChange={setCurrentPage} />}
            />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/owner-dashboard" element={<VenueOwnerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
