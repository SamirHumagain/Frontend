// This page will likely display a list of venues and their details.
// API Needed: GET /api/venues/, GET /api/venues/:id/
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Star, MapPin, Users, Heart } from "lucide-react";
import { getVenueList } from "../Api/getapi";
import { Venue } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface VenuesProps {
  onPageChange: (page: string) => void;
}

export function Venues({ onPageChange }: VenuesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const venueTypes = [
    { value: "all", label: "All Types" },
    { value: "wedding", label: "Wedding" },
    { value: "corporate", label: "Corporate" },
    { value: "birthday", label: "Birthday" },
    { value: "conference", label: "Conference" },
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "budget", label: "Under $1,000" },
    { value: "mid", label: "$1,000 - $2,000" },
    { value: "premium", label: "Over $2,000" },
  ];

  useEffect(() => {
    setLoading(true);
    getVenueList()
      .then((res) => {
        setVenues(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load venues");
        setLoading(false);
      });
  }, []);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || venue.type === selectedType;
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "budget" && venue.price < 1000) ||
      (priceRange === "mid" && venue.price >= 1000 && venue.price <= 2000) ||
      (priceRange === "premium" && venue.price > 2000);

    return matchesSearch && matchesType && matchesPrice;
  });

  const toggleFavorite = (venueId: string) => {
    setFavorites((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  const handleBookNow = (venue: Venue) => {
    if (!isAuthenticated) {
      onPageChange("login");
      return;
    }
    // Handle booking logic here
    alert(`Booking ${venue.name} - This would open the booking form`);
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
            <div className="flex flex-wrap gap-4">
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
            {filteredVenues.map((venue, index) => (
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
                    src={venue.images?.[0] || "/placeholder.jpg"}
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

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={16} />
                    <span className="ml-1 text-sm">{venue.location}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {venue.description}
                  </p>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(venue.amenities?.slice(0, 3) || []).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-indigo-50 text-primary-700 text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
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
                        ${venue.price}
                      </div>
                      <div className="text-gray-500">per event</div>
                    </div>
                  </div>

                  {/* Book Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookNow(venue)}
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
    </div>
  );
}
