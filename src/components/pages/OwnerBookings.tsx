import { useEffect, useState } from "react";
import axiosInstance from "../Api/urls";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Venue } from "../../types";

interface Reservation {
  id: number;
  event: {
    id: number;
    name: string;
    date: string;
    venue: Venue;
    organizer: number;
  };
  user: number;
  reserved_at: string;
  status: string;
}

export default function OwnerBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all reservations, filter for venues owned by current user
    axiosInstance
      .get("/reservations/")
      .then((res) => {
        const all = res.data;
        const ownerBookings = all.filter(
          (r: Reservation) => r.event.venue.owner === user?.id
        );
        setBookings(ownerBookings);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load bookings");
        setLoading(false);
      });
  }, [user]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await axiosInstance.post(`/reservations/${id}/${action}/`);
      toast.success(`Booking ${action}d!`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: action === "approve" ? "approved" : "rejected" }
            : b
        )
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || `Failed to ${action} booking`);
    }
  };

  if (loading) return <div>Loading bookings...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">
        Pending Bookings for Your Venues
      </h2>
      {bookings.length === 0 && <div>No bookings found.</div>}
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white rounded shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="font-semibold">Event: {b.event.name}</div>
            <div className="flex items-center gap-2 mb-1">
              {b.event.venue && (
                <span className="font-semibold">Venue Rating:</span>
              )}
              {b.event.venue &&
                (b.event.venue.num_ratings === 0 ? (
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
                            Math.round(Number(b.event.venue.bayesian_rating))
                              ? "#FFD700"
                              : "#E5E7EB",
                        }}
                      >
                        {i < Math.round(Number(b.event.venue.bayesian_rating))
                          ? "★"
                          : "☆"}
                      </span>
                    ))}
                    <span className="ml-2 text-gray-600 text-base">
                      ({b.event.venue.bayesian_rating})
                    </span>
                  </>
                ))}
            </div>
            <div>Date: {new Date(b.event.date).toLocaleString()}</div>
            <div>Booked by User ID: {b.user}</div>
            <div>
              Status:{" "}
              <span
                className={`font-bold ${
                  b.status === "pending"
                    ? "text-yellow-600"
                    : b.status === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {b.status}
              </span>
            </div>
          </div>
          {b.status === "pending" && (
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => handleAction(b.id, "approve")}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(b.id, "reject")}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
