// Get bookings for the current user (user dashboard)
export const getUserBookings = () => {
  return axiosInstance.get("/api/user-dashboard/bookings/");
};

import axiosInstance from "./urls";

export const getVenueList = () => {
  return axiosInstance.get("/api/venues/");
};

// Get venues for the current owner (venue owner dashboard)
export const getOwnerVenueList = () => {
  return axiosInstance.get("/api/venues/owner/");
};

export const getEventList = () => {
  return axiosInstance.get("/api/events/");
};

export const getReservationList = () => {
  return axiosInstance.get("/api/reservations/");
};

export const getServiceList = () => {
  return axiosInstance.get("/api/services/");
};

export const getAdminDashboardStats = () => {
  return axiosInstance.get("/api/admin-dashboard/stats/");
};

export const getAdminUserList = () => {
  return axiosInstance.get("/api/admin-dashboard/users/");
};

export const getAdminVenueList = () => {
  return axiosInstance.get("/api/admin-dashboard/venues/");
};

export const getAdminBookingList = () => {
  return axiosInstance.get("/api/admin-dashboard/bookings/");
};
