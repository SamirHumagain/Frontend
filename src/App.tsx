import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Landing } from "./components/pages/Landing";
import { About } from "./components/pages/About";
import { Venues } from "./components/pages/Venues";
import { Services } from "./components/pages/Services";
import { EventPlanning } from "./components/pages/EventPlanning";
import { Auth } from "./components/pages/Auth";
import { UserDashboard } from "./components/pages/UserDashboard";
import { VenueOwnerDashboard } from "./components/pages/VenueOwnerDashboard";
import AdminDashboard from "./components/pages/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Landing />;
      case "about":
        return <About />;
      case "venues":
        return <Venues />;
      case "services":
        return <Services />;
      case "planning":
        return <EventPlanning />;
      case "login":
        return <Auth mode="login" onPageChange={setCurrentPage} />;
      case "signup":
        return <Auth mode="signup" onPageChange={setCurrentPage} />;
      case "user-dashboard":
        return <UserDashboard />;
      case "owner-dashboard":
        return <VenueOwnerDashboard />;
      case "admin-dashboard":
        return <AdminDashboard />;
      default:
        return <Landing onPageChange={setCurrentPage} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-text">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main>{renderPage()}</main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
