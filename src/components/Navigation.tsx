import React, { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  console.log("Authenticated?", isAuthenticated);
  console.log("User:", user);

  const navItems = [
    { name: "Home", page: "home" },
    { name: "About", page: "about" },
    { name: "Venues", page: "venues" },
    { name: "Services", page: "services" },
    // { name: "Event Planning", page: "planning" },
  ];

  const handleNavClick = (page: string) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    onPageChange("home");
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-primary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-luxury-gradient bg-clip-text text-transparent cursor-pointer"
              onClick={() => handleNavClick("home")}
            >
              VenueBook
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <motion.button
                  key={item.page}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.page
                      ? "bg-primary-100 text-primary-600"
                      : "text-text hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() =>
                    handleNavClick(
                      user?.role === "admin"
                        ? "admin-dashboard"
                        : user?.role === "venue_owner"
                        ? "owner-dashboard"
                        : "user-dashboard"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-luxury-gradient text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <User size={16} />
                  <span>Dashboard</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-text hover:text-primary-600 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleNavClick("login")}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleNavClick("signup")}
                  className="px-4 py-2 bg-luxury-gradient text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Sign Up
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-primary-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    currentPage === item.page
                      ? "bg-primary-100 text-primary-600"
                      : "text-text hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4 border-t border-primary-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        handleNavClick(
                          user?.role === "admin"
                            ? "admin-dashboard"
                            : user?.role === "venue_owner"
                            ? "owner-dashboard"
                            : "user-dashboard"
                        )
                      }
                      className="flex items-center space-x-2 w-full px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <User size={16} />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-text hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleNavClick("login")}
                      className="block w-full text-left px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleNavClick("signup")}
                      className="block w-full text-left px-3 py-2 bg-luxury-gradient text-white rounded-lg hover:shadow-lg transition-all duration-300"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
