import React, { useEffect, useState } from "react";
import BookingModal from "../BookingModal";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Modal from "../Modal";
import { Venue, Service, VenueImage } from "../../types";
import ImageCarousel from "../ImageCarousel";

const eventTypes = [
  { label: "Wedding", value: "wedding" },
  { label: "Birthday", value: "birthday" },
  { label: "Corporate", value: "corporate" },
  { label: "Conference", value: "conference" },
];

const VenueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  // Booking modal logic (copied from Venues.tsx)
  const openBookingModal = async () => {
    setSelectedDate(null);
    setBookingModalOpen(true);
    try {
      const res = await fetch(`/api/venues/${id}/events/`);
      const data = await res.json();
      const dates = (data || []).map((ev: any) => new Date(ev.date));
      setBookedDates(dates);
    } catch {
      setBookedDates([]);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      alert("You have to login for booking");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
    setBookingLoading(true);
    try {
      const res = await fetch(`/api/events/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({
          name: `Event for Venue ${venue?.id}`,
          date: selectedDate?.toISOString().split("T")[0],
          venue: venue?.id,
        }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(
          `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
        );
        setBookingLoading(false);
        return;
      }
      alert("Booking confirmed!");
      setBookingModalOpen(false);
    } catch (e) {
      alert("Booking failed.");
    }
    setBookingLoading(false);
  };
  const [eventType, setEventType] = useState<string>("");
  const [guests, setGuests] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [images, setImages] = useState<VenueImage[]>([]);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/venues/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setVenue(data);
        setServices(data.services || []);
        setImages(data.images || []);
        setLoading(false);
      });
  }, [id]);

  // Owner check
  const isOwner = user && venue && user.id === venue.owner;

  // Calculate price
  const basePrice = venue?.price || 0;
  const guestPrice = guests * 10;
  const servicesPrice = selectedServices
    .map((sid) => services.find((s) => s.id === sid)?.price || 0)
    .reduce((a, b) => a + b, 0);
  const totalPrice = basePrice + guestPrice + servicesPrice;

  // Venue amenities
  const amenities = venue?.amenities || [];

  // Owner panel handlers
  const handleAddService = async (service: Partial<Service>) => {
    const res = await fetch(`/api/services/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify({ ...service, venue: venue?.id }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setServices([...services, result]);
  };

  const handleDeleteService = async (serviceId: string) => {
    const res = await fetch(`/api/services/${serviceId}/`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const result = await res.json();
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const handleAddImage = async (imageUrl: string) => {
    const res = await fetch(`/api/venue-images/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify({ image: imageUrl, venue: venue?.id }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setImages([...images, result]);
  };

  const handleDeleteImage = async (imageId: string) => {
    const res = await fetch(`/api/venue-images/${imageId}/`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    });
    if (!res.ok) {
      const result = await res.json();
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setImages(images.filter((img) => img.id !== imageId));
  };

  if (loading) return <div>Loading...</div>;
  if (!venue) return <div>Venue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-2xl">
      {/* Owner Panel */}
      {isOwner && (
        <div className="mb-8">
          <button
            className="px-4 py-2 bg-primary-700 text-white rounded-lg mb-2"
            onClick={() => setOwnerPanelOpen((v) => !v)}
          >
            {ownerPanelOpen ? "Hide" : "Show"} Owner Management Panel
          </button>
          {ownerPanelOpen && (
            <div className="p-4 bg-primary-50 rounded-xl shadow mb-4">
              <h2 className="text-xl font-bold mb-2">Manage Services</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (
                    form.elements.namedItem("name") as HTMLInputElement
                  ).value;
                  const price = parseFloat(
                    (form.elements.namedItem("price") as HTMLInputElement).value
                  );
                  await handleAddService({ name, price });
                  form.reset();
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  name="name"
                  placeholder="Service Name"
                  className="border px-2 py-1 rounded"
                  required
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  className="border px-2 py-1 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-1 rounded"
                >
                  Add
                </button>
              </form>
              <ul>
                {services.map((service) => (
                  <li key={service.id} className="flex items-center gap-2 mb-2">
                    <span>
                      {service.name} (₹{service.price})
                    </span>
                    <button
                      className="text-red-600 ml-2"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
              <h2 className="text-xl font-bold mt-6 mb-2">Manage Images</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const image = (
                    form.elements.namedItem("image") as HTMLInputElement
                  ).value;
                  await handleAddImage(image);
                  form.reset();
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  name="image"
                  placeholder="Image URL"
                  className="border px-2 py-1 rounded"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-4 py-1 rounded"
                >
                  Add
                </button>
              </form>
              <ul className="flex gap-2 flex-wrap">
                {images.map((img) => (
                  <li key={img.id} className="relative">
                    <img
                      src={img.image}
                      alt="Venue"
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white rounded px-2 py-1 text-xs"
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Venue Summary Card */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-2/3">
          <ImageCarousel
            images={
              images.length > 0 ? images.map((img) => img.image) : [venue.image]
            }
          />
        </div>
        <div className="md:w-1/3 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary-700 mb-2 leading-tight">
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              {venue.rating && (
                <span className="text-yellow-500 font-bold text-lg">
                  ★ {venue.rating}
                </span>
              )}
              {venue.reviews && (
                <span className="text-gray-500 text-sm">
                  ({venue.reviews} reviews)
                </span>
              )}
            </div>
            <div className="text-gray-600 mb-2">
              <span className="font-semibold">Location:</span>{" "}
              {venue.location || venue.location_name}
            </div>
            <div className="text-gray-600 mb-2">
              <span className="font-semibold">Capacity:</span> {venue.capacity}{" "}
              guests
            </div>
            <div className="text-gray-600 mb-2">
              <span className="font-semibold">Type:</span>{" "}
              {venue.type || venue.eventType}
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary-50 rounded-xl shadow flex flex-col items-start">
            <span className="text-3xl font-bold text-primary-700">
              ₹{venue.price}
            </span>
            <span className="text-gray-500">Base Price</span>
          </div>
        </div>
      </div>

      <hr className="my-6 border-primary-100" />

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary-700 mb-2">
          About this Venue
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          {venue.description}
        </p>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary-700 mb-2">
          Amenities
        </h2>
        <ul className="flex flex-wrap gap-3">
          {amenities.map((a, i) => (
            <li
              key={i}
              className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-base shadow"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Event Services */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary-700 mb-2">
          Event Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-3 bg-primary-50 rounded-xl p-4 shadow"
            >
              <div className="flex-1">
                <div className="font-bold text-primary-700 text-lg">
                  {service.name}
                </div>
                <div className="text-primary-600 font-semibold">
                  ₹{service.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-8 gap-4">
        <button
          className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl shadow-lg hover:scale-105 transition-all font-semibold text-lg"
          onClick={() => setPlannerOpen(true)}
        >
          Plan Your Event
        </button>
        <button
          className="px-8 py-3 bg-luxury-gradient text-white rounded-xl shadow-lg hover:scale-105 transition-all font-semibold text-lg"
          onClick={openBookingModal}
        >
          Book Now
        </button>
      </div>
      {/* Booking Modal (shared) */}
      <BookingModal
        open={bookingModalOpen}
        venue={venue}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        bookedDates={bookedDates}
        onClose={() => setBookingModalOpen(false)}
        onConfirm={handleBookNow}
        loading={bookingLoading}
      />

      {/* Event Planner Modal */}
      <Modal isOpen={plannerOpen} onClose={() => setPlannerOpen(false)}>
        <h2 className="text-3xl font-bold mb-6 text-primary-700 text-center">
          Event Planning
        </h2>
        <form className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Event Type</label>
            <select
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">Select event type</option>
              {eventTypes.map((et) => (
                <option key={et.value} value={et.value}>
                  {et.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Number of Guests</label>
            <input
              type="number"
              min={1}
              max={venue.capacity}
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder={`Max ${venue.capacity}`}
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Select Services</label>
            <div className="flex flex-wrap gap-3">
              {services.map((service) => (
                <label
                  key={service.id}
                  className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full cursor-pointer shadow"
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices([...selectedServices, service.id]);
                      } else {
                        setSelectedServices(
                          selectedServices.filter((sid) => sid !== service.id)
                        );
                      }
                    }}
                  />
                  <span>{service.name}</span>
                  <span className="text-primary-600 font-semibold">
                    ₹{service.price}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-2">Special Requests</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests?"
            />
          </div>
          <div className="mt-6 p-6 bg-primary-50 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary-700 mb-2">
              Total Price: ₹{Number(totalPrice || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              (Base: ₹{Number(basePrice || 0).toFixed(2)} + Guests: ₹
              {Number(guestPrice || 0).toFixed(2)} + Services: ₹
              {Number(servicesPrice || 0).toFixed(2)})
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition-all text-lg"
            onClick={() => setPlannerOpen(false)}
          >
            Confirm & Close
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default VenueDetails;
