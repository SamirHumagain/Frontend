// Auth page will need to handle user login and registration.
// API Needed: POST /api/auth/login/, POST /api/auth/register/
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Building,
  UserCheck,
  Shield,
} from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import { postRegisterApi, postLoginApi } from "../Api/postapi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

interface AuthProps {
  mode: "login" | "signup";
  onPageChange: (page: string) => void;
}

export function Auth({ mode, onPageChange }: AuthProps) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "venue_owner",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  // const { login, register } = useAuth();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    setPasswordStrength(checkPasswordStrength(password));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-secondary-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError("Name is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
      if (passwordStrength < 3) {
        setError(
          "Password is too weak. Please use at least 8 characters with uppercase, lowercase, and numbers."
        );
        return false;
      }
      if (!formData.agreeToTerms) {
        setError("Please agree to the terms and conditions");
        return false;
      }
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const loggedInUser = await login(formData.email, formData.password);
        if (loggedInUser) {
          toast.success("Login successful!");
          if (loggedInUser.role === "venue_owner") {
            onPageChange("owner-dashboard");
          } else if (loggedInUser.role === "user") {
            onPageChange("user-dashboard");
          } else if (loggedInUser.role === "admin") {
            onPageChange("admin-dashboard");
          }
        } else {
          setError("Invalid email or password");
        }
      } else {
        const success = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword,
          formData.role
        );
        if (success) {
          toast.success("Registration successful! Please log in.");
          onPageChange("home");
        } else {
          toast.error("Registration failed. Please try again.");
          setError("Registration failed. Please try again.");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { email: "user@demo.com", password: "demo123", role: "Regular User" },
    { email: "owner@demo.com", password: "demo123", role: "Venue Owner" },
    { email: "admin@demo.com", password: "demo123", role: "Admin" },
  ];

  const roleFeatures = {
    user: [
      "Browse and book venues",
      "Manage your bookings",
      "Save favorite venues",
      "Access event planning tools",
    ],
    venue_owner: [
      "List and manage venues",
      "Receive booking requests",
      "Track revenue and analytics",
      "Manage venue availability",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-background rounded-2xl shadow-xl p-8 lg:p-10 border border-primary-100"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-luxury-gradient rounded-xl mb-4"
            >
              {isLogin ? (
                <Shield className="text-white" size={32} />
              ) : (
                <UserCheck className="text-white" size={32} />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-text">
              {isLogin ? "Welcome Back" : "Join VenueBook"}
            </h2>
            <p className="text-text/70 mt-2">
              {isLogin
                ? "Sign in to your account"
                : "Create your account and start planning amazing events"}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-text mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-background text-text"
                    placeholder="Enter your full name"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40"
                  size={20}
                />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-background text-text outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-background text-text outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40 hover:text-text/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isLogin && formData.password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2"
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text/70">Password strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength <= 2
                          ? "text-red-600"
                          : passwordStrength <= 3
                          ? "text-secondary-600"
                          : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-primary-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </motion.div>
              )}
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/40"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-12 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-background text-text"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/40 hover:text-text/60 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      Passwords do not match
                    </p>
                  )}
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-text mb-4">
                  Account Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "user" }))
                    }
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      formData.role === "user"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-primary-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <User className="mr-2" size={20} />
                      <span className="font-medium">Event Planner</span>
                    </div>
                    <div className="text-sm text-text/70 mb-3">
                      Book venues for your events
                    </div>
                    <ul className="text-xs space-y-1">
                      {roleFeatures.user.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-secondary-400 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "venue_owner" }))
                    }
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      formData.role === "venue_owner"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-primary-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Building className="mr-2" size={20} />
                      <span className="font-medium">Venue Owner</span>
                    </div>
                    <div className="text-sm text-text/70 mb-3">
                      List and manage your venues
                    </div>
                    <ul className="text-xs space-y-1">
                      {roleFeatures.venue_owner.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-secondary-400 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-start"
              >
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agreeToTerms: e.target.checked,
                    }))
                  }
                  className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-text/70">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-luxury-gradient text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onPageChange(isLogin ? "signup" : "login")}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-primary-200">
            <h3 className="text-sm font-medium text-text mb-3">
              Demo Credentials:
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((cred, index) => (
                <div
                  key={index}
                  className="text-xs text-text/70 bg-primary-50 p-2 rounded border border-primary-100"
                >
                  <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - Image/Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Beautiful venue"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-transparent rounded-2xl"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold mb-2">
                {isLogin ? "Welcome Back to VenueBook" : "Start Your Journey"}
              </h3>
              <p className="text-lg opacity-90">
                {isLogin
                  ? "Access your dashboard and manage your bookings"
                  : "Join thousands of users planning amazing events"}
              </p>
            </div>

            {/* Floating benefits */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -top-6 -right-6 bg-background rounded-xl shadow-xl p-6 max-w-xs border border-secondary-200"
              >
                <h4 className="font-semibold text-text mb-3">
                  Why Choose VenueBook?
                </h4>
                <ul className="space-y-2 text-sm text-text/70">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2"></div>
                    500+ verified venues
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2"></div>
                    Secure booking system
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2"></div>
                    24/7 customer support
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full mr-2"></div>
                    Event planning tools
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
