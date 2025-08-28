import axiosInstance from "./urls";

export const updateBooking = (bookingId: number, data: any) => {
  return axiosInstance.patch(`/api/reservations/${bookingId}/`, data);
};

export const getBookingDetail = (bookingId: number) => {
  return axiosInstance.get(`/api/reservations/${bookingId}/`);
};
