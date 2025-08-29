// Permanently delete a user (admin only)
export const deleteUser = (userId: number) => {
  return axiosInstance.delete(`/api/users/${userId}/`);
};
// Create an event (needed before booking a reservation)
export const postEvent = (data: any) => {
  return axiosInstance.post("/api/events/", data);
};
// Book a venue (create reservation)
export const postBooking = (data: any) => {
  return axiosInstance.post("/api/reservations/", data);
};
// Suspend a user (toggle active/inactive)
export const suspendUser = (userId: number) => {
  return axiosInstance.patch(`/api/users/${userId}/`, { is_active: false });
};

// Cancel a booking (set status to 'cancelled')
export const cancelBooking = (bookingId: number) => {
  return axiosInstance.patch(`/api/reservations/${bookingId}/`, {
    status: "cancelled",
  });
};
import axiosInstance from "./urls";

export const postRegisterApi = (data: any) => {
  return axiosInstance.post("/auth/register/user/", data);
};

export const postLoginApi = (data: any) => {
  return axiosInstance.post("/api/auth/login/", data);
};

export const postVenuelist = (data: any) => {
  return axiosInstance.post("/api/venues/", data);
};

export const updateVenue = (id: string | number, data: any) => {
  return axiosInstance.put(`/api/venues/${id}/`, data);
};

export const deleteVenue = (id: string | number) => {
  return axiosInstance.delete(`/api/venues/${id}/`);
};
