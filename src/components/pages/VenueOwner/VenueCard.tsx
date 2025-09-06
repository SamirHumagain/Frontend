import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Calendar, Edit, Eye, Trash2 } from "lucide-react";

type Venue = any;

interface VenueCardProps {
  venue: Venue;
  index: number;
  statusColorFor: (status: string) => string;
  locationsById: Record<string, string>;
  onEdit: (venue: Venue) => void;
  onDelete: (id: string) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  index,
  statusColorFor,
  locationsById,
  onEdit,
  onDelete,
}) => {
  const handleViewDetails = () => {
    window.location.href = `/venues/${venue.id}`;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <img
        src={venue.image}
        alt={venue.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColorFor(
              venue.status
            )}`}
          >
            {venue.status}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin size={16} />
          <span className="ml-1 text-sm">
            {locationsById[venue.id] ||
              (venue.lat != null && venue.lng != null
                ? `${venue.lat.toFixed(5)}, ${venue.lng.toFixed(5)}`
                : "")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <span className="mr-1 text-lg font-bold">रु</span>
            {venue.price}
          </div>
          <div className="flex items-center text-gray-600">
            <Star size={16} className="mr-1" />
            {/* Show bayesian_rating if available, else fallback to rating, with 'No ratings yet' logic */}
            {venue.num_ratings === 0 ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#E5E7EB" }}>
                    ☆
                  </span>
                ))}
                <span className="ml-2 text-gray-600 text-sm">
                  No ratings yet
                </span>
              </>
            ) : (
              <>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      color:
                        i < Math.round(Number(venue.bayesian_rating))
                          ? "#FFD700"
                          : "#E5E7EB",
                    }}
                  >
                    {i < Math.round(Number(venue.bayesian_rating)) ? "★" : "☆"}
                  </span>
                ))}
                <span className="ml-2 text-gray-600 text-base">
                  ({venue.bayesian_rating})
                </span>
              </>
            )}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-1" />
            {venue.bookings} bookings
          </div>
        </div>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center justify-center gap-1"
            onClick={() => onEdit(venue)}
          >
            <Edit size={16} />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={handleViewDetails}
          >
            <Eye size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
            onClick={() => onDelete(venue.id)}
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueCard;
