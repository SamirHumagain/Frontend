import { useState, useEffect } from "react";
import ProfileEditForm from "./ProfileEditForm";

type UserProfileSectionProps = {
  profile: any;
  setProfile: (p: any) => void;
};

function UserProfileSection({ profile, setProfile }: UserProfileSectionProps) {
  const [editMode, setEditMode] = useState(false);
  if (!profile) {
    return <div className="text-gray-500">No profile data loaded.</div>;
  }
  return (
    <>
      {editMode ? (
        <ProfileEditForm
          profile={profile}
          setProfile={(p: any) => {
            setProfile(p);
            setEditMode(false);
          }}
        />
      ) : (
        <div className="w-full h-full bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <img
            src={
              profile.profile_image ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(profile.name || profile.email || "User")
            }
            alt="Profile"
            className="w-24 h-24 rounded-full border mb-4"
          />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {profile.name || profile.email}
          </div>
          <div className="text-gray-600 mb-2">{profile.email}</div>
          <div className="mb-2 text-gray-700">
            <span className="font-medium">Phone:</span> {profile.phone || "-"}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-medium">Address:</span>{" "}
            {profile.address || "-"}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-medium">User Type:</span> {profile.user_type}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-medium">Joined:</span>{" "}
            {profile.date_joined
              ? new Date(profile.date_joined).toLocaleDateString()
              : "-"}
          </div>
          <div className="mb-4">
            <span
              className={`text-sm font-semibold px-2 py-1 rounded ${
                profile.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {profile.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <button
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </>
  );
}
import { motion } from "framer-motion";
import { Calendar, Users, Trash2, Eye } from "lucide-react";

import { getUserBookings } from "../Api/getapi";
import axiosInstance from "../Api/urls";
import { cancelBooking } from "../Api/postapi";
import { getBookingDetail } from "../Api/bookingActions";

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for view
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);
  const [modalType, setModalType] = useState<null | "view">(null);

  // Dropdown filter state
  const [statusFilter, setStatusFilter] = useState<string>("All Status");

  const fetchBookings = () => {
    setLoading(true);
    Promise.all([
      getUserBookings(),
      axiosInstance.get("/api/user-dashboard/profile/"),
    ])
      .then(([bookingsRes, profileRes]) => {
        setBookings(bookingsRes.data);
        setProfile(profileRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Refetch bookings/profile when switching to bookings tab
  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  // Button handlers
  const handleView = async (bookingId: number) => {
    try {
      setVenueLoading(true);
      setVenueError(null);
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data);
      console.log("Full booking detail response:", res.data);
      // Step 1: Get event ID from booking
      const eventId = res.data.event;
      let venueId = undefined;
      if (eventId) {
        try {
          // Step 2: Fetch event details
          const eventRes = await axiosInstance.get(`/api/events/${eventId}/`);
          console.log("Event API response:", eventRes.data);
          // Step 3: Get venue ID from event
          venueId = eventRes.data.venue;
          if (venueId) {
            try {
              // Step 4: Fetch venue details
              const venueRes = await axiosInstance.get(
                `/api/venues/${venueId}/`
              );
              console.log("Venue API response:", venueRes.data);
              setSelectedVenue(venueRes.data);
            } catch (err) {
              setSelectedVenue(null);
              setVenueError("Venue details could not be loaded.");
            }
          } else {
            setSelectedVenue(null);
            setVenueError("Venue ID not found in event.");
          }
        } catch (err) {
          setSelectedVenue(null);
          setVenueError("Event details could not be loaded.");
        }
      } else {
        setSelectedVenue(null);
        setVenueError("Event ID not found in booking.");
      }
      setVenueLoading(false);
      setModalType("view");
    } catch (e) {
      setVenueLoading(false);
      setVenueError("Failed to fetch booking or venue details.");
      alert("Failed to fetch booking or venue details");
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch (e) {
      alert("Failed to cancel booking");
    }
  };

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <nav className="flex-1 flex space-x-8 px-6 py-4" aria-label="Tabs">
            {[
              { id: "bookings", label: "Bookings" },
              { id: "favorites", label: "Favorites" },
              { id: "profile", label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 py-2 font-medium text-sm rounded-md focus:outline-none transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Bookings
                </h2>
                <div className="flex space-x-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {(() => {
                  // Filter bookings by status
                  const filtered =
                    statusFilter === "All Status"
                      ? bookings
                      : bookings.filter(
                          (b) =>
                            b.status &&
                            b.status.toLowerCase() ===
                              statusFilter.toLowerCase()
                        );
                  if (filtered.length === 0) {
                    return (
                      <div className="text-gray-500 text-center">
                        No bookings found.
                      </div>
                    );
                  }
                  return filtered.map((booking, index) => {
                    // Use nested event/venue data if available
                    const event = booking.event || {};
                    const venue = event.venue || {};
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow w-full"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={
                                venue.image || "https://via.placeholder.com/64"
                              }
                              alt={venue.name || "Venue"}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name || "Venue Name"}
                              </h3>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-1" />
                                  {event.date
                                    ? new Date(event.date).toLocaleDateString()
                                    : "-"}
                                </div>
                                <div className="flex items-center">
                                  <Users size={16} className="mr-1" />
                                  {venue.capacity || 0} guests
                                </div>
                                <div className="flex items-center">
                                  Rs {venue.price || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                onClick={() => handleView(booking.id)}
                                title="View Venue Details"
                              >
                                <Eye size={18} />
                              </motion.button>
                              {booking.status === "pending" && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  onClick={() => handleCancel(booking.id)}
                                  title="Cancel Booking"
                                >
                                  <Trash2 size={18} />
                                </motion.button>
                              )}
                              {/* Booking View Modal (simple implementation) */}
                              {modalType && selectedBooking && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                                    <button
                                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                                      onClick={() => {
                                        setModalType(null);
                                        setSelectedBooking(null);
                                        setSelectedVenue(null);
                                        setVenueError(null);
                                      }}
                                    >
                                      &times;
                                    </button>
                                    {modalType === "view" && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                          Venue Details
                                        </h3>
                                        {venueLoading ? (
                                          <div className="text-center py-8">
                                            Loading venue details...
                                          </div>
                                        ) : venueError ? (
                                          <div className="text-center text-red-500 py-8">
                                            {venueError}
                                          </div>
                                        ) : (
                                          <>
                                            <div className="mb-4 flex flex-col items-center">
                                              <img
                                                src={
                                                  selectedVenue?.image ||
                                                  selectedBooking.event?.venue
                                                    ?.image ||
                                                  "https://via.placeholder.com/128"
                                                }
                                                alt={
                                                  selectedVenue?.name ||
                                                  selectedBooking.event?.venue
                                                    ?.name ||
                                                  "Venue"
                                                }
                                                className="w-32 h-32 rounded-lg object-cover mb-2"
                                              />
                                              <div className="text-xl font-bold text-gray-900 mb-1">
                                                {selectedVenue?.name ||
                                                  selectedBooking.event?.venue
                                                    ?.name ||
                                                  "Venue Name"}
                                              </div>
                                              <div className="text-gray-600 mb-2">
                                                {selectedVenue?.location ||
                                                  selectedBooking.event?.venue
                                                    ?.location ||
                                                  "Location not specified"}
                                              </div>
                                            </div>
                                            <div className="mb-2">
                                              <b>Status:</b>{" "}
                                              {selectedBooking.status}
                                            </div>
                                            <div className="mb-2">
                                              <b>Event:</b>{" "}
                                              {selectedBooking.event?.name}
                                            </div>
                                            <div className="mb-2">
                                              <b>Date:</b>{" "}
                                              {selectedBooking.event?.date
                                                ? new Date(
                                                    selectedBooking.event.date
                                                  ).toLocaleDateString()
                                                : "-"}
                                            </div>
                                            <div className="mb-2">
                                              <b>Guests:</b>{" "}
                                              {selectedVenue?.capacity ||
                                                selectedBooking.event?.venue
                                                  ?.capacity}
                                            </div>
                                            <div className="mb-2">
                                              <b>Price:</b> Rs{" "}
                                              {selectedVenue?.price ||
                                                selectedBooking.event?.venue
                                                  ?.price}
                                            </div>
                                            <div className="mb-2">
                                              <b>Description:</b>{" "}
                                              {selectedVenue?.description ||
                                                selectedBooking.event?.venue
                                                  ?.description ||
                                                "-"}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Favorite Venues
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* No favorite venues implementation yet */}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                My Profile
              </h2>
              <UserProfileSection profile={profile} setProfile={setProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
