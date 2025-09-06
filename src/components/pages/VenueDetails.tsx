import React, { useEffect, useState } from "react";
import BookingModal from "../BookingModal";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Modal from "../Modal";
import { Venue, Service, VenueImage } from "../../types";
import ImageCarousel from "../ImageCarousel";
import "./VenueDetailsOverrides.css";

const VenueDetails: React.FC = () => {
  // ...existing code...
  // All hooks, logic, and variables are declared above
  // Now return the full VenueDetails UI at the end
  // ...existing code...
  // Place the full JSX here at the end of the function
  const { id } = useParams<{ id: string }>();
  const [cateringServices, setCateringServices] = useState<Service[]>([]);
  // Planner modal state with localStorage persistence
  const PLANNER_KEY = `planner_${id}`;
  const getPlannerState = () => {
    try {
      const raw = localStorage.getItem(PLANNER_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const initialPlanner = getPlannerState();
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
    initialPlanner.selectedEventTypes || []
  );
  const [guests, setGuests] = useState<number>(initialPlanner.guests || 0);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialPlanner.selectedServices || []
  );
  const [selectedCatering, setSelectedCatering] = useState<string[]>(
    initialPlanner.selectedCatering || []
  );
  const [eventTypesList, setEventTypesList] = useState<
    { id: string; name: string; price?: number }[]
  >([]);

  // Save planner state to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      PLANNER_KEY,
      JSON.stringify({
        selectedEventTypes,
        guests,
        selectedServices,
        selectedCatering,
      })
    );
  }, [
    selectedEventTypes,
    guests,
    selectedServices,
    selectedCatering,
    PLANNER_KEY,
  ]);
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
      alert("Booking Requested!");
      setBookingModalOpen(false);
    } catch (e) {
      alert("Booking failed.");
    }
    setBookingLoading(false);
  };
  const [services, setServices] = useState<Service[]>([]);
  // Track original images and new images separately
  const [originalImages, setOriginalImages] = useState<VenueImage[]>([]);
  const [newImages, setNewImages] = useState<VenueImage[]>([]);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/venues/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setVenue(data);
        setOriginalImages(data.images || []);
        setNewImages([]); // Only reset new images on venue change (not after add)
        setLoading(false);
      });
    // Always fetch services from the correct endpoint
    fetch(`/api/eventplanner/services/?venue=${id}`)
      .then((res) => res.json())
      .then((data) => setServices(data || []));
    // Fetch catering services
    fetch(`/api/eventplanner/venues/${id}/catering-items/`)
      .then((res) => res.json())
      .then((data) => setCateringServices(data || []));
    // Fetch event types
    fetch(`/api/eventplanner/event-types/`)
      .then((res) => res.json())
      .then((data) => setEventTypesList(data || []));
  }, [id]);

  // Owner check
  const isOwner =
    user?.id != null && venue?.owner != null && user?.id === venue?.owner;

  // Calculate price
  const {
    totalPrice,
    basePrice,
    servicesPrice,
    cateringPrice,
    cateringAvg,
    eventTypePrice,
  } = React.useMemo((): {
    totalPrice: number;
    basePrice: number;
    servicesPrice: number;
    cateringPrice: number;
    cateringAvg: number;
    eventTypePrice: number;
  } => {
    const basePrice: number = Number(venue?.price) || 0;
    const servicesPriceArr: number[] = selectedServices.map(
      (sid) => Number(services.find((s) => s.id === sid)?.price) || 0
    );
    const servicesPrice: number = servicesPriceArr.reduce((a, b) => a + b, 0);
    const selectedCateringPrices: number[] = selectedCatering.map(
      (sid) => Number(cateringServices.find((s) => s.id === sid)?.price) || 0
    );
    const cateringAvg: number =
      selectedCateringPrices.length > 0
        ? selectedCateringPrices.reduce((a, b) => a + b, 0) /
          selectedCateringPrices.length
        : 0;
    const cateringPrice: number = cateringAvg * guests;
    // Single price per event type (not multiplied by guests)
    // Flat fee for event type, not multiplied by guests
    const eventTypePrice: number = selectedEventTypes.reduce((sum, eid) => {
      const et = eventTypesList.find((et) => String(et.id) === eid);
      return sum + (et && et.price ? Number(et.price) : 0);
    }, 0);
    const totalPrice: number =
      cateringPrice > 0
        ? basePrice + servicesPrice + cateringPrice + eventTypePrice
        : basePrice + servicesPrice + eventTypePrice;
    return {
      totalPrice,
      basePrice,
      servicesPrice,
      cateringPrice,
      cateringAvg,
      eventTypePrice,
    };
  }, [
    venue,
    selectedServices,
    services,
    selectedCatering,
    cateringServices,
    guests,
    selectedEventTypes,
    eventTypesList,
  ]);

  // Owner panel handlers
  // Catering service handlers
  const handleAddCatering = async (service: Partial<Service>) => {
    // Add catering service for venue
    const payload = {
      ...service,
      venue: venue?.id,
    };
    const res = await fetch(`/api/eventplanner/venues/${id}/catering-items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setCateringServices([...cateringServices, result]);
  };

  const handleDeleteCatering = async (serviceId: string) => {
    const res = await fetch(`/api/eventplanner/catering-items/${serviceId}/`, {
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
    setCateringServices(cateringServices.filter((s) => s.id !== serviceId));
  };

  // Event type handlers
  const handleAddEventType = async (eventType: {
    name: string;
    price?: number;
  }) => {
    // Use name as label if label not provided
    const payload = { ...eventType, label: eventType.name, venue: venue?.id };
    const res = await fetch(`/api/eventplanner/event-types/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(
        `Error: ${res.status} - ${result.detail || JSON.stringify(result)}`
      );
      return;
    }
    setEventTypesList([...eventTypesList, result]);
  };

  const handleDeleteEventType = async (eventTypeId: string) => {
    const res = await fetch(`/api/eventplanner/event-types/${eventTypeId}/`, {
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
    setEventTypesList(eventTypesList.filter((et) => et.id !== eventTypeId));
  };
  const handleAddService = async (service: Partial<Service>) => {
    const res = await fetch(`/api/eventplanner/services/`, {
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
    const res = await fetch(`/api/eventplanner/services/${serviceId}/`, {
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
    const res = await fetch(`/api/eventplanner/venue-images/`, {
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
    // After adding, reload venue to get updated original images
    fetch(`/api/venues/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setOriginalImages(data.images || []);
        setNewImages([]);
      });
  };
  // (Removed duplicate setNewImages)

  const handleDeleteImage = async (imageId: string) => {
    // Delete from backend
    const res = await fetch(`/api/eventplanner/venue-images/${imageId}/`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
    });
    if (!res.ok) {
      let result = {};
      try {
        result = await res.json();
      } catch {}
      alert(
        `Error: ${res.status} - ${
          "detail" in result ? (result as any).detail : JSON.stringify(result)
        }`
      );
      return;
    }
    // After successful delete, reload images from backend
    fetch(`/api/venues/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setOriginalImages(data.images || []);
        setNewImages([]);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!venue) return <div>Venue not found.</div>;

  return (
    <div className=" mx-auto p-8 bg-white rounded-2xl shadow-2xl venue-details-fullwidth">
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
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  {/* Debug output for images removed */}
                  <h2 className="text-xl font-bold mb-2">Manage Services</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (
                        form.elements.namedItem("name") as HTMLInputElement
                      ).value;
                      const price = parseFloat(
                        (form.elements.namedItem("price") as HTMLInputElement)
                          .value
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
                      <li
                        key={service.id}
                        className="flex items-center gap-2 mb-2"
                      >
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
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    Manage Catering Services
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (
                        form.elements.namedItem(
                          "catering_name"
                        ) as HTMLInputElement
                      ).value;
                      const price = parseFloat(
                        (
                          form.elements.namedItem(
                            "catering_price"
                          ) as HTMLInputElement
                        ).value
                      );
                      const type = (
                        form.elements.namedItem(
                          "catering_type"
                        ) as HTMLSelectElement
                      ).value;
                      await handleAddCatering({ name, price, type });
                      form.reset();
                    }}
                    className="flex gap-2 mb-4"
                  >
                    <input
                      name="catering_name"
                      placeholder="Catering Name"
                      className="border px-2 py-1 rounded"
                      required
                    />
                    <input
                      name="catering_price"
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="border px-2 py-1 rounded"
                      required
                    />
                    <select
                      name="catering_type"
                      className="border px-2 py-1 rounded"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="snack">Snack</option>
                      <option value="main_course">Main Course</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-4 py-1 rounded"
                    >
                      Add
                    </button>
                  </form>
                  <ul>
                    {cateringServices.map((service) => (
                      <li
                        key={service.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <span>
                          {service.name} (₹{service.price}){" "}
                          <span className="ml-2 text-xs text-gray-600">
                            [{service.type || "N/A"}]
                          </span>
                        </span>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => handleDeleteCatering(service.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 mt-8">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Manage Images</h2>
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
                    {[...originalImages, ...newImages].map((img) => (
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
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Manage Event Types</h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (
                        form.elements.namedItem(
                          "eventtype_name"
                        ) as HTMLInputElement
                      ).value;
                      const price = parseFloat(
                        (
                          form.elements.namedItem(
                            "eventtype_price"
                          ) as HTMLInputElement
                        ).value
                      );
                      await handleAddEventType({ name, price });
                      form.reset();
                    }}
                    className="flex gap-2 mb-4"
                  >
                    <input
                      name="eventtype_name"
                      placeholder="Event Type Name"
                      className="border px-2 py-1 rounded"
                      required
                    />
                    <input
                      name="eventtype_price"
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
                    {eventTypesList.map((et) => (
                      <li key={et.id} className="flex items-center gap-2 mb-2">
                        <span>
                          {et.name} {et.price ? `(₹${et.price})` : null}
                        </span>
                        <button
                          className="text-red-600 ml-2"
                          onClick={() => handleDeleteEventType(et.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Venue Summary Card */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <ImageCarousel
            images={
              [...originalImages, ...newImages]
                .map((img: VenueImage) => img.image)
                .filter((img: string) => !!img).length > 0
                ? [...originalImages, ...newImages]
                    .map((img: VenueImage) => img.image)
                    .filter((img: string) => !!img)
                : ([venue?.image].filter(Boolean) as string[])
            }
          />
        </div>
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-primary-700 mb-2 leading-tight">
                {venue?.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-32">
                <div>
                  {venue?.bayesian_rating !== undefined && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">
                        {venue.num_ratings === 0 ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ color: "#E5E7EB" }}>
                                ☆
                              </span>
                            ))}
                            <span className="ml-2 text-gray-600 text-base">
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
                                    i <
                                    Math.round(Number(venue.bayesian_rating))
                                      ? "#FFD700"
                                      : "#E5E7EB",
                                }}
                              >
                                {i < Math.round(Number(venue.bayesian_rating))
                                  ? "★"
                                  : "☆"}
                              </span>
                            ))}
                            <span className="ml-2 text-gray-600 text-base">
                              ({venue.bayesian_rating})
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="text-gray-600 mb-2">
                    <span className="font-semibold">Location:</span>{" "}
                    {venue?.location || venue?.location_name}
                  </div>
                  <div className="text-gray-600 mb-2">
                    <span className="font-semibold">Capacity:</span>{" "}
                    {venue?.capacity} guests
                  </div>
                </div>
                {/* Owner Info beside venue info */}
                {venue?.owner_details && (
                  <div className="p-2 bg-primary-50 rounded-lg shadow flex flex-col gap-1 min-w-[220px] w-full md:w-[320px] text-sm">
                    <h3 className="text-base font-bold text-primary-700 mb-1">
                      Venue Owner
                    </h3>
                    <div className="text-gray-700">
                      <span className="font-semibold">Name:</span>{" "}
                      {venue.owner_details.name}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Email:</span>{" "}
                      {venue.owner_details.email}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Phone:</span>{" "}
                      {venue.owner_details.phone}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">Address:</span>{" "}
                      {venue.owner_details.address}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-primary-50 rounded-xl shadow flex flex-col items-start">
                <span className="text-3xl font-bold text-primary-700">
                  ₹{venue?.price}
                </span>
                <span className="text-gray-500">Base Price</span>
              </div>
            </div>
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
          {venue?.description}
        </p>
      </div>

      {/* Event Services */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Event Services */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary-700 mb-2">
              Event Services
            </h2>
            <div className="grid grid-cols-2 gap-4">
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
          {/* Catering Services */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-primary-700 mb-2">
              Catering Services
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {cateringServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 bg-primary-50 rounded-xl p-4 shadow"
                >
                  <div className="flex-1">
                    <div className="font-bold text-primary-700 text-lg">
                      {service.name}
                      <span className="ml-2 text-xs text-gray-600">
                        [{service.type || "N/A"}]
                      </span>
                    </div>
                    <div className="text-primary-600 font-semibold">
                      ₹{service.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
      <Modal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
        modalClassName="venue-details-modal-wide"
      >
        <h2 className="text-3xl font-bold mb-6 text-primary-700 text-center">
          Event Planning
        </h2>
        <form className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Event Type</label>
            <select
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={selectedEventTypes[0] || ""}
              onChange={(e) =>
                setSelectedEventTypes(e.target.value ? [e.target.value] : [])
              }
            >
              <option value="">Select an event type</option>
              {eventTypesList.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                  {et.price ? ` (₹${et.price})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Number of Guests</label>
            <input
              type="number"
              min={1}
              max={venue?.capacity}
              className="w-full border rounded-lg px-4 py-2 focus:outline-primary-500"
              value={guests === 0 ? "" : guests}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val > (venue?.capacity || 1)) val = venue?.capacity || 1;
                setGuests(val);
              }}
              placeholder={`Max ${venue?.capacity}`}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <label className="block font-semibold mb-2">
                Select Services
              </label>
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
                          setSelectedServices([
                            ...selectedServices,
                            service.id,
                          ]);
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
            <div className="flex-1">
              <label className="block font-semibold mb-2">
                Select Catering Services
              </label>
              <div className="flex flex-wrap gap-3">
                {cateringServices.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full cursor-pointer shadow"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCatering.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCatering([
                            ...selectedCatering,
                            service.id,
                          ]);
                        } else {
                          setSelectedCatering(
                            selectedCatering.filter((sid) => sid !== service.id)
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
          </div>
          <div className="mt-6 p-6 bg-primary-50 rounded-xl text-center">
            <div className="text-2xl font-bold text-primary-700 mb-2">
              Total Price: ₹{Number(totalPrice || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              (Base: ₹{Number(basePrice || 0).toFixed(2)} + Services: ₹
              {Number(servicesPrice || 0).toFixed(2)} + Catering: ₹
              {Number(cateringPrice || 0).toFixed(2)} (Avg: ₹
              {Number(cateringAvg || 0).toFixed(2)} × Guests: {guests}) + Event
              Types: ₹{Number(eventTypePrice || 0).toFixed(2)})
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
