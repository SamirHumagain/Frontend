import React, { useState } from "react";
import { motion } from "framer-motion";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues: {
    venueName: string;
    description: string;
    price: number | "";
    eventType: string;
    imageUrl: string;
    selectedPosition: { lat: number; lng: number } | null;
    currentPosition: { lat: number; lng: number } | null;
    capacity: number | "";
    locationName: string;
  };
}

const EditVenueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [venueName, setVenueName] = useState(initialValues.venueName);
  const [description, setDescription] = useState(initialValues.description);
  const [price, setPrice] = useState(initialValues.price);
  const [eventType, setEventType] = useState(initialValues.eventType);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [selectedPosition, setSelectedPosition] = useState(
    initialValues.selectedPosition
  );
  const [currentPosition] = useState(initialValues.currentPosition);
  const [capacity, setCapacity] = useState(initialValues.capacity);
  const [locationName, setLocationName] = useState(initialValues.locationName);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDEZNctYz8EiBhizEvcVarfBgH7My1fGxM",
    id: "google-map-script",
  });

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Venue</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </motion.button>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              venueName,
              description,
              price,
              eventType,
              imageUrl,
              selectedPosition,
              capacity,
              locationName,
            });
          }}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Enter venue name"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g. 100"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="e.g. Banepa, Kathmandu, etc."
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (preferred)
            </label>
            <input
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="https://example.com/images/grand-hall.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent  outline-none"
              placeholder="Describe your venue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Event
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent  outline-none"
                placeholder="USD"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent  outline-none"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Birthday">Birthday</option>
                <option value="Conference">Conference</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location on Map
            </label>
            {isLoaded && isOpen ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "12px",
                }}
                center={
                  currentPosition ||
                  selectedPosition || { lat: 40.7128, lng: -74.006 }
                }
                zoom={currentPosition ? 14 : selectedPosition ? 14 : 10}
                onClick={handleMapClick}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* Marker for selected venue location */}
                {selectedPosition && <Marker position={selectedPosition} />}

                {/* Marker for current user location */}
                {currentPosition && (
                  <Marker
                    position={currentPosition}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Loading Map...</p>
              </div>
            )}

            {selectedPosition && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedPosition.lat.toFixed(5)},{" "}
                {selectedPosition.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
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
      </motion.div>
    </div>
  );
};

export default EditVenueModal;
