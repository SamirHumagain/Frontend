import axiosInstance from "./urls";

// Get bookings for venues owned by the current user (venue owner dashboard)
export const getOwnerVenueBookings = () => {
  return axiosInstance.get("/api/venues/owner/bookings/");
};

// Approve a booking (reservation) by owner
export const approveBooking = (bookingId: number) => {
  return axiosInstance.patch(`/api/reservations/${bookingId}/approve/`);
};

// Reject a booking (reservation) by owner
export const rejectBooking = (bookingId: number) => {
  return axiosInstance.patch(`/api/reservations/${bookingId}/reject/`);
};
