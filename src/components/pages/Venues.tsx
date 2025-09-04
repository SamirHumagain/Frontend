import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Users,
  Heart,
  Eye,
  DollarSign,
  Calendar,
} from "lucide-react";
import { getVenueList } from "../Api/getapi";
import { getVenueEvents } from "../Api/venueapi";
import "react-datepicker/dist/react-datepicker.css";
import BookingModal from "../BookingModal";
import { postBooking, postEvent } from "../Api/postapi";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { Venue } from "../../types";
import {
  getVenueRatings,
  postVenueRating,
  updateVenueRating,
  getFavoriteVenues,
  postFavoriteVenue,
  deleteFavoriteVenue,
} from "../Api/venueRatingFavoriteApi";
import { useAuth } from "../../context/AuthContext";

export function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  // Ratings and favorites state
  const [userRatings, setUserRatings] = useState<{
    [venueId: string]: { id: string; rating: number; comment: string };
  }>({});
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>([]);

  // Fetch user ratings for all venues
  useEffect(() => {
    if (!user) return;
    const fetchRatings = async () => {
      const ratings: {
        [venueId: string]: { id: string; rating: number; comment: string };
      } = {};
      for (const venue of venues) {
        try {
          const res = await getVenueRatings(venue.id);
          if (res.data && res.data.length > 0) {
            const r = res.data[0];
            ratings[venue.id] = {
              id: r.id,
              rating: r.rating,
              comment: r.comment,
            };
          }
        } catch {}
      }
      setUserRatings(ratings);
    };
    fetchRatings();
  }, [user, venues]);

  // Fetch user favorites
  const fetchFavorites = () => {
    if (!user) return;
    getFavoriteVenues().then((res) => {
      if (Array.isArray(res.data)) {
        const ids = res.data.map((v: any) => v.id.toString());

        setFavoriteVenueIds(ids);
      }
    });
  };
  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Pending rating state for confirm button logic on venue cards
  const [pendingRating, setPendingRating] = useState<{
    venueId: string;
    rating: number;
  } | null>(null);

  // Handle favorite toggle
  const handleFavorite = async (venueId: string) => {
    if (!user) {
      toast.error("Login to favorite venues");
      return;
    }
    const isFav = favoriteVenueIds.includes(venueId);
    try {
      if (isFav) {
        // Find favorite ID by venue
        const res = await getFavoriteVenues();
        const fav = res.data.find((v: any) => v.id.toString() === venueId);
        if (fav) {
          await deleteFavoriteVenue(fav.favorite_id || fav.id);
        }
      } else {
        await postFavoriteVenue(venueId);
      }
      // Always refetch favorites after add/remove
      fetchFavorites();
    } catch (err: any) {
      if (err?.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Failed to update favorites");
      }
    }
  };
  const [bookingModal, setBookingModal] = useState<{
    open: boolean;
    venue?: Venue;
  }>({ open: false });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [descModal, setDescModal] = useState<{ open: boolean; venue?: Venue }>({
    open: false,
  });
  // For location display (simulate geocoding)
  const getLocationString = (venue: Venue) => {
    if (venue.location_name && venue.location_name.trim() !== "")
      return venue.location_name;
    if (venue.location && venue.location.trim() !== "") return venue.location;
    if (venue.lat != null && venue.lng != null)
      return `${venue.lat.toFixed(5)}, ${venue.lng.toFixed(5)}`;
    return "N/A";
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Recommendation logic: user location, toggle, and venue distances
  const [showAllVenues, setShowAllVenues] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [venueDistances, setVenueDistances] = useState<{
    [venueId: string]: number;
  }>({});

  // Haversine formula to calculate distance between two lat/lng points in km
  function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get user location on mount (optional: ask for permission)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {}
      );
    }
    setShowAllVenues(false); // Always reset to show only three venues on refresh
  }, []);

  // Compute distances from user to each venue
  useEffect(() => {
    if (userLat != null && userLng != null && venues.length > 0) {
      const dists: { [venueId: string]: number } = {};
      venues.forEach((venue) => {
        if (venue.lat != null && venue.lng != null) {
          dists[venue.id] = haversineDistance(
            userLat,
            userLng,
            venue.lat,
            venue.lng
          );
        }
      });
      setVenueDistances(dists);
    }
  }, [userLat, userLng, venues]);

  const venueTypes = [
    { value: "all", label: "All Types" },
    { value: "wedding", label: "Wedding" },
    { value: "corporate", label: "Corporate" },
    { value: "birthday", label: "Birthday" },
    { value: "conference", label: "Conference" },
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "budget", label: "Under Rs 1,000" },
    { value: "mid", label: "Rs 1,000 - Rs 2,000" },
    { value: "premium", label: "Over Rs 2,000" },
  ];

  useEffect(() => {
    setLoading(true);
    getVenueList()
      .then((data) => {
        setVenues(data.data); // Axios wraps response in .data
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load venues");
        setLoading(false);
      });
  }, []);

  // Booking handler
  // Open booking modal and fetch booked dates
  const openBookingModal = async (venue: Venue) => {
    setSelectedDate(null);
    setBookingModal({ open: true, venue });
    try {
      const res = await getVenueEvents(venue.id);
      // Assume each event has a 'date' field (ISO string)
      const dates = (res.data || []).map((ev: any) => new Date(ev.date));
      setBookedDates(dates);
    } catch {
      setBookedDates([]);
    }
  };

  // Book the venue for the selected date
  const handleBookNow = async () => {
    if (!user) {
      toast.error("You have to login for booking");
      return;
    }
    if (!bookingModal.venue || !selectedDate) {
      toast.error("Please select a date.");
      return;
    }
    try {
      setBookingLoading(true);
      // Step 1: Create an Event
      const eventPayload = {
        name: `Event for Venue ${bookingModal.venue.id}`,
        description: "Booking via dashboard",
        date: selectedDate.toISOString().split("T")[0],
        venue: bookingModal.venue.id,
      };
      const eventResponse = await postEvent(eventPayload);
      const eventId = eventResponse.data.id;
      // Step 2: Create a Reservation
      const reservationPayload = {
        event: eventId,
        reserved_at: new Date().toISOString(),
        user: user?.id,
      };
      await postBooking(reservationPayload);
      toast.success("Booking requested");
      setBookingLoading(false);
      setBookingModal({ open: false });
    } catch (error: any) {
      setBookingLoading(false);
      if (error.response && error.response.data) {
        let errMsg = "";
        try {
          errMsg = JSON.stringify(error.response.data, null, 2);
        } catch (e) {
          errMsg = String(error.response.data);
        }
        toast.error(`Booking failed: ${errMsg}`);
      } else {
        toast.error("Booking failed: Unknown error");
      }
    }
  };

  // Only show venues with status 'approved', and sort by distance if available
  let filteredVenues: Venue[] = venues.filter((venue) => {
    const selectedTypeLower = selectedType.toLowerCase();
    const matchesType =
      selectedTypeLower === "all" ||
      (venue.type && venue.type.toLowerCase() === selectedTypeLower) ||
      (venue.eventType && venue.eventType.toLowerCase() === selectedTypeLower);
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "budget" && venue.price < 1000) ||
      (priceRange === "mid" && venue.price >= 1000 && venue.price <= 2000) ||
      (priceRange === "premium" && venue.price > 2000);
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.location
        ? venue.location.toLowerCase().includes(searchTerm.toLowerCase())
        : false);
    const matchesApproved = venue.status === "approved";
    return matchesType && matchesPrice && matchesSearch && matchesApproved;
  });

  // If user location and distances are available, sort venues by distance
  if (
    userLat != null &&
    userLng != null &&
    Object.keys(venueDistances).length > 0
  ) {
    filteredVenues = [...filteredVenues].sort((a, b) => {
      const da = venueDistances[a.id] ?? Infinity;
      const db = venueDistances[b.id] ?? Infinity;
      return da - db;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading venues...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-luxury-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Venues
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Find the perfect space for your next event from our curated
              collection of premium venues
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-16 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search venues or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              >
                {venueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-gray-600 font-semibold text-xl">
              Venues near your location
            </span>
            <button
              className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
              onClick={() => setShowAllVenues(true)}
            >
              Show All Venues
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAllVenues ? filteredVenues : filteredVenues.slice(0, 3)).map(
              (venue: Venue, index: number) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={venue.image || "/placeholder.jpg"}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {(() => {
                      const isFav = favoriteVenueIds.includes(
                        venue.id.toString()
                      );

                      return (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFavorite(venue.id)}
                          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors bg-white/80 text-gray-600 hover:text-red-500`}
                        >
                          <Heart
                            size={20}
                            fill={isFav ? "red" : "none"}
                            color={isFav ? "red" : undefined}
                          />
                        </motion.button>
                      );
                    })()}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full capitalize">
                        {venue.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-xl font-semibold text-gray-900 line-clamp-1 truncate max-w-[200px]"
                        title={venue.name}
                      >
                        {venue.name}
                      </h3>
                      <div className="flex items-center text-sm text-yellow-600">
                        {user ? (
                          // Logged-in user: interactive rating with confirm
                          <>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`cursor-pointer ${
                                  (pendingRating &&
                                  pendingRating.venueId === venue.id
                                    ? pendingRating.rating
                                    : userRatings[venue.id]?.rating || 0) >=
                                  star
                                    ? "fill-current text-yellow-500"
                                    : "text-gray-300"
                                }`}
                                size={18}
                                onClick={() => {
                                  // Single click: set rating
                                  setPendingRating({
                                    venueId: venue.id,
                                    rating: star,
                                  });
                                }}
                                onDoubleClick={() => {
                                  // Double click: remove/reset rating
                                  setPendingRating({
                                    venueId: venue.id,
                                    rating: 0,
                                  });
                                }}
                              />
                            ))}
                            <span className="ml-2 font-medium">
                              {(pendingRating &&
                              pendingRating.venueId === venue.id
                                ? pendingRating.rating
                                : userRatings[venue.id]?.rating) ||
                                venue.rating ||
                                0}
                            </span>
                            {pendingRating &&
                              pendingRating.venueId === venue.id &&
                              pendingRating.rating > 0 && (
                                <button
                                  className="ml-3 px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs font-semibold"
                                  onClick={async () => {
                                    const { venueId, rating } = pendingRating;
                                    const existing = userRatings[venueId];
                                    try {
                                      if (existing) {
                                        await updateVenueRating(
                                          existing.id,
                                          rating,
                                          existing.comment || ""
                                        );
                                      } else {
                                        await postVenueRating(
                                          venueId,
                                          rating,
                                          ""
                                        );
                                      }
                                      // Always fetch the latest rating from backend after submit
                                      const res = await getVenueRatings(
                                        venueId
                                      );
                                      if (res.data && res.data.length > 0) {
                                        const r = res.data[0];
                                        setUserRatings((prev) => ({
                                          ...prev,
                                          [venueId]: {
                                            id: r.id,
                                            rating: r.rating,
                                            comment: r.comment,
                                          },
                                        }));
                                      }
                                      toast.success("Rating submitted");
                                      setPendingRating(null);
                                    } catch {
                                      toast.error("Failed to submit rating");
                                    }
                                  }}
                                >
                                  Confirm
                                </button>
                              )}
                          </>
                        ) : (
                          // Guest: show static average rating
                          <>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={
                                  (venue.rating || 0) >= star
                                    ? "fill-current text-yellow-500"
                                    : "text-gray-300"
                                }
                                size={18}
                              />
                            ))}
                            <span className="ml-2 font-medium">
                              {(venue.rating || 0).toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Location row with Eye icon at right (exactly like owner dashboard) */}
                    <div className="flex items-center text-gray-600 mb-3 justify-between">
                      <div className="flex items-center">
                        <MapPin size={16} />
                        <span className="ml-1 text-sm">
                          {getLocationString(venue)}
                        </span>
                      </div>
                      <Link
                        to={`/venues/${venue.id}`}
                        className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Venue Details"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>

                    {/* No separate action row needed, Eye icon is now at right of location */}

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(venue.amenities?.slice(0, 3) || []).map(
                        (amenity: string) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-indigo-50 text-primary-700 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        )
                      )}
                      {venue.amenities && venue.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{venue.amenities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Users size={16} />
                        <span className="ml-1">
                          Up to {venue.capacity} guests
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">
                          Rs {venue.price}
                        </div>
                        <div className="text-gray-500">per event</div>
                      </div>
                    </div>

                    {/* Book Button opens modal */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openBookingModal(venue)}
                      className="w-full py-3 bg-luxury-gradient text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </motion.div>
              )
            )}
          </div>

          {filteredVenues.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-gray-400 mb-4">
                <Filter size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No venues found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria
              </p>
            </motion.div>
          )}
        </div>
      </section>
      {/* Venue Description Modal */}
      {descModal.open && descModal.venue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div
            className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setDescModal({ open: false })}
              aria-label="Close"
            >
              &times;
            </button>
            {/* Venue Name at the top */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              {descModal.venue.name}
            </h2>
            {descModal.venue.image && (
              <img
                src={descModal.venue.image}
                alt={descModal.venue.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <div className="mb-2 text-gray-700 flex items-center">
              <MapPin size={16} className="mr-1" />
              <span className="font-semibold">Location:</span>{" "}
              {getLocationString(descModal.venue)}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Description:</span>
              <div className="mt-1 whitespace-pre-line">
                {descModal.venue.description || "No description provided."}
              </div>
            </div>
            <div className="mb-2 text-gray-700 flex items-center">
              <DollarSign size={16} className="mr-1" />
              <span className="font-semibold">Price:</span> Rs{" "}
              {descModal.venue.price}
            </div>
            <div className="mb-2 text-gray-700 flex items-center">
              <Users size={16} className="mr-1" />
              <span className="font-semibold">Capacity:</span>{" "}
              {descModal.venue.capacity}
            </div>
            <div className="mb-2 text-gray-700 flex items-center">
              {(() => {
                const venue = descModal.venue;
                const avgRating = venue?.rating ?? 0;
                return (
                  <>
                    <Star size={16} className="mr-1 text-gray-700 " />
                    <span className="font-semibold">Average Rating:</span>
                    <span className="ml-1 flex items-center">
                      {avgRating > 0 ? (
                        <>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={18}
                              className={
                                avgRating >= star
                                  ? "fill-current text-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                          <span className="ml-2 font-medium">
                            {avgRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="ml-2">No ratings yet</span>
                      )}
                    </span>
                  </>
                );
              })()}
            </div>
            <div className="mb-2 text-gray-700 flex items-center">
              <Calendar size={16} className="mr-1" />
              <span className="font-semibold">Event Type:</span>{" "}
              {descModal.venue.eventType || descModal.venue.type || "-"}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Status:</span>{" "}
              {descModal.venue.status}
            </div>
            {descModal.venue.amenities &&
              descModal.venue.amenities.length > 0 && (
                <div className="mb-2 text-gray-700">
                  <span className="font-semibold">Amenities:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {descModal.venue.amenities.map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

            {descModal.venue.updated_at && (
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Updated At:</span>{" "}
                {new Date(descModal.venue.updated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Booking Modal */}
      <BookingModal
        open={bookingModal.open}
        venue={bookingModal.venue}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        bookedDates={bookedDates}
        onClose={() => setBookingModal({ open: false, venue: undefined })}
        onConfirm={handleBookNow}
        loading={bookingLoading}
      />
    </div>
  );
}
