import axiosInstance from "./urls";

// Get all events for a venue (to find booked dates)
export const getVenueEvents = (venueId: string | number) => {
  return axiosInstance.get(`/api/events/?venue=${venueId}`);
};
