import axiosInstance from "./urls";

export const approveVenue = (venueId: number) => {
  return axiosInstance.patch(`/api/venues/${venueId}/`, { status: "approved" });
};

export const rejectVenue = (venueId: number) => {
  return axiosInstance.patch(`/api/venues/${venueId}/`, { status: "rejected" });
};
