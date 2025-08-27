import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { postVenuelist, updateVenue, deleteVenue } from "../Api/postapi";
import { getVenueList } from "../Api/getapi";

import { Plus, MapPin, Users, DollarSign, Star, Calendar, CheckCircle, Clock, X } from "lucide-react";
import toast from "react-hot-toast";
import VenueCard from "./VenueOwner/VenueCard";
import AddVenueModal from "./VenueOwner/AddVenueModal";

export function VenueOwnerDashboard() {
  const [activeTab, setActiveTab] = useState("venues");
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [eventType, setEventType] = useState("Wedding");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [addVenue, setAddVenue] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationsById, setLocationsById] = useState<Record<string, string>>({});

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
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  const [venues, setVenues] = useState<any[]>([]);

  const fetchVenues = async () => {
    try {
      const res = await getVenueList();
      const apiVenues = Array.isArray(res.data) ? res.data : [];
      const mapped = apiVenues.map((v: any) => ({
        id: String(v.id ?? ""),
        name: v.name ?? "",
        location: "",
        price: Number(v.price ?? 0),
        rating: 0,
        reviews: 0,
        status: v.status ?? "pending",
        bookings: 0,
        revenue: 0,
        image: v.image ?? "",
        lat: v.lat,
        lng: v.lng,
        description: v.description ?? "",
        eventType: v.eventType ?? "",
        created_at: v.created_at,
        updated_at: v.updated_at,
      }));
      setVenues(mapped);
    } catch (e) {
      console.error("Failed to fetch venues:", e);
    }
  };

  React.useEffect(() => {
    fetchVenues();
  }, []);

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
            geocoder.geocode({ location: { lat: v.lat, lng: v.lng } }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                updates[v.id] = results[0].formatted_address;
              }
              resolve();
            });
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

  const bookingRequests = [
    {
      id: "1",
      venueName: "Grand Ballroom Palace",
      customerName: "Sarah Johnson",
      date: new Date("2025-03-15"),
      guests: 150,
      status: "pending",
      totalPrice: 2500,
      message: "Looking for a wedding venue with elegant decoration options.",
    },
    {
      id: "2",
      venueName: "Rooftop Garden Venue",
      customerName: "Michael Chen",
      date: new Date("2025-04-20"),
      guests: 80,
      status: "pending",
      totalPrice: 1800,
      message: "Corporate event with catering requirements.",
    },
  ];

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
  ];

  const handleApproveBooking = (bookingId: string) => {
    toast.success(`Booking ${bookingId} approved!`);
  };

  const handleRejectBooking = (bookingId: string) => {
    toast.error(`Booking ${bookingId} rejected!`);
  };

  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const handleAddVenue = async () => {
    if (!selectedPosition) {
      toast.error("Please select a location on the map!");
      return;
    }

    // Build request payload
    const chosenImage = imageUrl?.trim()
      ? imageUrl.trim()
      : selectedImageUrl || "https://example.com/images/grand-hall.jpg";

    const payload = {
      name: venueName,
      description: description,
      price: Number(price),
      eventType: eventType,
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
      status: "pending",
      image: chosenImage,
    };

    try {
      const response = editingVenueId
        ? await updateVenue(editingVenueId, payload)
        : await postVenuelist(payload);
      console.log("API Response:", response);

      // Reset form after success
      setAddVenue(true);
      setShowAddVenue(false);
      setVenueName("");
      setDescription("");
      setPrice("");
      setEventType("Wedding");
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
      setSelectedImage(null);
      setSelectedImageUrl(null);
      setImageUrl("");
      setSelectedPosition(null);
      toast.success(editingVenueId ? "Venue updated successfully!" : "Venue added successfully!");
      setEditingVenueId(null);
      fetchVenues();
      setShowAddVenue(false);
    } catch (error: any) {
      console.error("Failed to add venue:", error);
      toast.error(editingVenueId ? "Failed to update venue." : "Failed to add venue.");
    }
  };

  const startEditVenue = (venue: any) => {
    setEditingVenueId(venue.id);
    setShowAddVenue(true);
    setVenueName(venue.name);
    setDescription(venue.description || "");
    setPrice(Number(venue.price) || 0);
    setEventType(venue.eventType || "Wedding");
    setSelectedPosition({ lat: venue.lat, lng: venue.lng });
    setImageUrl(venue.image || "");
  };

  const handleDeleteVenue = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    try {
      await deleteVenue(id);
      await fetchVenues();
      toast.success("Venue deleted.");
    } catch (e) {
      console.error("Delete failed:", e);
      toast.error("Failed to delete venue.");
    }
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
                  $
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
                  {venues.reduce((sum, venue) => sum + venue.bookings, 0)}
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
                  {bookingRequests.length}
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
                  {(
                    venues.reduce((sum, venue) => sum + venue.rating, 0) /
                    venues.length
                  ).toFixed(1)}
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
                </div>

                <div className="space-y-4">
                  {bookingRequests.map((booking, index) => (
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
                            {booking.venueName}
                          </h3>
                          <p className="text-gray-600">
                            Request from {booking.customerName}
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
                          {booking.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users size={16} className="mr-1" />
                          {booking.guests} guests
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign size={16} className="mr-1" />$
                          {booking.totalPrice}
                        </div>
                        <div className="text-gray-600">
                          Status: {booking.status}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Customer Message:
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {booking.message}
                        </p>
                      </div>

                      {booking.status === "pending" && (
                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveBooking(booking.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRejectBooking(booking.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <X size={16} />
                            Reject
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
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
                            ${venue.revenue.toLocaleString()}
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
          </div>
        </div>
      </div>

      {/* Add Venue Modal */}
      <AddVenueModal
        isOpen={showAddVenue}
        onClose={() => setShowAddVenue(false)}
        onSubmit={handleAddVenue}
        setters={{
          setVenueName,
          setDescription,
          setPrice,
          setEventType,
          setSelectedImage,
          setSelectedImageUrl,
          setImageUrl,
          setSelectedPosition,
        }}
        values={{
          venueName,
          description,
          price,
          eventType,
          selectedImageUrl,
          imageUrl,
          selectedPosition,
          currentPosition,
        }}
      />
    </div>
  );
}
