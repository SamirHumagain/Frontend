import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, DollarSign, Edit, Trash2, Eye } from "lucide-react";

import { getUserBookings } from "../Api/getapi";
import axiosInstance from "../Api/urls";
import { cancelBooking } from "../Api/postapi";
import { getBookingDetail, updateBooking } from "../Api/bookingActions";

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for view/edit
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalType, setModalType] = useState<null | "view" | "edit">(null);

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
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data);
      setModalType("view");
    } catch (e) {
      alert("Failed to fetch booking details");
    }
  };

  const handleEdit = async (bookingId: number) => {
    try {
      const res = await getBookingDetail(bookingId);
      setSelectedBooking(res.data);
      setModalType("edit");
    } catch (e) {
      alert("Failed to fetch booking details");
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
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-gray-500 text-center">
                    No bookings found.
                  </div>
                ) : (
                  bookings.map((booking, index) => {
                    // Use nested event/venue data if available
                    const event = booking.event || {};
                    const venue = event.venue || {};
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
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
                                  <DollarSign size={16} className="mr-1" />
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
                                title="View Booking"
                              >
                                <Eye size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={() => handleEdit(booking.id)}
                                title="Edit Booking"
                              >
                                <Edit size={18} />
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
                              {/* Booking View/Edit Modal (simple implementation) */}
                              {modalType && selectedBooking && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                  <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                                    <button
                                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                                      onClick={() => {
                                        setModalType(null);
                                        setSelectedBooking(null);
                                      }}
                                    >
                                      &times;
                                    </button>
                                    {modalType === "view" && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                          Booking Details
                                        </h3>
                                        <div className="mb-2">
                                          <b>Status:</b>{" "}
                                          {selectedBooking.status}
                                        </div>
                                        <div className="mb-2">
                                          <b>Event:</b>{" "}
                                          {selectedBooking.event?.name}
                                        </div>
                                        <div className="mb-2">
                                          <b>Venue:</b>{" "}
                                          {selectedBooking.event?.venue?.name}
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
                                          {
                                            selectedBooking.event?.venue
                                              ?.capacity
                                          }
                                        </div>
                                      </div>
                                    )}
                                    {modalType === "edit" && (
                                      <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                          Edit Booking
                                        </h3>
                                        {/* Example: Only allow editing guests (capacity) for demo */}
                                        <form
                                          onSubmit={async (e) => {
                                            e.preventDefault();
                                            const form =
                                              e.target as HTMLFormElement;
                                            const guests = (
                                              form.elements.namedItem(
                                                "guests"
                                              ) as HTMLInputElement
                                            ).value;
                                            try {
                                              await updateBooking(
                                                selectedBooking.id,
                                                { guests }
                                              );
                                              setModalType(null);
                                              setSelectedBooking(null);
                                              fetchBookings();
                                            } catch {
                                              alert("Failed to update booking");
                                            }
                                          }}
                                        >
                                          <label className="block mb-2">
                                            Guests
                                          </label>
                                          <input
                                            name="guests"
                                            type="number"
                                            min={1}
                                            defaultValue={
                                              selectedBooking.event?.venue
                                                ?.capacity
                                            }
                                            className="border px-3 py-2 rounded w-full mb-4"
                                          />
                                          <button
                                            type="submit"
                                            className="bg-primary-600 text-white px-4 py-2 rounded"
                                          >
                                            Save
                                          </button>
                                        </form>
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
                  })
                )}
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
                Profile Settings
              </h2>

              <div className="max-w-2xl">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          profile?.first_name || profile?.firstName || ""
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          profile?.last_name || profile?.lastName || ""
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={profile?.email || ""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      defaultValue={profile?.phone || ""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about yourself..."
                      defaultValue={profile?.bio || ""}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
