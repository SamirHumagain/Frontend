import { Navigation } from "./components/Navigation";
import { Routes, Route, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const handlePageChange = (page: string) => {
    if (page === "owner-dashboard") {
      navigate("/owner-dashboard");
    } else if (page === "user-dashboard") {
      navigate("/user-dashboard");
    } else if (page === "admin-dashboard") {
      navigate("/admin-dashboard");
    } else if (page === "login") {
      navigate("/login");
    } else if (page === "signup") {
      navigate("/signup");
    } else {
      navigate("/");
    }
  };
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
              element={<Auth mode="login" onPageChange={handlePageChange} />}
            />
            <Route
              path="/signup"
              element={<Auth mode="signup" onPageChange={handlePageChange} />}
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
