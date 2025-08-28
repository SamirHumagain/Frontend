// This page will likely display a list of venues and their details.
// API Needed: GET /api/venues/, GET /api/venues/:id/
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { postBooking, postEvent } from "../Api/postapi";
import toast from "react-hot-toast";

import { Venue } from "../../types";
import { useAuth } from "../../context/AuthContext";

export function Venues() {
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
    if (venue.location && venue.location.trim() !== "") return venue.location;
    if (venue.lat != null && venue.lng != null)
      return `${venue.lat.toFixed(5)}, ${venue.lng.toFixed(5)}`;
    return "N/A";
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useAuth();

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
      toast.success("Venue booked successfully!");
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

  // Only show venues with status 'approved'
  const filteredVenues: Venue[] = venues.filter((venue) => {
    const matchesType = selectedType === "all" || venue.type === selectedType;
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

  // Toggle favorite handler
  const toggleFavorite = (venueId: string) => {
    setFavorites((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

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
          <div className="mb-8">
            <p className="text-gray-600">
              Showing {filteredVenues.length} venue
              {filteredVenues.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVenues.map((venue: Venue, index: number) => (
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
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(venue.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors ${
                      favorites.includes(venue.id)
                        ? "bg-red-500 text-white"
                        : "bg-white/80 text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={
                        favorites.includes(venue.id) ? "currentColor" : "none"
                      }
                    />
                  </motion.button>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full capitalize">
                      {venue.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {venue.name}
                    </h3>
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="fill-current" size={16} />
                      <span className="ml-1 font-medium">{venue.rating}</span>
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                      onClick={() => setDescModal({ open: true, venue })}
                      title="View Venue Details"
                    >
                      <Eye size={18} />
                    </motion.button>
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
            ))}
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setDescModal({ open: false })}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">{descModal.venue.name}</h2>
            <img
              src={descModal.venue.image || "/placeholder.jpg"}
              alt={descModal.venue.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
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
              <Star size={16} className="mr-1" />
              <span className="font-semibold">Rating:</span>{" "}
              {descModal.venue.rating || 0}
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
            {descModal.venue.lat && descModal.venue.lng && (
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Coordinates:</span>{" "}
                {descModal.venue.lat}, {descModal.venue.lng}
              </div>
            )}
            {descModal.venue.created_at && (
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Created At:</span>{" "}
                {new Date(descModal.venue.created_at).toLocaleString()}
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
      {bookingModal.open && bookingModal.venue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setBookingModal({ open: false })}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">
              Book {bookingModal.venue.name}
            </h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                excludeDates={bookedDates}
                inline
                calendarClassName="!border !rounded-xl !shadow-lg !bg-white !p-4"
                dayClassName={(date) =>
                  `!rounded-full transition-all duration-150
                  ${
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString()
                      ? "bg-primary-600 text-white !font-bold"
                      : "hover:bg-primary-100 hover:text-primary-700"
                  }
                  ${
                    date.toDateString() === new Date().toDateString()
                      ? "ring-2 ring-primary-400"
                      : ""
                  }`
                }
                renderCustomHeader={({
                  date,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div className="flex items-center justify-between mb-4 px-2">
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
                      type="button"
                    >
                      <span className="text-lg">&#8592;</span>
                    </button>
                    <span className="font-semibold text-lg text-primary-700">
                      {date.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
                      type="button"
                    >
                      <span className="text-lg">&#8594;</span>
                    </button>
                  </div>
                )}
              />
              <div className="text-xs text-gray-500 mt-2">
                Unavailable dates are disabled.
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookNow}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300"
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
