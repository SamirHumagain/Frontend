// (removed duplicate handleAddVenue and editingVenueId)
// Venue owner dashboard will need to manage their own venues and view bookings.
// API Needed: GET/POST/PUT/DELETE /api/venues/owner/, GET /api/venues/owner/bookings/
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useJsApiLoader } from "@react-google-maps/api";
import { postVenuelist, updateVenue, deleteVenue } from "../Api/postapi";
import { getOwnerVenueList } from "../Api/getapi";
import {
  getOwnerVenueBookings,
  approveBooking,
  rejectBooking,
} from "../Api/ownerBookingActions";

import {
  Plus,
  MapPin,
  Users,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import VenueCard from "./VenueOwner/VenueCard";
import AddVenueModal from "./VenueOwner/AddVenueModal";
import ProfileEditForm from "./VenueOwner/ProfileEditForm";

export function VenueOwnerDashboard() {
  const [locationName, setLocationName] = useState("");
  const [activeTab, setActiveTab] = useState("venues");
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationsById, setLocationsById] = useState<Record<string, string>>(
    {}
  );
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  // Add status filter state for booking requests tab
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Add Venue handler
  const handleAddVenue = async () => {
    if (!selectedPosition) {
      toast.error("Please select a location on the map!");
      return;
    }

    // Build request payload
    const chosenImage = imageUrl?.trim()
      ? imageUrl.trim()
      : selectedImageUrl || "https://example.com/images/grand-hall.jpg";

    // Get owner id from localStorage
    const storedUser = localStorage.getItem("user");
    const ownerId = storedUser ? JSON.parse(storedUser).id : null;

    const payload = {
      name: venueName,
      description: description,
      price: Number(price),
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
      location_name: locationName,
      status: "pending",
      image: chosenImage,
      capacity: Number(capacity),
      owner: ownerId,
    };

    try {
      const response = editingVenueId
        ? await updateVenue(editingVenueId, payload)
        : await postVenuelist(payload);
      console.log("API Response:", response);

      // Reset form after success
      setShowAddVenue(false);
      setVenueName("");
      setDescription("");
      setPrice("");
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
      setSelectedImageUrl(null);
      setImageUrl("");
      setSelectedPosition(null);
      toast.success(
        editingVenueId
          ? "Venue updated successfully!"
          : "Venue added successfully!"
      );
      setEditingVenueId(null);
      fetchVenues();
      setShowAddVenue(false);
    } catch (error: any) {
      console.error("Failed to add venue:", error);
      toast.error(
        editingVenueId ? "Failed to update venue." : "Failed to add venue."
      );
    }
  };

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDEZNctYz8EiBhizEvcVarfBgH7My1fGxM",
    id: "google-map-script",
  });

  const [venues, setVenues] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const fetchVenues = async () => {
    try {
      const res = await getOwnerVenueList();
      const apiVenues = Array.isArray(res.data) ? res.data : [];
      const mapped = apiVenues.map((v: any) => ({
        id: String(v.id ?? ""),
        name: v.name ?? "",
        location: "",
        price: Number(v.price ?? 0),
        rating: v.bayesian_rating ?? v.avg_rating ?? 0,
        bayesian_rating: v.bayesian_rating,
        num_ratings: v.num_ratings ?? 0,
        reviews: 0,
        status: v.status ?? "pending",
        bookings: v.bookings_count ?? 0,
        pending: v.pending_requests ?? 0,
        revenue: 0, // You can add revenue logic if available from backend
        image: v.image ?? "",
        lat: v.lat,
        lng: v.lng,
        description: v.description ?? "",
        eventType: v.eventType ?? "",
        created_at: v.created_at,
        updated_at: v.updated_at,
        location_name: v.location_name ?? "",
      }));
      setVenues(mapped);
      // Update locationsById with location_name if present
      const locationsUpdate: Record<string, string> = {};
      mapped.forEach((venue) => {
        if (venue.location_name && venue.location_name.trim() !== "") {
          locationsUpdate[venue.id] = venue.location_name;
        }
      });
      if (Object.keys(locationsUpdate).length > 0) {
        setLocationsById((prev) => ({ ...prev, ...locationsUpdate }));
      }
    } catch (e) {
      console.error("Failed to fetch venues:", e);
    }
  };

  // Fetch venues and booking requests
  React.useEffect(() => {
    fetchVenues();
    fetchBookingRequests();
  }, []);

  // Refetch bookings when switching to bookings tab
  React.useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookingRequests();
    }
  }, [activeTab]);

  // Fetch booking requests for owner's venues
  const fetchBookingRequests = async () => {
    try {
      const res = await getOwnerVenueBookings();
      setBookingRequests(res.data);
    } catch (e) {
      setBookingRequests([]);
    }
  };

  // Reverse geocode lat/lng to human-readable addresses when maps API is loaded
  React.useEffect(() => {
    if (!isLoaded || !venues.length) return;
    const geocoder = new google.maps.Geocoder();
    const updates: Record<string, string> = {};
    const pending: Promise<void>[] = [];

    venues.forEach((v) => {
      if (v.lat != null && v.lng != null && !locationsById[v.id]) {
        pending.push(
          new Promise((resolve) => {
            geocoder.geocode(
              { location: { lat: v.lat, lng: v.lng } },
              (results, status) => {
                if (status === "OK" && results && results[0]) {
                  updates[v.id] = results[0].formatted_address;
                }
                resolve();
              }
            );
          })
        );
      }
    });

    if (pending.length) {
      Promise.all(pending).then(() => {
        if (Object.keys(updates).length) {
          setLocationsById((prev) => ({ ...prev, ...updates }));
        }
      });
    }
  }, [isLoaded, venues]);

  // bookingRequests now comes from backend

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "venues", label: "My Venues", count: venues.length },
    {
      id: "bookings",
      label: "Booking Requests",
      count: bookingRequests.length,
    },
    { id: "analytics", label: "Analytics", count: null },
    { id: "profile", label: "Profile", count: null },
  ];
  // Venue Owner Profile State
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  React.useEffect(() => {
    if (activeTab === "profile") {
      setProfileLoading(true);
      import("../Api/venueOwnerApi").then(({ getVenueOwnerProfile }) => {
        getVenueOwnerProfile()
          .then((res) => {
            setProfile(res.data);
            setProfileLoading(false);
          })
          .catch(() => {
            setProfileError("Failed to load profile");
            setProfileLoading(false);
          });
      });
    }
  }, [activeTab]);
  {
    /* Profile Tab */
  }
  {
    activeTab === "profile" && (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>
        {profileLoading ? (
          <div className="text-gray-500">Loading profile...</div>
        ) : profileError ? (
          <div className="text-red-500">{profileError}</div>
        ) : profile ? (
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
              <div className="max-w-xl bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <img
                  src={
                    profile.profile_image ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(profile.name || "User")
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full border mb-4"
                />
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {profile.name}
                </div>
                <div className="text-gray-600 mb-2">{profile.email}</div>
                <div className="mb-2 text-gray-700">
                  <span className="font-medium">Phone:</span>{" "}
                  {profile.phone || "-"}
                </div>
                <div className="mb-2 text-gray-700">
                  <span className="font-medium">Address:</span>{" "}
                  {profile.address || "-"}
                </div>
                <div className="mb-2 text-gray-700">
                  <span className="font-medium">User Type:</span>{" "}
                  {profile.user_type}
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
        ) : (
          <div className="text-gray-500">No profile data loaded.</div>
        )}
      </div>
    );
  }

  const handleApproveBooking = async (bookingId: number | string) => {
    setBookingLoading(String(bookingId));
    try {
      await approveBooking(Number(bookingId));
      toast.success("Booking approved!");
      fetchBookingRequests();
      await fetchVenues(); // Refresh venues to update pending count
    } catch {
      toast.error("Failed to approve booking");
    } finally {
      setBookingLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: number | string) => {
    setBookingLoading(String(bookingId));
    try {
      await rejectBooking(Number(bookingId));
      toast.success("Booking rejected!");
      fetchBookingRequests();
      await fetchVenues(); // Refresh venues to update pending count
    } catch {
      toast.error("Failed to reject booking");
    } finally {
      setBookingLoading(null);
    }
  };
  // (removed duplicate/stray code block)

  const startEditVenue = (venue: any) => {
    setEditingVenueId(venue.id);
    setShowAddVenue(true);
    setVenueName(venue.name);
    setDescription(venue.description || "");
    setPrice(Number(venue.price) || 0);
    setSelectedPosition({ lat: venue.lat, lng: venue.lng });
    setImageUrl(venue.image || "");
  };

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    venueId: string | null;
  }>({ open: false, venueId: null });

  const handleDeleteVenue = (id: string) => {
    setDeleteModal({ open: true, venueId: id });
  };

  const confirmDeleteVenue = async () => {
    if (!deleteModal.venueId) return;
    try {
      await deleteVenue(deleteModal.venueId);
      await fetchVenues();
      toast.success("Venue deleted.");
    } catch (e) {
      console.error("Delete failed:", e);
      toast.error("Failed to delete venue.");
    }
    setDeleteModal({ open: false, venueId: null });
  };
  const cancelDeleteVenue = () => {
    setDeleteModal({ open: false, venueId: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Venue Owner Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your venues and bookings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  Rs{" "}
                  {venues
                    .reduce((sum, venue) => sum + venue.revenue, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddVenue(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                type="button"
              >
                <Plus size={20} />
                Add Venue
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Venues
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <MapPin className="text-primary-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.reduce(
                    (sum, venue) => sum + (venue.bookings || 0),
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.reduce((sum, venue) => sum + (venue.pending || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {venues.length
                    ? (
                        venues.reduce(
                          (sum, venue) => sum + (venue.rating || 0),
                          0
                        ) / venues.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span
                      className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-primary-100 text-primary-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Venues Tab */}
            {activeTab === "venues" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Venues
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {venues.map((venue, index) => (
                    <VenueCard
                      key={venue.id}
                      venue={venue}
                      index={index}
                      statusColorFor={getStatusColor}
                      locationsById={locationsById}
                      onEdit={startEditVenue}
                      onDelete={handleDeleteVenue}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Booking Requests Tab */}
            {activeTab === "bookings" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Booking Requests
                  </h2>
                  <div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {(() => {
                    const filtered =
                      statusFilter === "All"
                        ? bookingRequests
                        : bookingRequests.filter(
                            (b) =>
                              b.status &&
                              b.status.toLowerCase() ===
                                statusFilter.toLowerCase()
                          );
                    if (filtered.length === 0) {
                      return (
                        <div className="text-gray-500 text-center">
                          No booking requests found.
                        </div>
                      );
                    }
                    return filtered.map((booking, index) => {
                      const event = booking.event || {};
                      const venue = event.venue || {};
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {venue.name || "Venue"}
                              </h3>
                              <p className="text-gray-600">
                                Request from{" "}
                                {booking.user?.name ||
                                  booking.user?.email ||
                                  "User"}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar size={16} className="mr-1" />
                              {event.date
                                ? new Date(event.date).toLocaleDateString()
                                : "-"}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users size={16} className="mr-1" />
                              {venue.capacity || 0} guests
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="mr-1 text-lg font-bold">रु</span>
                              {venue.price || 0}
                            </div>
                            <div className="text-gray-600">
                              Status: {booking.status}
                            </div>
                          </div>

                          {booking.status === "pending" && (
                            <div className="flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApproveBooking(booking.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                disabled={bookingLoading === booking.id}
                              >
                                <CheckCircle size={16} />
                                {bookingLoading === booking.id
                                  ? "Approving..."
                                  : "Approve"}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRejectBooking(booking.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                disabled={bookingLoading === booking.id}
                              >
                                <X size={16} />
                                {bookingLoading === booking.id
                                  ? "Rejecting..."
                                  : "Reject"}
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Analytics Overview
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue by Venue
                    </h3>
                    <div className="space-y-4">
                      {venues.map((venue) => (
                        <div
                          key={venue.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {venue.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {venue.bookings} bookings
                            </div>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            Rs {venue.revenue.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Performance Metrics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Rating</span>
                        <span className="font-semibold">
                          {(
                            venues.reduce(
                              (sum, venue) => sum + venue.rating,
                              0
                            ) / venues.length
                          ).toFixed(1)}{" "}
                          ⭐
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Reviews</span>
                        <span className="font-semibold">
                          {venues.reduce(
                            (sum, venue) => sum + venue.reviews,
                            0
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking Rate</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-semibold">2.5 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  My Profile
                </h2>
                {profileLoading ? (
                  <div className="text-gray-500">Loading profile...</div>
                ) : profileError ? (
                  <div className="text-red-500">{profileError}</div>
                ) : profile ? (
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
                      <div className="max-w-xl bg-white rounded-lg shadow p-6 flex flex-col items-center">
                        <img
                          src={
                            profile.profile_image ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(profile.name || "User")
                          }
                          alt="Profile"
                          className="w-24 h-24 rounded-full border mb-4"
                        />
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {profile.name}
                        </div>
                        <div className="text-gray-600 mb-2">
                          {profile.email}
                        </div>
                        <div className="mb-2 text-gray-700">
                          <span className="font-medium">Phone:</span>{" "}
                          {profile.phone || "-"}
                        </div>
                        <div className="mb-2 text-gray-700">
                          <span className="font-medium">Address:</span>{" "}
                          {profile.address || "-"}
                        </div>
                        <div className="mb-2 text-gray-700">
                          <span className="font-medium">User Type:</span>{" "}
                          {profile.user_type}
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
                ) : (
                  <div className="text-gray-500">No profile data loaded.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Venue Modal */}
      <AddVenueModal
        isOpen={showAddVenue}
        onClose={() => setShowAddVenue(false)}
        onSubmit={handleAddVenue}
        heading={editingVenueId ? "Edit Venue" : "Add Venue"}
        setters={{
          setVenueName,
          setDescription,
          setPrice,
          setSelectedImageUrl,
          setImageUrl,
          setSelectedPosition,
          setCapacity,
          setLocationName,
        }}
        values={{
          venueName,
          description,
          price,
          selectedImageUrl,
          imageUrl,
          selectedPosition,
          currentPosition,
          capacity,
          locationName,
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Venue Deletion
            </h3>
            <p className="mb-6">Are you sure you want to delete this venue?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDeleteVenue}
              >
                Confirm Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={cancelDeleteVenue}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
