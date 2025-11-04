import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import ProfileEditForm from "./ProfileEditForm";
import toast from "react-hot-toast";

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
import {
  getFavoriteVenues,
  deleteFavoriteVenue,
} from "../Api/venueRatingFavoriteApi";

export function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  // Favorite venues state and effect
  const [favoriteVenues, setFavoriteVenues] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<{ [venueId: string]: number }>(
    {}
  );
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  useEffect(() => {
    if (activeTab === "favorites" && user) {
      setFavoriteLoading(true);
      setFavoriteError(null);
      // Only fetch favorites for the current user
      getFavoriteVenues()
        .then(async (res) => {
          const favorites = Array.isArray(res.data) ? res.data : [];
          // Fetch full venue details for each favorite
          const venueDetails = await Promise.all(
            favorites.map(async (fav) => {
              try {
                const venueRes = await axiosInstance.get(
                  `/api/venues/${fav.venue}/`
                );
                return { ...fav, ...venueRes.data };
              } catch {
                return null;
              }
            })
          );
          // Filter out any nulls (venues that no longer exist)
          setFavoriteVenues(venueDetails.filter(Boolean));
          // Fetch user ratings for all favorite venues
          const fetchRatings = async () => {
            const ratings: { [venueId: string]: number } = {};
            for (const venue of venueDetails.filter(Boolean)) {
              try {
                const rRes = await import("../Api/venueRatingFavoriteApi");
                const ratingRes = await rRes.getVenueRatings(venue.id);
                if (ratingRes.data && ratingRes.data.length > 0) {
                  ratings[venue.id] = ratingRes.data[0].rating;
                }
              } catch {}
            }
            setUserRatings(ratings);
          };
          fetchRatings();
          setFavoriteLoading(false);
        })
        .catch(() => {
          setFavoriteError("Failed to load favorite venues");
          setFavoriteLoading(false);
        });
    }
  }, [activeTab]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for view
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  // Removed unused venueLoading and venueError
  const [modalType, setModalType] = useState<null | "view">(null);
  // Store event API response
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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
      setSelectedEvent(null);
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data);

      const eventId = res.data.event;
      let venueId = undefined;
      if (eventId) {
        try {
          // Step 2: Fetch event details
          const eventRes = await axiosInstance.get(`/api/events/${eventId}/`);
          setSelectedEvent(eventRes.data);
          // Step 3: Get venue ID from event
          venueId = eventRes.data.venue;
        } catch (err) {
          setSelectedVenue(null);
          // Removed unused venueError
        }
      } else {
        setSelectedVenue(null);
        // Removed unused venueError
      }
      // Removed unused venueLoading
      setModalType("view");
    } catch (e) {
      // Removed unused venueLoading and venueError
      toast.error("Failed to fetch booking or venue details");
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    try {
      await cancelBooking(bookingId);
      fetchBookings();
    } catch (e) {
      toast.error("Failed to cancel booking");
    }
  };

  function getStatusColor(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
                    <option value="All Status">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
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
                    // Use same details as modal for card
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
                                venue.images && venue.images.length > 0
                                  ? venue.images[0].image
                                  : venue.image ||
                                    "https://via.placeholder.com/64"
                              }
                              alt={venue.name || "Venue"}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name || "Venue Name"}
                              </h3>
                              <div className="text-gray-500 mb-2">
                                {event.location ||
                                  venue.location ||
                                  venue.location_name ||
                                  "Location not specified"}
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-1" />
                                  {event.date
                                    ? new Date(event.date).toLocaleDateString()
                                    : "-"}
                                </div>
                                <div className="flex items-center">
                                  <Users size={16} className="mr-1" />
                                  {venue.capacity || "-"} guests
                                </div>
                                <div className="flex items-center">
                                  Rs {venue.price || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                                ${
                                  booking.status === "approved"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : getStatusColor(booking.status)
                                }
                              `}
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
                              {/* Booking View Modal moved to top-level below the bookings list */}
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

          {/* Top-level Booking View Modal */}
          {modalType === "view" && selectedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-0 max-w-md w-full relative animate-fadeIn">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                  onClick={() => {
                    setModalType(null);
                    setSelectedBooking(null);
                    setSelectedVenue(null);
                    setSelectedEvent(null);
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
                <div className="px-8 py-8 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shadow mb-4 border-4 border-primary-100">
                    <img
                      src={
                        selectedVenue?.image ||
                        selectedEvent?.venue?.image ||
                        selectedBooking.event?.venue?.image ||
                        "https://via.placeholder.com/128"
                      }
                      alt={
                        selectedVenue?.name ||
                        selectedEvent?.venue?.name ||
                        selectedBooking.event?.venue?.name ||
                        "Venue"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-2xl font-extrabold text-primary-700 mb-1 text-center">
                    {selectedVenue?.name ||
                      selectedEvent?.venue?.name ||
                      selectedBooking.event?.venue?.name ||
                      "Venue Name"}
                  </div>
                  <div className="text-gray-500 mb-2 text-center">
                    {selectedEvent?.location ||
                      selectedVenue?.location ||
                      selectedVenue?.location_name ||
                      selectedBooking.event?.location ||
                      selectedBooking.event?.venue?.location ||
                      selectedBooking.event?.venue?.location_name ||
                      "Location not specified"}
                  </div>
                  {/* Status pill */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
                        ${
                          selectedBooking.status === "approved"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : selectedBooking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : selectedBooking.status === "cancelled"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }
                      `}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full mb-4">
                    <div className="text-right text-gray-700 font-semibold">
                      Date:
                    </div>
                    <div className="text-left text-gray-900">
                      {selectedEvent?.date
                        ? new Date(selectedEvent.date).toLocaleDateString()
                        : selectedBooking.event?.date
                        ? new Date(
                            selectedBooking.event.date
                          ).toLocaleDateString()
                        : selectedVenue?.event_date
                        ? new Date(
                            selectedVenue.event_date
                          ).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="text-right text-gray-700 font-semibold">
                      Guests:
                    </div>
                    <div className="text-left text-gray-900">
                      {selectedVenue?.capacity ||
                        selectedEvent?.venue?.capacity ||
                        selectedBooking.event?.venue?.capacity ||
                        "-"}
                    </div>
                    <div className="text-right text-gray-700 font-semibold">
                      Price:
                    </div>
                    <div className="text-left text-gray-900">
                      Rs{" "}
                      {selectedVenue?.price ||
                        selectedEvent?.venue?.price ||
                        selectedBooking.event?.venue?.price ||
                        "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && user && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Favorite Venues
                </h2>
              </div>
              {favoriteLoading ? (
                <div className="text-gray-500">Loading favorites...</div>
              ) : favoriteError ? (
                <div className="text-red-500">{favoriteError}</div>
              ) : favoriteVenues.length === 0 ? (
                <div className="text-gray-500 text-center">
                  No favorite venues found.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteVenues.map((venue: any) => (
                    <div
                      key={venue.id}
                      className="bg-white rounded-lg shadow p-4 flex flex-col relative"
                    >
                      <img
                        src={
                          venue.images && venue.images.length > 0
                            ? venue.images[0].image
                            : venue.image || "/placeholder.jpg"
                        }
                        alt={venue.name}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                      <div className="font-bold text-lg mb-1">{venue.name}</div>
                      <div className="text-gray-600 mb-1">
                        {venue.location || "Location not specified"}
                      </div>
                      <div className="text-gray-700 mb-1">
                        Capacity: {venue.capacity}
                      </div>
                      <div className="text-gray-700 mb-1">
                        Price: Rs {venue.price}
                      </div>
                      <div className="text-gray-700 mb-1 flex items-center">
                        <span className="font-semibold mr-1">Your Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            fill={
                              userRatings[venue.id] >= star ? "#facc15" : "none"
                            }
                            viewBox="0 0 24 24"
                            stroke="#facc15"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            />
                          </svg>
                        ))}
                        <span className="ml-2">
                          {userRatings[venue.id]
                            ? userRatings[venue.id]
                            : "Not rated"}
                        </span>
                      </div>
                      <button
                        className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 transition-colors"
                        title="Remove from favorites"
                        onClick={async () => {
                          try {
                            // Find favorite ID by venue
                            const res = await getFavoriteVenues();
                            const fav = res.data.find(
                              (v: any) => v.venue === venue.id
                            );
                            if (fav) {
                              await deleteFavoriteVenue(fav.id);
                              // Refetch favorites for perfect sync
                              const updatedRes = await getFavoriteVenues();
                              const updatedFavorites = Array.isArray(
                                updatedRes.data
                              )
                                ? updatedRes.data
                                : [];
                              const venueDetails = await Promise.all(
                                updatedFavorites.map(async (fav) => {
                                  try {
                                    const venueRes = await axiosInstance.get(
                                      `/api/venues/${fav.venue}/`
                                    );
                                    return { ...fav, ...venueRes.data };
                                  } catch {
                                    return null;
                                  }
                                })
                              );
                              setFavoriteVenues(venueDetails.filter(Boolean));
                            }
                          } catch (err: any) {
                            toast.error("Failed to remove favorite");
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
